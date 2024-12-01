import {Commands} from './commands.js';
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
        let commands = this.commands.get();

        // get the first ten words from text
        text = text.split(/\s+/).slice(0, 10).join(' ');

        let commandToRun = this.commands.findCategoryInArrays(text, commands);
        this.app.log('Command Type:' + commandToRun.type);
        this.app.log('Command Request:' + commandToRun.request);

        if (commandToRun) {
            result.success = true;
            result.command = commandToRun.type;
            result.request = commandToRun.request;
            return result;
        }

        return result;
    }

    async _localCommand(command, request = undefined) {
        switch (command) {
            case 'read_clipboard':
                try {
                    await this.app.utils.readClipboardText();
                } catch (error) {
                    this.app.chat.editResponse(
                        _('Error reading clipboard text'),
                    );
                    this.app.logError('Error reading clipboard text:', error);
                }
                break;
            case 'open_youtube_channel':
                try {
                    this.app.chat.editResponse(this.phrases.wait());
                    const urls = {
                        'cnn brasil': 'https://www.youtube.com/@CNNbrasil/live',
                        'uol news': 'https://www.youtube.com/@uolnews/live',
                        sbt: 'https://www.youtube.com/@SBT/live',
                        'band news': 'https://www.youtube.com/@BandNews/live',
                        'globo news': 'https://www.youtube.com/@GloboNews/live',
                        'jovem pan news':
                            'https://www.youtube.com/@JovemPanNews/live',
                        veja: 'https://www.youtube.com/@VEJA/live',
                        'record news':
                            'https://www.youtube.com/@recordnews/live',
                        cultura: 'https://www.youtube.com/@cultura/live',
                        'canal brasil':
                            'https://www.youtube.com/@CanalBrasil/live',
                        'felipe neto': 'https://www.youtube.com/@felipeneto',
                        'manual do mundo':
                            'https://www.youtube.com/@ManualDoMundo',
                        PewDiePie: 'https://www.youtube.com/user/pewdiepie',
                        'T-Series': 'https://www.youtube.com/user/tseries',
                        flow: 'https://www.youtube.com/user/flow',
                    };

                    for (const [key, url] of Object.entries(urls)) {
                        if (request.includes(key)) {
                            this.app.chat.editResponse(_(`Opening ${key}...`));
                            this.app.utils.executeCommand(`firefox ${url}`);
                            return;
                        }
                    }
                    // search channel
                    this.app.chat.editResponse(
                        _('Searching for') + ` ${request}...`,
                    );
                    this.app.utils.executeCommand(
                        `firefox https://www.youtube.com/results?search_query=${request}`,
                    );
                } catch (error) {
                    this.app.logError('Error opening channel:', error);
                    this.app.chat.editResponse(_('Error opening channel'));
                }
                break;
            case 'open_site':
                try {
                    const urls = {
                        youtube: 'https://www.youtube.com',
                        'cnn brasil': 'https://www.youtube.com/@CNNbrasil/live',
                        uol: 'https://www.uol.com.br',
                        'uol news': 'https://www.uol.com.br/noticias',
                        sbt: 'https://www.sbt.com.br',
                        'band news': 'https://www.band.uol.com.br',
                        'globo news': 'https://www.globo.com',
                        google: 'https://www.google.com',
                        hotmail: 'https://outlook.live.com/owa/',
                        outlook: 'https://outlook.live.com/owa/',
                        gmail: 'https://mail.google.com/mail/u/0/#inbox',
                        'google docs': 'https://docs.google.com',
                        'google drive': 'https://www.google.com/drive',
                        'google photos': 'https://photos.google.com',
                        'google translate': 'https://translate.google.com',
                        'google sheets': 'https://sheets.google.com',
                        'google slides': 'https://slides.google.com',
                        'google forms': 'https://forms.google.com',
                        'google calendar': 'https://calendar.google.com',
                        'google maps': 'https://www.google.com/maps',
                        'google meet': 'https://meet.google.com',
                        xvideos: 'https://www.xvideos.com',
                        xhamster: 'https://www.xhamster.com',
                        pornhub: 'https://www.pornhub.com',
                        steam: 'https://store.steampowered.com',
                        twitch: 'https://www.twitch.tv',
                        facebook: 'https://www.facebook.com',
                        instagram: 'https://www.instagram.com',
                        twitter: 'https://twitter.com',
                        reddit: 'https://www.reddit.com',
                        wikipedia: 'https://www.wikipedia.org',
                        imdb: 'https://www.imdb.com',
                        amazon: 'https://www.amazon.com',
                        ebay: 'https://www.ebay.com',
                        'mercado livre': 'https://www.mercadolivre.com.br',
                        'epic games store': 'https://www.epicgames.com/store',
                        'epic games': 'https://www.epicgames.com/store/',
                        'epic store': 'https://www.epicgames.com/store',
                        epic: 'https://www.epicgames.com',
                    };

                    for (const [key, url] of Object.entries(urls)) {
                        if (request.includes(key)) {
                            this.app.chat.editResponse(_(`Opening ${key}...`));
                            this.app.utils.executeCommand(`firefox ${url}`);
                            return;
                        }
                    }

                    // search site
                    this.app.chat.editResponse(
                        _('Searching for') + ` ${request}...`,
                    );
                    this.app.utils.executeCommand(
                        `firefox https://www.google.com/search?q=${request}`,
                    );
                } catch (error) {
                    throw new Error('Error opening site:', error);
                }
                break;
            case 'open_app':
                try {
                    const apps = {
                        calculator: 'gnome-calculator',
                        terminal: 'gnome-terminal',
                        files: 'nautilus',
                        settings: 'gnome-control-center',
                        weather: 'gnome-weather',
                        calendar: 'gnome-calendar',
                        clock: 'gnome-clocks',
                        maps: 'gnome-maps',
                        photos: 'gnome-photos',
                        music: 'gnome-music',
                        videos: 'gnome-videos',
                        documents: 'org.gnome.Nautilus.Document',
                    };
                    for (const [key, app] of Object.entries(apps)) {
                        if (request.includes(key)) {
                            this.app.chat.editResponse(_(`Opening ${key}...`));
                            this.app.utils.executeCommand(`gnome-open ${app}`);
                            break;
                        }
                    }
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
