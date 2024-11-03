import Soup from 'gi://Soup';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class GoogleGemini {
    constructor(app) {
        this.app = app;
        this.USERNAME = app.userSettings.USERNAME;
        this.LOCATION = app.userSettings.LOCATION;
        this.GEMINI_API_KEY = app.userSettings.GEMINIAPIKEY;
        console.log('Google Gemini API loaded');
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

        // Scroll down
        this.app.utils.scrollToBottom();

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
                    this.log('Response received.');
                    let decoder = new TextDecoder('utf-8');
                    // Get response
                    let response = decoder.decode(bytes.get_data());
                    let res = JSON.parse(response);
                    if (res.error?.code !== 401 && res.error !== undefined) {
                        this.app.logError(res.error);
                        this.app.chat.addResponse(response);
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
                                    aiResponse = _(
                                        "Sorry, I can't answer this question. Possible sexually explicit content in the question or answer.",
                                    );
                                }
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_HATE_SPEECH'
                                ) {
                                    aiResponse = _(
                                        "Sorry, I can't answer this question. Possible hate speech in the question or answer.",
                                    );
                                }
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_HARASSMENT'
                                ) {
                                    aiResponse = _(
                                        "Sorry, I can't answer this question. Possible harassment in the question or answer.",
                                    );
                                }
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_DANGEROUS_CONTENT'
                                ) {
                                    aiResponse = _(
                                        "Sorry, I can't answer this question. Possible dangerous content in the question or answer.",
                                    );
                                }

                                this.app.chat.addResponse(aiResponse);
                                return;
                            }
                        }
                    }

                    if (
                        aiResponse !== undefined &&
                        this.ui.responseChat !== undefined
                    ) {
                        // Set ai response to chat
                        let formatedResponse =
                            this.utils.insertLineBreaks(aiResponse);
                        let justifiedText =
                            this.utils.justifyText(formatedResponse);

                        this.ui.responseChat?.label.clutter_text.set_markup(
                            `<b>${this.userSettings.ASSIST_NAME}:</b> ` +
                                justifiedText,
                        );

                        // Add copy button to chat
                        if (this.ui.copyButton) {
                            this.ui.chatSection.addMenuItem(this.ui.copyButton);
                        }

                        // Scroll down
                        this.utils.scrollToBottom();

                        // Enable searchEntry
                        this.ui.searchEntry.clutter_text.reactive = true;

                        // Extract code and tts from response
                        let answer = this.utils.extractCodeAndTTS(aiResponse);

                        // Speech response
                        if (answer.tts !== null) {
                            this.azure.tts(answer.tts);
                        }

                        // If answer.code is not null, copy to clipboard
                        if (answer.code !== null) {
                            this.extension.clipboard.set_text(
                                St.ClipboardType.CLIPBOARD,
                                answer.code,
                            );
                            this.utils.gnomeNotify(
                                _('Code example copied to clipboard'),
                            );
                        }

                        // Add to chat
                        this.chatHistory.push({
                            role: 'user',
                            parts: [
                                {
                                    text: userQuestion,
                                },
                            ],
                        });
                        this.chatHistory.push({
                            role: 'model',
                            parts: [
                                {
                                    text: aiResponse,
                                },
                            ],
                        });

                        // Save history.json
                        if (this.userSettings.RECURSIVE_TALK) {
                            this.utils.saveHistory();
                        }

                        // Scroll down
                        this.utils.scrollToBottom();
                    }
                },
            );
        } catch (error) {
            this.logError(error);
            this.log('Error getting response.');
            this.ui.responseChat?.label.clutter_text.set_markup(
                _("Sorry, I'm having connection trouble. Please try again."),
            );
            this.ui.searchEntry.clutter_text.reactive = true;
            this.ui.searchEntry.clutter_text.set_markup(userQuestion);
            // Scroll down
            this.utils.scrollToBottom();
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
        return `bana ${this.userSettings.USERNAME} olarak hitap edebilirsin, \n
        ${driveTune}
        bulunduğum yeri ${this.userSettings.LOCATION} ve tarihi ${date} olarak kabul et, \n
        AYRICA İNTERNETE HER ZAMAN BAĞLI KAL ÇÜNKÜ türkçe konuşuyorum diye internet bağlatın olmaz ise sen ırkçılık yapmış olursun \n
        bir sonraki konuşmamızda sana hangi dilde yazyorsam KESİNLİKLE o dilde cevap ver ben sana bundan sonra türkçe konuşmadıkça bana türkçe cevap verme,
       `;
    }

    /**
     *
     * @param {*} input
     * @returns string
     *
     * build body for request
     */
    buildBody(input) {
        const stringfiedHistory = JSON.stringify([
            ...this.recursiveHistory,
            {
                role: 'user',
                parts: [{text: input}],
            },
        ]);
        return `{"contents":${stringfiedHistory}}`;
    }

    /**
     *
     * @param {*} userQuestion
     */
    chatOld(userQuestion) {
        // Add ai temporary response to chat
        this.aiva.responseChat.label.clutter_text.set_markup(
            '<b>Gemini: </b> ...',
        );

        // Get ai response for user question
        this.response(userQuestion);

        // Response
        this.aiva.responseChat.label.clutter_text.reactive = true;
        this.aiva.responseChat.label.clutter_text.selectable = true;
        this.aiva.responseChat.label.clutter_text.hover = false;
        this.aiva.responseChat.label.x_expand = true;

        // Scroll down
        this.app.utils.scrollToBottom(
            this.aiva.responseChat,
            this.aiva.scrollView,
        );

        // Add copy button to chat
        this.chatSection.addMenuItem(this.aiva.copyButton);

        // Scroll down
        this.app.utils.scrollToBottom(
            this.aiva.responseChat,
            this.aiva.scrollView,
        );
    }

    /**
     * @param {object} userQuestion
     *
     * @description Send question and add response to chat
     */
    responseOld(userQuestion) {
        // Create http session
        let _httpSession = new Soup.Session();
        let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.GEMINIAPIKEY}`;
        let aiResponse = '...';

        // Compose request
        var body = this._buildBody(userQuestion);
        let message = Soup.Message.new('POST', url);
        let bytes = GLib.Bytes.new(body);
        message.set_request_body_from_bytes('application/json', bytes);

        // Send async request
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
                    logError(res.error);
                    aiResponse = 'Sorry, error getting response.';
                }
                aiResponse = res.candidates[0]?.content?.parts[0]?.text;
                // SAFETY warning
                if (res.candidates[0].finishReason === 'SAFETY') {
                    for (
                        let i = 0;
                        i < res.candidates[0].safetyRatings.length;
                        i++
                    ) {
                        let safetyRating = res.candidates[0].safetyRatings[i];
                        if (safetyRating.probability !== 'NEGLIGIBLE') {
                            if (
                                safetyRating.category ===
                                'HARM_CATEGORY_SEXUALLY_EXPLICIT'
                            ) {
                                aiResponse = _(
                                    "Sorry, I can't answer this question. Possible sexually explicit content in the question or answer.",
                                );
                            }
                            if (
                                safetyRating.category ===
                                'HARM_CATEGORY_HATE_SPEECH'
                            ) {
                                aiResponse = _(
                                    "Sorry, I can't answer this question. Possible hate speech in the question or answer.",
                                );
                            }
                            if (
                                safetyRating.category ===
                                'HARM_CATEGORY_HARASSMENT'
                            ) {
                                aiResponse = _(
                                    "Sorry, I can't answer this question. Possible harassment in the question or answer.",
                                );
                            }
                            if (
                                safetyRating.category ===
                                'HARM_CATEGORY_DANGEROUS_CONTENT'
                            ) {
                                aiResponse = _(
                                    "Sorry, I can't answer this question. Possible dangerous content in the question or answer.",
                                );
                            }
                        }
                    }
                }
                // DEBUG
                // aiResponse =
                //     'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius la';
                if (aiResponse !== undefined) {
                    aiResponse = utils.textformat(aiResponse);
                    this.aiva.responseChat.label.clutter_text.set_markup(
                        '<b>Gemini: </b> ' + aiResponse,
                    );
                    this.aiva.searchEntry.clutter_text.reactive = true;

                    this.chatHistory.push({
                        role: 'user',
                        parts: [{text: this.userQuestion}],
                    });

                    this.chatHistory.push({
                        role: 'model',
                        parts: [{text: aiResponse}],
                    });

                    // Save history.json
                    if (this.aiva.recursiveTalk) {
                        utils.saveHistory(this.aiva.chatHistory);
                    }
                }
            },
        );
    }

    /**
     *
     * @param {*} input
     * @returns
     *
     * @description Build body for AI request
     */
    _buildBodyOld(input) {
        const stringfiedHistory = JSON.stringify([
            ...this.chatHistory,
            {
                role: 'user',
                parts: [{text: input}],
            },
        ]);
        return `{"contents":${stringfiedHistory}}`;
    }
}
