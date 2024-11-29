import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Interpreter {
    constructor(app) {
        this.app = app;
        this.app.log('Interpreter loaded.');
    }

    proccess(question) {
        const command = question;
        this.app.ui.mainmenu.userEntry.clutter_text.reactive = false;
        this.app.log('Question: ' + question);
        this.app.log('Processing question...');
        this.app.chat.addResponse('⌛');
        this.app.ui.statusIcon('🤔');
        const isDatabaseCommand = this._isDatabaseCommand(question);

        if (this._isSlashCommand(question)) {
            // SLASH COMMANDS
            this.app.log('Slash command: ' + command);
            this._slashCommands(command);
        } else if (isDatabaseCommand.success) {
            // DATABASE COMMANDS
            this.app.log('Local Voice command detected.');
            this._databaseCommands(
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

    _isDatabaseCommand(text) {
        text = text.toLowerCase();
        let result = {success: false, command: '', request: ''};

        const commands = {
            readClipboardText: [
                _('read this text'),
                _('please read this text'),
                _('can you read this text?'),
                _('read the text'),
                _('please read the text'),
                _('read the clipboard'),
                _('please read the clipboard'),
                _('can you read the clipboard?'),
                _('read copied text'),
                _('please read the copied text'),
                _('read clipboard text'),
                _('please read clipboard text'),
                _('read this clipboard'),
                _('can you read this clipboard?'),
                _('read text from clipboard'),
                _('please read text from clipboard'),
                _('read the text from clipboard'),
                _('read text in memory'),
                _('please read text in memory'),
                _('read memorized text'),
                _('please read the memorized text'),
                _('read for me'),
                _('can you read for me?'),
                _('read this for me'),
                _('please read this for me'),
                _('read text for me'),
                _('could you read the text for me?'),
                _('read this please'),
                _('please read this'),
                _('could you please read this?'),
                _('you can read now'),
                _("please read what's copied"),
                _("read what's on the clipboard"),
                _('read the copied content'),
                _('please read the copied content'),
                _('read the clipboard content'),
                _("can you read what's copied?"),
                _('read the copied message'),
                _('please read the copied message'),
                _('read this text from memory'),
                _('please read this text from memory'),
            ],
            openSite: [
                _('open the site'),
                _('open the website'),
                _('open site'),
                _('open website'),
            ],
            openYoutubeChannel: [
                _('open the channel'),
                _('open channel'),
                _('open the youtube channel'),
                _('open youtube channel'),
                _('open youtube'),
                _('on youtube'),
            ],
        };

        let commandToRun = this.app.utils.findCategoryInArrays(text, commands);

        if (commandToRun) {
            result.success = true;
            result.command = commandToRun.type;
            result.request = commandToRun.request;
            return result;
        }

        return result;
    }

    async _databaseCommands(command, request) {
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
