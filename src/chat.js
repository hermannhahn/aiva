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
            this.app.ui.inputChat.label.clutter_text.set_markup(
                `<b>${this.app.userSettings.USERNAME}:</b> ${text}`,
            );
        } else {
            this.app.ui.responseChat.label.clutter_text.set_markup(
                `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${text}`,
            );
        }
    }

    /**
     *
     * @param {*} userQuestion
     *
     * send question to chat
     */
    send(userQuestion) {
        let inputChat = this.app.ui.input();
        let responseChat = this.app.ui.response();
        let copyButton = this.app.ui.copy();

        // add items
        this.app.ui.chatSection.addMenuItem(inputChat);
        this.app.ui.chatSection.addMenuItem(responseChat);
        this.app.ui.chatSection.addMenuItem(copyButton);
        this.app.ui.chatSection.addMenuItem(this.app.ui.newSeparator);

        // add copy button
        copyButton.connect('activate', (_self) => {
            this.app.utils.copySelectedText(responseChat, copyButton);
        });

        // Add user question to chat
        this.addInput(userQuestion);

        // Set temporary response message
        this.addResponse('...');

        // Unlock search entry
        this.app.ui.searchEntry.clutter_text.reactive = true;
        this.app.ui.searchEntry.clutter_text.selectable = true;
        this.app.ui.searchEntry.clutter_text.editable = true;
        this.app.ui.searchEntry.clutter_text.activatable = true;
        this.app.ui.searchEntry.clutter_text.hover = true;
    }
}
