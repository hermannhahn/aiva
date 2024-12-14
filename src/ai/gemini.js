import Soup from 'gi://Soup';
import GLib from 'gi://GLib';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import {GeminiFunctions} from './gemini/functions.js';

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
        this.function = new GeminiFunctions(app);
        this.USERNAME = app.userSettings.USERNAME;
        this.LOCATION = app.userSettings.LOCATION;
        this.ASSIST_NAME = app.userSettings.ASSIST_NAME;
        this.GEMINI_API_KEY = app.userSettings.GEMINI_API_KEY;
        this.afterTune = null;
        this.block = false;
        this.app.log('Google Gemini API loaded');
    }

    /**
     * @description create tune string
     * @returns {string} tune text
     */
    getTuneString() {
        const date = new Date();

        // add initial instructions to model
        let model = [
            {
                parts: [
                    {
                        text: `${_("Hi, I'm")} ${this.USERNAME}. ${_('I live in')} ${this.LOCATION}. ${_('Today is')} ${date.toLocaleDateString()}.')}`,
                    },
                    {
                        text: `${_("Hi, I'm your helpful assistant.")}, ${_('How can I help you?')}`,
                    },
                ],
            },
            {
                parts: [
                    {
                        text: `${_('You now use and respond to the name')} ${this.ASSIST_NAME}.`,
                    },
                    {
                        text: `${_("Ok, now I'm")} ${this.ASSIST_NAME}. ${_('More instructions')}?`,
                    },
                ],
            },
            {
                parts: [
                    {
                        text: `${_('When I request weather information')}, ${_('use the "get_weather" function')} ${_('that will be declared with the request')}.`,
                    },
                    {
                        text: `${_('Perfect, now I will always use the function')} "get_weather" ${_('when you ask for weather information')}.`,
                    },
                ],
            },
            {
                parts: [
                    {
                        text: `${_('When I request to read clipboard or copied text')}, ${_('use the "read_clipboard" function')} ${_('that will be declared with the request')}.`,
                    },
                    {
                        text: `${_('Of course, now I will always use the function')} "read_clipboard" ${_('when you ask for read clipboard or copied text')}.`,
                    },
                ],
            },
            {
                parts: [
                    {
                        text: `${_('When I request to open a website')}, ${_('use the "open_website" function')} ${_('that will be declared with the request')}.`,
                    },
                    {
                        text: `${_('Ok, now I will always use the function')} "open_website" ${_('when you ask for open a website')}.`,
                    },
                ],
            },
            {
                parts: [
                    {
                        text: `${_('When I request to open apps, files, folder, or anything else in my computer')}, ${_('use the "command_line" function')} ${_('that will be declared with the request')}.`,
                    },
                    {
                        text: `${_('Great, now I will always use the function')} "command_line" ${_('when you ask for to do something in your computer')}.`,
                    },
                ],
            },
            {
                parts: [
                    {
                        text: `${_('Always use the history of our interactions to contextualize your responses.')}.`,
                    },
                    {
                        text: `${_('Ok, now I will always use the history of our interactions to contextualize my responses.')}.`,
                    },
                ],
            },
        ];
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
            let body = this._buildBody(question);
            this.app.log('Body Question: ' + body); // debug
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

                    // DEBUG
                    let jsonResponse = {};
                    jsonResponse = JSON.stringify(res);
                    this.app.log('Response: ' + jsonResponse);

                    const parts = res.candidates[0]?.content?.parts;

                    // tools callback
                    for (const part of parts) {
                        if (part.functionCall !== undefined) {
                            const f = part.functionCall;
                            this.function.callback(f.name, f.args);
                            return;
                        }
                    }

                    // ai response
                    let aiResponse = res.candidates[0]?.content?.parts[0]?.text;

                    if (aiResponse === undefined) {
                        this.app.chat.editResponse(
                            _(
                                "Sorry, I'm having connection trouble. Please try again.",
                            ),
                        );
                        return;
                    }

                    // safety warning
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

                    this.app.chat.editResponse(aiResponse);

                    // add to history
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
     * @description send question to API and stream response into the chat
     * @param {string} question
     * @param {boolean} [destroyLoop=false]
     */
    stream(question, destroyLoop = false) {
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
            let body = this._buildBody(question);
            this.app.log('Body Question: ' + body);
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

                    // DEBUG
                    let jsonResponse = {};
                    jsonResponse = JSON.stringify(res);
                    this.app.log('Response: ' + jsonResponse);

                    const parts = res.candidates[0]?.content?.parts;

                    // tools callback
                    for (const part of parts) {
                        if (part.functionCall !== undefined) {
                            const f = part.functionCall;
                            this.function.callback(f.name, f.args);
                            return;
                        }
                    }

                    // ai response
                    let aiResponse = res.candidates[0]?.content?.parts[0]?.text;
                    this.app.log('AI RESPONSE: ' + aiResponse);
                    this.app.log('RES ONLY: ' + JSON.stringify(res));

                    if (aiResponse === undefined) {
                        this.app.chat.editResponse(
                            _(
                                "Sorry, I'm having connection trouble. Please try again.",
                            ),
                        );
                        return;
                    }

                    // safety warning
                    // let safetyReason = this.safetyReason(res);

                    // if (safetyReason) {
                    //     this.app.chat.editResponse(safetyReason);
                    //     return;
                    // }

                    if (aiResponse === undefined) {
                        this.app.chat.editResponse(
                            _("Sorry, I can't answer this question now."),
                        );
                        return;
                    }

                    this.app.chat.editResponse(aiResponse);

                    // add to history
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
     * @description check safety result
     * @param {object} res gemini response object
     * @returns {string|false} safety reason or false
     */
    safetyReason(res) {
        let aiResponse = '';
        // SAFETY warning
        if (res && res.candidates[0]?.finishReason === 'SAFETY') {
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
                                'Possible sexually explicit content in the question or response.',
                            );
                    }
                    if (safetyRating.category === 'HARM_CATEGORY_HATE_SPEECH') {
                        aiResponse =
                            _("Sorry, I can't answer this question.") +
                            ' ' +
                            _(
                                'Possible hate speech in the question or response.',
                            );
                    }
                    if (safetyRating.category === 'HARM_CATEGORY_HARASSMENT') {
                        aiResponse =
                            _("Sorry, I can't answer this question.") +
                            ' ' +
                            _(
                                'Possible harassment in the question or response.',
                            );
                    }
                    if (
                        safetyRating.category ===
                        'HARM_CATEGORY_DANGEROUS_CONTENT'
                    ) {
                        aiResponse =
                            _("Sorry, I can't answer this question.") +
                            ' ' +
                            _(
                                'Possible dangerous content in the question or response.',
                            );
                    }
                }
            }
            return aiResponse;
        }
        return false;
    }

    /**
     * @description build body for request
     * @param {string} text
     * @returns {string} body contents
     */
    _buildBody(text) {
        try {
            let history = this.app.database.getHistory();

            if (!Array.isArray(history) || history.length === 0) {
                this.app.log('No history found.');
                return this._buildNoHistoryBody(text);
            }

            if (!this.app.userSettings.RECURSIVE_TALK) {
                this.app.log('History disabled.');
                return this._buildNoHistoryBody(text);
            }

            const stringfiedHistory = JSON.stringify([
                ...history,
                {
                    role: 'user',
                    parts: [{text: String(text) || ''}],
                },
            ]);

            return this._createBody(stringfiedHistory, text);
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
    _buildNoHistoryBody(text) {
        try {
            const stringfiedRequest = JSON.stringify([
                {
                    role: 'user',
                    parts: [{text}],
                },
            ]);
            return this._createBody(stringfiedRequest, text);
        } catch {
            throw new Error('Error building body');
        }
    }

    _createBody(request, text) {
        try {
            const declarations = this.function.declaration.get(text);

            // get first five words from text
            if (declarations) {
                const tools = JSON.stringify(declarations);
                return `{"contents":${request}, "tools":${tools}}`;
            }
            return `{"contents":${request}}`;
        } catch {
            throw new Error('Error building body');
        }
    }
}
