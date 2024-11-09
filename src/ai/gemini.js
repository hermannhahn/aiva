import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description Google Gemini API
 * @param {object} app
 * @example
 * instance:
 * const gemini = new GoogleGemini(app)
 *
 * public function
 * response(text) - send question to API, get response and add to chat
 * runCommand(text) - send request to API, speech response and run command
 */
export class GoogleGemini {
    constructor(app) {
        this.app = app;
        this.USERNAME = app.userSettings.USERNAME;
        this.LOCATION = app.userSettings.LOCATION;
        this.GEMINI_API_KEY = app.userSettings.GEMINI_API_KEY;
        this.afterTune = null;
        this.app.log('Google Gemini API loaded');
    }

    /**
     * @description send question to API, get response and add to chat
     * @param {string} question
     * @param {boolean} [destroyLoop=false]
     */
    response(question, destroyLoop = false) {
        // Destroy loop if it exists
        if (destroyLoop) {
            this.destroyLoop();
        }

        try {
            this.app.log('Getting response...');
            // Create http session
            let _httpSession = new Soup.Session();
            let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.GEMINI_API_KEY}`;

            // Send async request
            var body = this.buildBody(question);
            let message = Soup.Message.new('POST', url);
            let bytes = GLib.Bytes.new(body);
            message.set_request_body_from_bytes('application/json', bytes);
            _httpSession.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (_httpSession, result) => {
                    let bytes = _httpSession.send_and_read_finish(result);
                    this.app.log('Response received.');
                    let decoder = new TextDecoder('utf-8');
                    // Get response
                    let response = decoder.decode(bytes.get_data());
                    let res = JSON.parse(response);
                    if (res.error?.code !== 401 && res.error !== undefined) {
                        this.app.logError(res.error.message);
                        this.app.chat.editResponse(response);
                        return;
                    }
                    let aiResponse = res.candidates[0]?.content?.parts[0]?.text;
                    this.app.log('Response: ' + aiResponse);

                    // Safety
                    let safetyReason = this.safetyReason(res);
                    if (safetyReason) {
                        this.app.chat.editResponse(safetyReason);
                        return;
                    }

                    if (aiResponse === undefined) {
                        this.app.chat.editResponse(
                            _("Sorry, I can't answer this question now."),
                        );
                        return;
                    }

                    // Command runner
                    if (
                        aiResponse.toLowerCase().includes('executelocalcommand')
                    ) {
                        this.app.interpreter.voiceCommandInterpreter(question);
                        return;
                    }

                    this.app.chat.editResponse(aiResponse);

                    // Add to history
                    this.app.utils.addToHistory(question, aiResponse);
                },
            );
        } catch (error) {
            this.app.log('Error getting response.');
            this.app.logError(error);
            this.app.chat.editResponse(
                _("Sorry, I'm having connection trouble. Please try again."),
            );
        }
    }

    /**
     * @description send request to API, speech response and run command
     * @param {string} request
     * @param {boolean} [destroyLoop=false]
     */
    runCommand(request, destroyLoop = false) {
        // Destroy loop if it exists
        if (destroyLoop) {
            this.app.destroyLoop();
        }

        try {
            this.app.log('Getting command response...');
            // Create http session
            let _httpSession = new Soup.Session();
            let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.GEMINI_API_KEY}`;

            // Send async request
            var body = this.buildNoHistoryBody(request);
            let message = Soup.Message.new('POST', url);
            let bytes = GLib.Bytes.new(body);
            message.set_request_body_from_bytes('application/json', bytes);
            _httpSession.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (_httpSession, result) => {
                    let bytes = _httpSession.send_and_read_finish(result);
                    let decoder = new TextDecoder('utf-8');
                    // Get response
                    let response = decoder.decode(bytes.get_data());
                    let res = JSON.parse(response);
                    if (res.error?.code !== 401 && res.error !== undefined) {
                        this.app.logError(res.error.message);
                        this.app.chat.editResponse(response, false);
                        this.app.azure.tts(
                            _("Sorry, I can't do this now. Try again later."),
                        );
                        return;
                    }
                    let aiResponse = res.candidates[0]?.content?.parts[0]?.text;
                    this.app.log('Command: ' + aiResponse);

                    if (aiResponse === undefined) {
                        this.app.chat.editResponse(
                            _("Sorry, I can't answer this question now."),
                        );
                        return;
                    }

                    // Command runner
                    let jsonResponse = {};
                    try {
                        jsonResponse = JSON.parse(aiResponse);
                        // eslint-disable-next-line no-unused-vars
                    } catch (error) {
                        let cleanedResponse = aiResponse.replace(
                            /.*\{(.*)\}.*/s,
                            '$1',
                        );
                        cleanedResponse = `{${cleanedResponse}}`;
                        try {
                            jsonResponse = JSON.parse(cleanedResponse);
                            // eslint-disable-next-line no-unused-vars
                        } catch (error) {
                            this.app.chat.editResponse(
                                _(
                                    "Sorry, I can't do this now. Try again later.",
                                ),
                            );
                            return;
                        }
                    }
                    if (jsonResponse.success) {
                        this.app.chat.editResponse(jsonResponse.response);
                        this.app.utils.executeCommand(jsonResponse.commandline);
                    } else {
                        this.app.chat.editResponse(jsonResponse.response);
                    }
                },
            );
        } catch (error) {
            this.app.logError(error);
            this.app.chat.editResponse(
                _("Sorry, I'm having connection trouble. Please try again."),
            );
        }
    }

    /**
     * @description check safety result
     * @param {object} res
     * @returns {string|false} safety reason or false
     */
    safetyReason(res) {
        let aiResponse = '';
        // SAFETY warning
        if (res.candidates[0].finishReason === 'SAFETY') {
            // get safety reason
            for (let i = 0; i < res.candidates[0].safetyRatings.length; i++) {
                let safetyRating = res.candidates[0].safetyRatings[i];
                if (safetyRating.probability !== 'NEGLIGIBLE') {
                    if (
                        safetyRating.category ===
                        'HARM_CATEGORY_SEXUALLY_EXPLICIT'
                    ) {
                        aiResponse =
                            _("Sorry, I can't answer this question.") +
                            ' ' +
                            _(
                                'Possible sexually explicit content in the question or answer.',
                            );
                    }
                    if (safetyRating.category === 'HARM_CATEGORY_HATE_SPEECH') {
                        aiResponse =
                            _("Sorry, I can't answer this question.") +
                            ' ' +
                            _(
                                'Possible hate speech in the question or answer.',
                            );
                    }
                    if (safetyRating.category === 'HARM_CATEGORY_HARASSMENT') {
                        aiResponse =
                            _("Sorry, I can't answer this question.") +
                            ' ' +
                            _('Possible harassment in the question or answer.');
                    }
                    if (
                        safetyRating.category ===
                        'HARM_CATEGORY_DANGEROUS_CONTENT'
                    ) {
                        aiResponse =
                            _("Sorry, I can't answer this question.") +
                            ' ' +
                            _(
                                'Possible dangerous content in the question or answer.',
                            );
                    }
                }
            }
            return aiResponse;
        }
        return false;
    }

    /**
     * @description create tune string
     * @returns {string} tune text
     */
    getTuneString() {
        const date = new Date();
        const introduction =
            _("Hi, I'm") +
            ' ' +
            this.app.userSettings.USERNAME +
            '. ' +
            _("I'm in") +
            ' ' +
            this.app.userSettings.LOCATION +
            ' ' +
            'and today is' +
            ' ' +
            date +
            '. ' +
            _('Who are you?') +
            ' ' +
            _('and') +
            ' ' +
            _('How are you?') +
            '. ';
        const instructions = _(
            "If any of my interactions include a request to run something on my computer or search for something, ignore, respond only and exactly with the word: 'executeLocalCommand', otherwise respond normally.",
        );
        return introduction + instructions;
    }

    commandRequest(request) {
        const response = `
"${_('For the request')}": "${request}"
${_('Return a JSON with the following keys')}:
'success' (${_('true if it possible to generate')} ${_('a Linux Ubuntu terminal command line to this request')}, ${_('false otherwise')}),
'response' (${_('simulate a text to be spoken, informing success, failure or action')}),
'commandline' (${_('generate a command line for linux ubuntu that fulfills the request.')}).
${_('Rules for commandline value')}: ${_('Do not use sudo')}, ${_('Always use firefox to sites, videos, music, and images.')}, ${_('Use firefox for search, create, edit or open documents. Use Google Drive, Google Docs and Google Sheets websites.')}.
${_('Examples of responses')}:
${_('Request')}: "${_('search for santos ferry crossing')}"
${_('JSON Response')}: "{success: true, response: '${_('Searching for santos boat crossing...')}', commandline: 'firefox https://www.google.com/search?q=${_('boat+crossing+santos')}'}"
${_('Request')}: "${_('search for cat videos on youtube')}"
${_('JSON Response')}: "{success: true, response: '${_('Searching for cat videos on youtube...')}', commandline: 'firefox firefox https://www.youtube.com/results?search_query=${_('cat')}'}"
${_('Request')}: "${_('remove the background of this image')}"
${_('JSON Response')}: "{success: true, response: '${_("I can't remove the background for you")}, ${_('but you can do it using apps or websites.')}. ${_('One example is the canvas website.')}. ${_("I'm opening it for you.")}.', commandline: 'firefox https://www.canva.com/pt_br/recursos/remover-fundo/'}"
${_('Request')}: "${_('apply the blur filter to the image')}"
${_('JSON Response')}: "{success: false, response: '${_("I can't do that for you")}, ${_('but you can use photoshop.')}. ${_('Follow the instructions below to apply')} ${_('the blur filter to the image using photoshop')}. ${_('Instructions: Open...')}', commandline: null}"
`;
        return response;
    }

    /**
     * @description build body for request
     * @param {string} text
     * @returns {string} body contents
     */
    buildBody(text) {
        let request = this.app.utils.loadHistoryFile();
        if (request.length === 0) {
            this.app.log('No history found.');
            return this.buildNoHistoryBody(text);
        }
        request.push({
            role: 'user',
            parts: [
                {
                    text,
                },
            ],
        });
        this.app.log('History loaded.');
        const stringfiedHistory = JSON.stringify(request);
        return `{"contents":${stringfiedHistory}}`;
    }

    /**
     * @description build body without history
     * @param {string} text
     * @returns {string} body contents
     */
    buildNoHistoryBody(text) {
        let request = [
            {
                role: 'user',
                parts: [
                    {
                        text,
                    },
                ],
            },
        ];
        const stringfiedHistory = JSON.stringify(request);
        return `{"contents":${stringfiedHistory}}`;
    }
}
