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
                _('please open the site'),
                _('could you open the site?'),
                _('can you open the site?'),
                _('open this site'),
                _('please open this site'),
                _('could you open this site?'),
                _('open the website'),
                _('please open the website'),
                _('could you open the website?'),
                _('can you open the website?'),
                _('open site'),
                _('please open site'),
                _('could you open site?'),
                _('can you open site?'),
                _('open this website'),
                _('please open this website'),
                _('open online page'),
                _('please open online page'),
                _('open the page'),
                _('please open the page'),
                _('open the link'),
                _('please open the link'),
                _('open this link'),
                _('please open this link'),
                _('open web page'),
                _('please open web page'),
                _('open the web page'),
                _('please open the web page'),
                _('go to the site'),
                _('please go to the site'),
                _('go to the website'),
                _('please go to the website'),
                _('access the site'),
                _('please access the site'),
                _('access the website'),
                _('please access the website'),
                _('go online'),
                _('please go online'),
                _('load the site'),
                _('please load the site'),
                _('load the website'),
                _('please load the website'),
                _('visit the site'),
                _('please visit the site'),
                _('visit the website'),
                _('please visit the website'),
                _('can you visit the site?'),
                _('can you visit the website?'),
                _('navigate to the site'),
                _('please navigate to the site'),
                _('navigate to the website'),
                _('please navigate to the website'),
                _('take me to the site'),
                _('please take me to the site'),
                _('take me to the website'),
                _('please take me to the website'),
            ],
            openYoutubeChannel: [
                _('open the channel'),
                _('please open the channel'),
                _('could you open the channel?'),
                _('can you open the channel?'),
                _('open this channel'),
                _('please open this channel'),
                _('open channel'),
                _('please open channel'),
                _('could you open channel?'),
                _('open the YouTube channel'),
                _('please open the YouTube channel'),
                _('could you open the YouTube channel?'),
                _('can you open the YouTube channel?'),
                _('open this YouTube channel'),
                _('please open this YouTube channel'),
                _('open YouTube channel'),
                _('please open YouTube channel'),
                _('open the channel on YouTube'),
                _('please open the channel on YouTube'),
                _('could you open the channel on YouTube?'),
                _('can you open the channel on YouTube?'),
                _('open this channel on YouTube'),
                _('please open this channel on YouTube'),
                _('go to the channel'),
                _('please go to the channel'),
                _('go to this channel'),
                _('please go to this channel'),
                _('access the channel'),
                _('please access the channel'),
                _('access this channel'),
                _('please access this channel'),
                _('visit the channel'),
                _('please visit the channel'),
                _('visit this channel'),
                _('please visit this channel'),
                _('navigate to the channel'),
                _('please navigate to the channel'),
                _('navigate to this channel'),
                _('please navigate to this channel'),
                _('load the channel'),
                _('please load the channel'),
                _('load this channel'),
                _('please load this channel'),
                _('open YouTube'),
                _('please open YouTube'),
                _('on YouTube'),
                _('open it on YouTube'),
                _('please open it on YouTube'),
                _('could you open it on YouTube?'),
                _('can you open it on YouTube?'),
                _('access the channel on YouTube'),
                _('please access the channel on YouTube'),
                _('visit the channel on YouTube'),
                _('please visit the channel on YouTube'),
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
