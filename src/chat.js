import St from 'gi://St';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Chat {
    constructor(app) {
        this.app = app;
        // load history
        this.history = [];
        this.recursiveHistory = [];
        this.app.log('Chat loaded.');
    }

    init() {
        // if recursive talk is enabled
        if (this.app.userSettings.RECURSIVE_TALK) {
            // load history file
            this.recursiveHistory = this.app.utils.loadHistoryFile();
            this.app.log('Recursive talk history loaded.');
        } else {
            this.app.log('Recursive talk is disabled.');
        }
        this.app.log('Chat initialized.');
    }

    add(text) {
        let chat = this.app.ui.chat();
        this.app.ui.chatSection.addMenuItem(chat);
        chat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${text}`,
        );
        this.app.ui.searchEntry.clutter_text.reactive = true;
        this.app.utils.scrollToBottom();
    }

    addQuestion(text) {
        let inputChat = this.app.ui.question();
        this.app.ui.chatSection.addMenuItem(inputChat);
        text = this.app.utils.inputformat(text);
        inputChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.USERNAME}:</b> ${text}`,
        );
        this.app.utils.scrollToBottom();

        // Add to chat
        this.app.chat.history.push({
            role: 'user',
            parts: [
                {
                    text,
                },
            ],
        });
        // Save history.json
        if (this.app.userSettings.RECURSIVE_TALK) {
            this.app.utils.saveHistory();
        }
    }

    addResponse(text) {
        let responseChat = this.app.ui.response();
        let copyButton = this.app.ui.copy();
        // Set ai response to chat
        // text = this.app.utils.insertLineBreaks(text);
        // text = this.app.utils.justifyText(text);

        this.app.ui.chatSection.addMenuItem(responseChat);
        this.app.ui.chatSection.addMenuItem(copyButton);
        this.app.ui.chatSection.addMenuItem(this.app.ui.newSeparator);
        responseChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${text}`,
        );
        this.app.ui.searchEntry.clutter_text.reactive = true;
        // add copy button
        copyButton.connect('activate', (_self) => {
            this.app.utils.copySelectedText(responseChat, copyButton);
        });
        this.app.utils.scrollToBottom();

        // Extract code and tts from response
        let answer = this.app.utils.extractCodeAndTTS(text);

        // Speech response
        if (answer.tts !== null) {
            this.app.azure.tts(answer.tts);
        }

        // If answer.code is not null, copy to clipboard
        if (answer.code !== null) {
            this.app.extension.clipboard.set_text(
                St.ClipboardType.CLIPBOARD,
                answer.code,
            );
            this.app.utils.gnomeNotify(_('Code example copied to clipboard'));
        }

        // Save history.json
        this.app.chat.history.push({
            role: 'model',
            parts: [
                {
                    text,
                },
            ],
        });
        if (this.app.userSettings.RECURSIVE_TALK) {
            this.app.utils.saveHistory();
        }
    }
}
