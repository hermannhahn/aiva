export class Chat {
    constructor(app) {
        this.app = app;
        // load history
        this.history = [];
        this.recursiveHistory = [];
        this.log('Chat loaded.');
    }

    log(message) {
        if (message) {
            this.app.utils.log(`[CHAT] ${message}`);
        }
    }

    init() {
        // if recursive talk is enabled
        if (this.app.userSettings.RECURSIVE_TALK) {
            // load history file
            this.recursiveHistory = this.utils.loadHistoryFile();
            this.log('Recursive talk history loaded.');
        } else {
            this.log('Recursive talk is disabled.');
        }
        this.log('Chat initialized.');
    }

    addQuestion(text) {
            let inputChat = this.app.ui.question();
            inputChat.label.clutter_text.set_markup(
                `<b>${this.app.userSettings.USERNAME}:</b> ${text}`,
            );
            this.app.ui.chatSection.addMenuItem(inputChat);
        }
        addResponse(text) {
            let responseChat = this.app.ui.response();
            let copyButton = this.app.ui.copy();
            this.app.ui.chatSection.addMenuItem(responseChat);
            this.app.ui.chatSection.addMenuItem(copyButton);
            this.app.ui.chatSection.addMenuItem(this.app.ui.newSeparator);
            responseChat.label.clutter_text.set_markup(
                `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${text}`,
            );
            // add copy button
            copyButton.connect('activate', (_self) => {
                this.app.utils.copySelectedText(responseChat, copyButton);
            });
        }
    }
}
