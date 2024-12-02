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
            var body = this._buildBody(question);
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

                    let tool =
                        res.candidates[0]?.content?.parts[0]?.functionCall;

                    if (tool !== undefined) {
                        // tool response
                        this.app.log('Tool name: ' + tool.name);
                        this.app.log('Tool args: ' + tool.args.name);

                        this.app.interpreter.localCommand(
                            tool.name,
                            tool.args.name,
                        );
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

                    // DEBUG
                    // let jsonResponse = {};
                    // jsonResponse = JSON.stringify(res);
                    // this.app.log('Tool response: ' + jsonResponse);

                    let tool =
                        res.candidates[0]?.content?.parts[0]?.functionCall;

                    if (tool === undefined) {
                        this.app.chat.editResponse(
                            _("Sorry, I can't do this now. Maybe soon."),
                        );
                        return;
                    }

                    // tool response
                    this.app.log('Tool name: ' + tool.name);
                    this.app.log('Tool args: ' + tool.args.name);

                    this.app.interpreter.localCommand(
                        tool.name,
                        tool.args.name,
                    );
                },
            );
        } catch (error) {
            throw new Error(`Tool command error: ${error.message}`);
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

    /**
     * @description build body for request
     * @param {string} text
     * @returns {string} body contents
     */
    _buildBody(text) {
        try {
            const history = this.app.database.getHistory();

            // Log de histórico formatado para depuração
            // this.app.log(`History: ${JSON.stringify(history, null, 2)}`);

            if (!Array.isArray(history) || history.length === 0) {
                this.app.log('No history found.');
                return this._buildNoHistoryBody(text);
            }

            // Adiciona a pergunta ao histórico
            const stringfiedHistory = JSON.stringify([
                ...history,
                {
                    role: 'user',
                    parts: [{text: String(text) || ''}],
                },
            ]);
            const stringfiedTool = JSON.stringify(this.commands.functions);
            return `{"contents":${stringfiedHistory}, "tools":${stringfiedTool}}`;
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
        let request = [
            {
                role: 'user',
                parts: [{text}],
            },
        ];
        const stringfiedRequest = JSON.stringify(request);
        const stringfiedTool = JSON.stringify(this.commands.functions);
        return `{"contents":${stringfiedRequest}, "tools":${stringfiedTool}}`;
    }

    _buildToolBody(text) {
        let request = [
            {
                role: 'user',
                parts: [{text}],
            },
        ];
        const stringfiedRequest = JSON.stringify(request);
        const stringfiedTool = JSON.stringify(this.commands.functions);
        return `{"contents":${stringfiedRequest}, "tools":${stringfiedTool}}`;
    }
}
