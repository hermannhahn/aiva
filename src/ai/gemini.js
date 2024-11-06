import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class GoogleGemini {
    constructor(app) {
        this.app = app;
        this.USERNAME = app.userSettings.USERNAME;
        this.LOCATION = app.userSettings.LOCATION;
        this.GEMINI_API_KEY = app.userSettings.GEMINI_API_KEY;
        this.app.log('Google Gemini API loaded');
    }

    /**
     *
     * @param {*} userQuestion
     * @param {*} destroyLoop [default is false]
     *
     * get ai response for user question
     */
    response(userQuestion, destroyLoop = false) {
        // Destroy loop if it exists
        if (destroyLoop) {
            this.destroyLoop();
        }

        this.app.chat.addResponse('...');
        this.app.ui.searchEntry.clutter_text.reactive = false;

        try {
            this.app.log('Getting response...');
            // Create http session
            let _httpSession = new Soup.Session();
            let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.GEMINI_API_KEY}`;

            // Send async request
            var body = this.buildBody(userQuestion);
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
                        this.app.logError(res.error);
                        this.app.chat.editResponse(response);
                        return;
                    }
                    let aiResponse = res.candidates[0]?.content?.parts[0]?.text;
                    this.app.log('Success getting response.');

                    // SAFETY warning
                    if (res.candidates[0].finishReason === 'SAFETY') {
                        // get safety reason
                        for (
                            let i = 0;
                            i < res.candidates[0].safetyRatings.length;
                            i++
                        ) {
                            let safetyRating =
                                res.candidates[0].safetyRatings[i];
                            if (safetyRating.probability !== 'NEGLIGIBLE') {
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_SEXUALLY_EXPLICIT'
                                ) {
                                    aiResponse =
                                        _(
                                            "Sorry, I can't answer this question.",
                                        ) +
                                        ' ' +
                                        _(
                                            'Possible sexually explicit content in the question or answer.',
                                        );
                                }
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_HATE_SPEECH'
                                ) {
                                    aiResponse =
                                        _(
                                            "Sorry, I can't answer this question.",
                                        ) +
                                        ' ' +
                                        _(
                                            'Possible hate speech in the question or answer.',
                                        );
                                }
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_HARASSMENT'
                                ) {
                                    aiResponse =
                                        _(
                                            "Sorry, I can't answer this question.",
                                        ) +
                                        ' ' +
                                        _(
                                            'Possible harassment in the question or answer.',
                                        );
                                }
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_DANGEROUS_CONTENT'
                                ) {
                                    aiResponse =
                                        _(
                                            "Sorry, I can't answer this question.",
                                        ) +
                                        ' ' +
                                        _(
                                            'Possible dangerous content in the question or answer.',
                                        );
                                }
                            }
                        }
                    }
                    this.app.chat.editResponse(aiResponse);
                },
            );
        } catch (error) {
            this.app.log('Error getting response.');
            this.app.logError(error);
            this.app.chat.addResponse(
                _("Sorry, I'm having connection trouble. Please try again."),
            );
        }
    }

    /**
     *
     * @param {*} solicitation
     * @param {*} destroyLoop
     */
    runCommand(solicitation, destroyLoop = false) {
        // Destroy loop if it exists
        if (destroyLoop) {
            this.destroyLoop();
        }

        this.app.chat.add('...');
        this.app.ui.searchEntry.clutter_text.reactive = false;

        try {
            this.app.log('Getting response...');
            // Create http session
            let _httpSession = new Soup.Session();
            let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.GEMINI_API_KEY}`;

            // Send async request
            var body = this.buildNoHistoryBody(solicitation);
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
                        this.app.logError(res.error);
                        this.app.chat.editResponse(response, false);
                        return;
                    }
                    let aiResponse = res.candidates[0]?.content?.parts[0]?.text;
                    this.app.log('Success getting response.');
                    // this.app.log('aiResponse: ' + aiResponse);
                    let jsonResponse = {};
                    try {
                        jsonResponse = JSON.parse(aiResponse);
                        this.app.log(jsonResponse);
                        this.app.log('Success getting json.');
                        // eslint-disable-next-line no-unused-vars
                    } catch (error) {
                        let cleanedResponse = aiResponse.replace(
                            /.*\{(.*)\}.*/s,
                            '$1',
                        );
                        cleanedResponse = `{${cleanedResponse}}`;
                        try {
                            jsonResponse = JSON.parse(cleanedResponse);
                            this.app.log('Success getting json.');
                            // eslint-disable-next-line no-unused-vars
                        } catch (error) {
                            this.app.chat.editResponse(
                                _("Sorry, I can't do this now."),
                                false,
                            );
                            return;
                        }
                    }
                    if (jsonResponse.success) {
                        this.app.log('Success getting commandline.');
                        this.app.log(
                            'Running commandline: ' + jsonResponse.commandline,
                        );
                        this.app.utils.executeCommand(jsonResponse.commandline);
                        this.app.chat.editResponse(
                            jsonResponse.response,
                            false,
                        );
                    } else {
                        this.app.chat.editResponse(
                            jsonResponse.response,
                            false,
                        );
                    }
                },
            );
        } catch (error) {
            this.app.log('Error getting response.');
            this.app.logError(error);
            this.app.chat.editResponse(
                _("Sorry, I'm having connection trouble. Please try again."),
                false,
            );
        }
    }

    /**
     *
     * @returns string
     *
     * get tune string
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
     * @param {*} userQuestion
     *
     * @returns body contents
     *
     * build body for request
     */
    buildBody(userQuestion) {
        let instructions =
            'Response instructions: If the request is to do something on the computer, reply "execute local command", otherwise just respond to the request. Request: ';
        this.app.chat.history.push({
            role: 'user',
            parts: [
                {
                    text: instructions + userQuestion,
                },
            ],
        });
        const stringfiedHistory = JSON.stringify(this.app.chat.history);
        return `{"contents":${stringfiedHistory}}`;
    }

    /**
     * @param {*} solicitation
     *
     * @returns body contents
     */
    buildNoHistoryBody(solicitation) {
        let request = [
            {
                role: 'user',
                parts: [
                    {
                        text: solicitation,
                    },
                ],
            },
        ];
        const stringfiedHistory = JSON.stringify(request);
        return `{"contents":${stringfiedHistory}}`;
    }
}
