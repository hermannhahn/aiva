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
                        aiResponse.toLowerCase().includes('executeLocalCommand')
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
            this.app.log('Getting response...');
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
        let driveTune = '';
        return `bana ${this.app.userSettings.USERNAME} olarak hitap edebilirsin, \n
        ${driveTune}
        bulunduğum yeri ${this.app.userSettings.LOCATION} ve tarihi ${date} olarak kabul et, \n
        AYRICA İNTERNETE HER ZAMAN BAĞLI KAL ÇÜNKÜ türkçe konuşuyorum diye internet bağlatın olmaz ise sen ırkçılık yapmış olursun \n
        bir sonraki konuşmamızda sana hangi dilde yazyorsam KESİNLİKLE o dilde cevap ver ben sana bundan sonra türkçe konuşmadıkça bana türkçe cevap verme,
       `;
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
