import {Phrases} from './utils/phrases.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description interpreter
 * @param {object} app
 */
export class Interpreter {
    constructor(app) {
        this.app = app;
        this.app.log('Interpreter loaded.');
        this.phrases = new Phrases();
    }

    proccess(question) {
        const command = question;
        this.app.ui.mainmenu.userEntry.clutter_text.reactive = false;
        this.app.log('Question: ' + question);
        this.app.log('Processing question...');
        this.app.chat.addResponse('...');
        this.app.ui.statusIcon('⌛');

        if (this._isSlashCommand(question)) {
            // SLASH COMMANDS
            this.app.log('Slash command: ' + command);
            this.app.commands.slash(command);
        } else {
            // QUESTIONS
            this.app.log('Sending question to API...');
            this.app.gemini.response(question);
        }

        this.app.ui.mainmenu.userEntry.clutter_text.reactive = true;
    }

    _isSlashCommand(text) {
        if (text.startsWith('/')) {
            return true;
        }
        return false;
    }
}
