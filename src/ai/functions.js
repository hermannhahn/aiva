import St from 'gi://St';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description functions
 * @param {object} app
 */
export class Functions {
    constructor(app) {
        this.app = app;
        console.log('Functions loaded.');
    }

    readClipboardText() {
        this.app.extension.clipboard.get_text(
            St.ClipboardType.CLIPBOARD,
            (clipboard, result) => {
                if (result) {
                    let clipboardText = result;
                    this.app.azure.tts(
                        _('Start reading...') +
                            '\n ' +
                            clipboardText +
                            '\n ' +
                            _('End of text!'),
                    );
                } else {
                    this.app.chat.editResponse(
                        _('Failed to get text from clipboard'),
                    );
                }
            },
        );
    }

    callback(command, request = undefined) {
        command = command.toLowerCase();
        request = request?.toLowerCase();
        switch (command) {
            case 'read_clipboard':
                this.readClipboardText();
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
                        youtube: 'firefox https://www.youtube.com',
                        'google drive': 'firefox https://drive.google.com',
                    };
                    for (const [key, app] of Object.entries(apps)) {
                        if (request.includes(key)) {
                            this.app.chat.editResponse(_(`Opening ${key}...`));
                            this.app.utils.executeCommand(app);
                            return;
                        }
                    }

                    this.app.chat.editResponse(
                        _(
                            `Sorry, I can't open ${request} right now. Maybe in the future.`,
                        ),
                    );
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
}
