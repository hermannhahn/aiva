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
        this.block = false;
        this.app.log('Google Gemini API loaded');
    }

    /**
     * @description create tune string
     * @param {string} [role='user'] type the role or leave empty for user role
     * @returns {string} tune text
     */
    getTuneString(role = 'user') {
        const date = new Date();
        const location = this.app.userSettings.LOCATION;
        const user = `${_('Hi, I am')} ${this.app.userSettings.USERNAME}. ${_('I am from')} ${location} ${_('and today is')} ${date}`;
        const model = `${_('Hi! I am')} ${this.app.userSettings.ASSIST_NAME}. ${_('How can I help you today?')}`;

        if (role === 'user') {
            return user;
        }
        return model;
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
            const models = [
                'gemini-1.0-pro',
                'gemini-1.5-flash-002',
                'gemini-1.5-pro',
            ];
            const model = models[0];

            let _httpSession = new Soup.Session();
            let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.GEMINI_API_KEY}`;

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
                    let safetyReason = this.safetyReason(question, res);
                    if (safetyReason && !this.block) {
                        if (safetyReason === 'tryRunCommand') {
                            this.block = true;
                            this.runCommand(question);
                            return;
                        }
                        this.app.chat.editResponse(safetyReason);
                        return;
                    }
                    this.block = false;

                    if (aiResponse === undefined) {
                        this.app.chat.editResponse(
                            _("Sorry, I can't answer this question now."),
                        );
                        return;
                    }

                    this.app.chat.editResponse(aiResponse);

                    // Add to history
                    this.app.database.addToHistory(question, aiResponse);
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
     * @description send a tool request to API
     * @param {string} request
     * @returns {jsonResponse} with tool name and args
     */
    toolCommand(request) {
        try {
            this.app.log('Getting command response...');
            // Create http session
            let _httpSession = new Soup.Session();
            let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.GEMINI_API_KEY}`;

            // Send async request
            let body = this._buildToolBody(request);
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

                    if (aiResponse === undefined) {
                        this.app.chat.editResponse(
                            _("Sorry, I can't answer this question now."),
                        );
                        return;
                    }

                    // tool response
                    let jsonResponse = {};
                    jsonResponse = JSON.parse(aiResponse);
                    this.app.log('Tool response: ' + jsonResponse);
                },
            );
        } catch (error) {
            throw new Error(`Tool command error: ${error.message}`);
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
            const commandRequest = this.commandRequest(request);
            let body = this.buildNoHistoryBody(commandRequest);
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
                    this.app.log('Response: ' + aiResponse);

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
                        // this.app.log('Parsed Response: ' + aiResponse);
                        // eslint-disable-next-line no-unused-vars
                    } catch (error) {
                        let cleanedResponse = aiResponse.replace(
                            /.*\{(.*)\}.*/s,
                            '$1',
                        );
                        cleanedResponse = `{${cleanedResponse}}`;
                        // this.app.log('Cleaned Response: ' + cleanedResponse);
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
     * @param {string} question user question
     * @param {object} res gemini response object
     * @returns {string|false} safety reason or false
     */
    safetyReason(question, res) {
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
                        aiResponse = 'tryRunCommand';
                        // aiResponse =
                        //     _("Sorry, I can't answer this question.") +
                        //     ' ' +
                        //     _(
                        //         'Possible dangerous content in the question or answer.',
                        //     );
                    }
                }
            }
            return aiResponse;
        }
        return false;
    }

    commandRequest(request) {
        const response = `
${_('Generate a command line for the request')}: ${request}
${_('Return a JSON with the following keys')}:
'success' (${_('true If it is possible to achieve the purpose of the request with a command line.')} ${_('a Linux Ubuntu terminal command line to the request')}, ${_('false otherwise')}),
'response' (${_('text to be associated with the command line')}, ${_('informing action in success case')}, ${_('or failure text')}),
'commandline' (${_('command line for linux ubuntu that fulfills the request')}).
${_('Rules for commandline value')}: ${_('Do not use sudo')}, ${_('Prefer browser, firefox and google websites')}, ${_('Never generate destructive commands')}.
${_('Response example')}:
${_('Request')}: "${_('Generate a command line that search for santos ferry crossing')}"
${_('JSON Response')}: {success: true, response: "${_('Searching for santos boat crossing...')}", commandline: "firefox https://www.google.com/search?q=${_('boat+crossing+santos')}"}
`;
        this.app.log('Command Request: ' + response);
        return response;
    }

    /**
     * @description build body for request
     * @param {string} text
     * @returns {string} body contents
     */
    buildBody(text) {
        try {
            const history = this.app.database.getHistory();

            // Log de histórico formatado para depuração
            // this.app.log(`History: ${JSON.stringify(history, null, 2)}`);

            if (!Array.isArray(history) || history.length === 0) {
                this.app.log('No history found.');
                return this.buildNoHistoryBody(text);
            }

            // Adiciona a pergunta ao histórico
            const stringfiedHistory = JSON.stringify([
                ...history,
                {
                    role: 'user',
                    parts: [{text: String(text) || ''}],
                },
            ]);
            return `{"contents":${stringfiedHistory}}`;
        } catch (error) {
            this.app.log(`Error building body: ${error.message}`);
            return null;
        }
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
                parts: [{text}],
            },
        ];
        const stringfiedHistory = JSON.stringify(request);
        return `{"contents":${stringfiedHistory}}`;
    }

    _buildToolBody(text) {
        let request = {
            contents: {
                role: 'user',
                parts: [{text}],
            },
            tools: [
                {
                    function_declarations: [
                        {
                            name: 'open_app',
                            description: 'open app by name or description',
                            parameters: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string',
                                        description:
                                            'The name of the app e.g. Google Chrome',
                                    },
                                },
                                required: ['name'],
                            },
                        },
                        {
                            name: 'read_clipboard',
                            description: 'read text from clipboard',
                        },
                    ],
                },
            ],
        };
        const stringfiedHistory = JSON.stringify(request);
        return stringfiedHistory;
    }
}
