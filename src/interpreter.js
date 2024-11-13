import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Interpreter {
    constructor(app) {
        this.app = app;
        this.app.log('Interpreter loaded.');
        this.pids = [];
    }

    proccess(question) {
        this.app.ui.searchEntry.clutter_text.reactive = false;
        this.app.log('Question: ' + question);
        this.app.log('Processing question...');
        this.app.chat.addResponse('...');
        const isLocalVoiceCommand = this._isLocalVoiceCommand(question);
        if (this._isCommand(question)) {
            this.app.log('Command detected.');
            this._commandInterpreter(question);
        } else if (isLocalVoiceCommand.success) {
            this.app.log('Local Voice command detected.');
            this.localVoiceCommandsInterpreter(
                isLocalVoiceCommand.command,
                question,
            );
        } else if (this._isVoiceCommand(question)) {
            this.app.log('Voice command detected.');
            this.voiceCommandInterpreter(question);
        } else {
            this.app.log('Sending question to API...');
            this.app.gemini.response(question);
        }
        this.app.ui.searchEntry.clutter_text.reactive = true;
    }

    _isCommand(text) {
        if (text.startsWith('/')) {
            return true;
        }
        return false;
    }

    _isVoiceCommand(text) {
        text = text.toLowerCase();
        let activationWords = [
            _('computer'),
            'aiva',
            this.app.userSettings.ASSIST_NAME,
        ];

        // Check if the first four words is "computer", ignore special characters, ignore ",", ".", ":", "?", "!" etc..
        const words = text.split(/\s+/).slice(0, 4);
        for (const word of words) {
            for (const activationWord of activationWords) {
                if (word.includes(activationWord)) {
                    return true;
                }
            }
        }
        return false;
    }

    _isLocalVoiceCommand(text) {
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
                _('read news of'),
                _('read the news of'),
                _('show me the news of'),
                _('show news of'),
                _('what is the news of'),
                _('what are the news of'),
                _('tell me the news of')
                _('read news from'),
                _('read the news from'),
                _('show me the news from'),
                _('show news from'),
                _('what is the news from'),
                _('what are the news from'),
                _('tell me the news from')
            ],
            readNews: [
                _('read news'),
                _('read the news'),
                _('show me the news'),
                _('show news'),
                _('what is the news'),
                _('what are the news'),
                _('tell me the news')
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

    _commandInterpreter(text) {
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

    voiceCommandInterpreter(text) {
        let request = this.app.gemini.commandRequest(text);
        this.app.gemini.runCommand(request);
    }

    async localVoiceCommandsInterpreter(command, text) {
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
                        if (text.includes(key)) {
                            this.app.chat.editResponse(_(`Opening ${key}...`));
                            this.app.utils.executeCommand(`firefox ${url}`);
                            break;
                        }
                    }
                    this.app.gemini.runCommand(text);
                    break;
                } catch (error) {
                    this.app.logError('Erro ao abrir site:', error);
                    break;
                }
            case 'openSite':
                try {
                    const urls = {
                        youtube: 'https://www.youtube.com',
                        'cnn brasil': 'https://www.youtube.com/@CNNbrasil/live',
                        uol: 'https://www.uol.com.br',
                    };

                    for (const [key, url] of Object.entries(urls)) {
                        if (text.includes(key)) {
                            this.app.chat.editResponse(_(`Opening ${key}...`));
                            this.app.utils.executeCommand(`firefox ${url}`);
                            break;
                        }
                    }
                    this.app.gemini.runCommand(text);
                    break;
                } catch (error) {
                    this.app.logError('Erro ao abrir site:', error);
                    break;
                }
                case 'readNewsOf':
                    try {
                        // Remove command from text

                        break;
                    } catch (error) {
                        this.app.logError('Erro ao abrir site:', error);
                        break;
                    }
                case 'readNews':
                try {
                    this.app.utils.readNews();
                    break;
                } catch (error) {
                    this.app.logError('Erro ao ler notícias:', error);
                    break;
                }
            default:
                break;
        }
    }
}
