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

    // _isVoiceCommand(text) {
    //     text = text.toLowerCase();
    //     let activationWords = [
    //         _('computer'),
    //         'aiva',
    //         this.app.userSettings.ASSIST_NAME,
    //     ];

    //     // Check if the first four words is "computer", ignore special characters, ignore ",", ".", ":", "?", "!" etc..
    //     const words = text.split(/\s+/).slice(0, 4);
    //     for (const word of words) {
    //         for (const activationWord of activationWords) {
    //             if (word.includes(activationWord)) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    // voiceCommandInterpreter(text) {
    //     let request = this.app.gemini.commandRequest(text);
    //     this.app.gemini.runCommand(request);
    // }
}
