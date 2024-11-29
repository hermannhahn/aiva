import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {Commands} from './commands.js';

export class Interpreter {
    constructor(app) {
        this.app = app;
        this.app.log('Interpreter loaded.');
        this.commands = new Commands();
    }

    proccess(question) {
        const command = question;
        this.app.ui.mainmenu.userEntry.clutter_text.reactive = false;
        this.app.log('Question: ' + question);
        this.app.log('Processing question...');
        this.app.chat.addResponse('⌛');
        this.app.ui.statusIcon('🤔');
        const isDatabaseCommand = this._isLocalCommand(question);

        if (this._isSlashCommand(question)) {
            // SLASH COMMANDS
            this.app.log('Slash command: ' + command);
            this._slashCommands(command);
        } else if (isDatabaseCommand.success) {
            // DATABASE COMMANDS
            this.app.log('Local Voice command detected.');
            this._localCommand(
                isDatabaseCommand.command,
                isDatabaseCommand.request,
            );
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
        switch (command) {
            case 'readClipboardText':
                try {
                    this.app.chat.editResponse(_('Starting reading...'));
                    await this.app.utils.readClipboardText();
                    break;
                } catch (error) {
                    this.app.logError(
                        'Erro ao obter texto da área de transferência:',
                        error,
                    );
                    break;
                }
            case 'openYoutubeChannel':
                try {
                    const urls = {
                        'cnn brasil': 'https://www.youtube.com/@CNNbrasil/live',
                        'uol news': 'https://www.youtube.com/@uolnews/live',
                        sbt: 'https://www.youtube.com/@SBT/live',
                        'band news': 'https://www.youtube.com/@BandNews/live',
                        record: 'https://www.youtube.com/@Record/live',
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
                    this.app.gemini.runCommand(command + ' ' + request);
                } catch (error) {
                    this.app.logError('Erro ao abrir site:', error);
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
                    this.app.gemini.runCommand(command + ' ' + request);
                } catch (error) {
                    this.app.logError('Erro ao abrir site:', error);
                }
                break;
            default:
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
