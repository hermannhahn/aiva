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

    add(text, role = 'user') {
        if (role === 'user') {
            let inputChat = this.app.ui.input();
            inputChat.label.clutter_text.set_markup(
                `<b>${this.app.userSettings.USERNAME}:</b> ${text}`,
            );
            this.app.ui.chatSection.addMenuItem(inputChat);
        } else {
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
            // Unlock search entry
            this.app.ui.searchEntry.clutter_text.reactive = true;
            this.app.ui.searchEntry.clutter_text.selectable = true;
            this.app.ui.searchEntry.clutter_text.editable = true;
            this.app.ui.searchEntry.clutter_text.activatable = true;
            this.app.ui.searchEntry.clutter_text.hover = true;
        }
    }
}
