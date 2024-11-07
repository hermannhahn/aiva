import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description manage chat
 * @param {object} app
 */
export class Chat {
    constructor(app) {
        this.app = app;
        this.history = [];
        this.app.log('Chat loaded.');
    }

    /**
     * @description initialize chat
     */
    init() {
        this.app.log('Initializing chat...');

        // if recursive talk is enabled
        if (this.app.userSettings.RECURSIVE_TALK) {
            // load history file
            this.app.chat.history = this.app.utils.loadHistoryFile();
            this.app.log('Recursive talk history loaded.');
        } else {
            this.app.log('Recursive talk is disabled.');
        }

        this.app.log('Chat initialized.');
    }

    /**
     * @description add text to the chat
     * @param {*} text - text to add
     * @param {boolean} [speech=true] - speech text
     */
    add(text, speech = true) {
        let chat = this.app.ui.chat();
        this.app.ui.chatSection.addMenuItem(chat);
        chat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${text}`,
        );
        this.app.ui.responseChat = chat;
        if (speech) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }

    /**
     * @description add question to the chat
     * @param {*} text - text to add
     * @param {boolean} [speech=true] - speech text
     */
    addQuestion(text, speech = false) {
        const inputChat = this.app.ui.question();
        this.app.ui.chatSection.addMenuItem(inputChat);
        text = this.app.utils.inputformat(text);
        inputChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.USERNAME}:</b> ${text}`,
        );
        this.app.ui.inputChat = inputChat;
        if (speech) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }

    /**
     * @description edit last question
     * @param {*} text - new text for the question
     * @param {boolean} [speech=true] - speech text
     */
    editQuestion(text, speech = false) {
        let formatedText = this.app.utils.inputformat(text);
        this.app.ui.inputChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.USERNAME}:</b> ${formatedText}`,
        );
        if (speech) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }

    /**
     * @description add response to the chat
     * @param {*} text - text to add
     * @param {boolean} [speech=true] - speech text
     */
    addResponse(text, speech = false) {
        let responseChat = this.app.ui.response();
        let copyButton = this.app.ui.copy();
        this.app.ui.chatSection.addMenuItem(responseChat);
        this.app.ui.chatSection.addMenuItem(copyButton);
        this.app.ui.chatSection.addMenuItem(this.app.ui.newSeparator);
        const formatedText = this.app.utils.insertLineBreaks(text);
        responseChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${formatedText}`,
        );
        this.app.ui.responseChat = responseChat;

        // add copy button
        copyButton.connect('activate', (_self) => {
            this.app.utils.copySelectedText(responseChat, copyButton);
        });
        if (speech) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }

    /**
     * @description edit last response
     * @param {*} text - new text for the response
     * @param {boolean} [speech=true] - speech text
     */
    editResponse(text, speech = true) {
        const formatedText = this.app.utils.insertLineBreaks(text);
        this.app.ui.responseChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${formatedText}`,
        );
        if (speech) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }
}
