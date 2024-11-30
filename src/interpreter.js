import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {Commands} from './commands.js';
import {Phrases} from './utils/phrases.js';

export class Interpreter {
    constructor(app) {
        this.app = app;
        this.app.log('Interpreter loaded.');
        this.commands = new Commands();
        this.phrases = new Phrases();
    }

    proccess(question) {
        const command = question;
        this.app.ui.mainmenu.userEntry.clutter_text.reactive = false;
        this.app.log('Question: ' + question);
        this.app.log('Processing question...');
        this.app.chat.addResponse('...');
        this.app.ui.statusIcon('⌛');
        const isLocalCommand = this._isLocalCommand(question);

        if (this._isSlashCommand(question)) {
            // SLASH COMMANDS
            this.app.log('Slash command: ' + command);
            this._slashCommands(command);
        } else if (isLocalCommand.success) {
            // DATABASE COMMANDS
            this.app.log('Local Voice command detected.');
            this._localCommand(isLocalCommand.command, isLocalCommand.request);
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

    _slashCommands(text) {
        if (text.startsWith('/help')) {
            this.app.chat.editResponse(`
HELP

/settings   - Open settings
/help       - Show this help
                `);
            return;
        }

        if (text.startsWith('/settings')) {
            this.app.openSettings();
            return;
        }
        this.app.chat.editResponse(_('Invalid command'));
    }

    _isLocalCommand(text) {
        text = text.toLowerCase();
        let result = {success: false, command: '', request: ''};
        let commands = this.commands.local;

        let commandToRun = this.commands.findCategoryInArrays(text, commands);

        if (commandToRun) {
            result.success = true;
            result.command = commandToRun.type;
            result.request = commandToRun.request;
            return result;
        }

        return result;
    }

    async _localCommand(command, request) {
        this.app.chat.editResponse(this.phrases.wait());
        switch (command) {
            case 'readClipboardText':
                try {
                    await this.app.utils.readClipboardText();
                } catch (error) {
                    this.app.chat.editResponse(
                        _('Error reading clipboard text'),
                    );
                    this.app.logError('Error reading clipboard text:', error);
                }
                break;
            case 'openYoutubeChannel':
                try {
                    const urls = {
                        'cnn brasil': 'https://www.youtube.com/@CNNbrasil/live',
                        'uol news': 'https://www.youtube.com/@uolnews/live',
                        sbt: 'https://www.youtube.com/@SBT/live',
                        'band news': 'https://www.youtube.com/@BandNews/live',
                        'globo news': 'https://www.youtube.com/@GloboNews/live',
                        'jovem pan news': 'https://www.youtube.com/@JovemPanNews/live',
                        veja: 'https://www.youtube.com/@VEJA/live',
                        record news: 'https://www.youtube.com/@recordnews/live',
                        cultura: 'https://www.youtube.com/@cultura/live',
                        canal brasil: 'https://www.youtube.com/@CanalBrasil/live',
    'felipe neto': 'https://www.youtube.com/@felipeneto',
                        'manual do mundo':
                            'https://www.youtube.com/@ManualDoMundo',
                    };

                    for (const [key, url] of Object.entries(urls)) {
                        if (request.includes(key)) {
                            this.app.chat.editResponse(_(`Opening ${key}...`));
                            this.app.utils.executeCommand(`firefox ${url}`);
                            return;
                        }
                    }
                } catch (error) {
                    this.app.logError('Error opening channel:', error);
                    this.app.chat.editResponse(_('Error opening channel'));
                }
                break;
            case 'openSite':
                try {
                    const urls = {
                        youtube: 'https://www.youtube.com',
                        'cnn brasil': 'https://www.youtube.com/@CNNbrasil/live',
                        uol: 'https://www.uol.com.br',
                    };

                    for (const [key, url] of Object.entries(urls)) {
                        if (request.includes(key)) {
                            this.app.chat.editResponse(_(`Opening ${key}...`));
                            this.app.utils.executeCommand(`firefox ${url}`);
                            return;
                        }
                    }
                    break;
                } catch (error) {
                    this.app.logError('Error opening site:', error);
                    this.app.chat.editResponse(_('Error opening site'));
                }
                break;
            default:
                this.app.chat.editResponse(
                    _("Sorry, I can't do that right now. Maybe in the future."),
                );
                break;
        }
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
