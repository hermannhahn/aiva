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
            this.app.chat.add(`
HELP

/settings   - Open settings
/help       - Show this help
                `);
        }

        if (text.startsWith('/settings')) {
            this.app.openSettings();
        }
    }

    _isDatabaseCommand(text) {
        text = text.toLowerCase();
        let result = {success: false, command: '', request: ''};

        const commands = {
            readClipboardText: [
                _('read this text'),
                _('read the text'),
                _('read the clipboard'),
                _('read copied text'),
                _('read clipboard text'),
                _('read this clipboard'),
                _('read text in memory'),
                _('read memorised text'),
                _('read for me'),
                _('read this for me'),
                _('read text for me'),
                _('read this please'),
                _('you can read now'),
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
            readNewsOf: [
                _('read news from'),
                _('read news from2'),
                _('read news from3'),
                _('read the news from'),
                _('read the news from2'),
                _('read the news from3'),
                _('what is the news from'),
                _('what is the news from2'),
                _('what is the news from3'),
                _("what's the news from"),
                _("what's the news from2"),
                _("what's the news from3"),
                _('can you read the news from'),
                _('can you read the news from2'),
                _('can you read the news from3'),
                _('please read the news from'),
                _('please read the news from2'),
                _('please read the news from3'),
                _('what are the latest updates from'),
                _('what are the latest updates from2'),
                _('what are the latest updates from3'),
                _("what's happening in"),
                _("what's happening in2"),
                _("what's happening in3"),
                _('can you check the news from'),
                _('can you check the news from2'),
                _('can you check the news from3'),
                _("what's the latest news from"),
                _("what's the latest news from2"),
                _("what's the latest news from3"),
                _('any news from'),
                _('any news from2'),
                _('any news from3'),
                _('get the news from'),
                _('get the news from2'),
                _('get the news from3'),
                _('fetch the news from'),
                _('fetch the news from2'),
                _('fetch the news from3'),
                _('what do the reports say from'),
                _('what do the reports say from2'),
                _('what do the reports say from3'),
                _('could you give me the news from'),
                _('could you give me the news from2'),
                _('could you give me the news from3'),
                _('bring up the news from'),
                _('bring up the news from2'),
                _('bring up the news from3'),
                _('look up the news from'),
                _('look up the news from2'),
                _('look up the news from3'),
                _("tell me what's happening in"),
                _("tell me what's happening in2"),
                _("tell me what's happening in3"),
                _('let me know the news from'),
                _('let me know the news from2'),
                _('let me know the news from3'),
                _("what's the situation in"),
                _("what's the situation in2"),
                _("what's the situation in3"),
            ],
            readNews: [
                _('read the news'),
                _('read news'),
                _('can you read the news'),
                _('please read the news'),
                _('what’s in the news'),
                _('what is the news'),
                _('any news'),
                _('get the news'),
                _('fetch the news'),
                _('tell me the news'),
                _('what do the reports say'),
                _('could you read the news'),
                _('bring up the news'),
                _('look up the news'),
                _('what’s happening in the news'),
                _('let me know the news'),
                _('give me the news'),
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
                    return;
                } catch (error) {
                    this.app.logError('Erro ao abrir site:', error);
                    return;
                }
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
                    return;
                } catch (error) {
                    this.app.logError('Erro ao abrir site:', error);
                    return;
                }
            case 'readNewsOf':
                try {
                    // get the three first words from request
                    const topic = request.split(/\s+/).slice(0, 3).join(' ');
                    this.app.gemini.response(`${_('Read news of')} ${topic}`);
                    // this.app.utils.readNews(topic);
                    return;
                } catch (error) {
                    this.app.logError('Erro ao abrir site:', error);
                    return;
                }
            case 'readNews':
                try {
                    this.app.gemini.response(`${_('Read news')}`);
                    // this.app.utils.readNews();
                } catch (error) {
                    this.app.logError('Erro ao ler notícias:', error);
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
