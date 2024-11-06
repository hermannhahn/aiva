import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Chat {
    constructor(app) {
        this.app = app;
        // load history
        this.history = [];
        this.app.log('Chat loaded.');
    }

    init() {
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

    add(text, voice = true) {
        let chat = this.app.ui.chat();
        this.app.ui.chatSection.addMenuItem(chat);
        chat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${text}`,
        );
        this.app.ui.responseChat = chat;
        this.app.ui.searchEntry.clutter_text.reactive = true;
        if (voice) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }

    addQuestion(text, voice = false) {
        const inputChat = this.app.ui.question();
        this.app.ui.chatSection.addMenuItem(inputChat);
        text = this.app.utils.inputformat(text);
        inputChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.USERNAME}:</b> ${text}`,
        );
        this.app.ui.inputChat = inputChat;
        this.app.ui.searchEntry.clutter_text.reactive = false;
        if (voice) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }

    editQuestion(text, voice = false) {
        let formatedText = this.app.utils.inputformat(text);
        this.app.ui.inputChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.USERNAME}:</b> ${formatedText}`,
        );
        this.app.ui.searchEntry.clutter_text.reactive = false;
        if (voice) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }

    addResponse(text, voice = false) {
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
        if (voice) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }

    editResponse(text, voice = true) {
        const formatedText = this.app.utils.insertLineBreaks(text);
        this.app.ui.responseChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${formatedText}`,
        );
        this.app.ui.searchEntry.clutter_text.reactive = true;
        if (voice) {
            this.app.azure.tts(text);
        }
        this.app.utils.scrollToBottom();
    }
}
