import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
// import Pango from 'gi://Pango';
// import PangoCairo from 'gi://PangoCairo';
// import Cairo from 'gi://cairo';
import Soup from 'gi://Soup';

import {convertMD} from './md2pango.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description app utilities
 * @param {object} app
 */
export class Utils {
    constructor(app) {
        this.app = app;
        this.log = app.log;
        this.logError = app.logError;
        this._pangoConvert = convertMD;
        this.log('Utils loaded.');
    }

    /**
     * @description format question
     * @param {string} text
     * @returns {string} formated question text
     */
    questionFormat(text) {
        text = this._pangoConvert(text);
        text = text
            .replace(/&/g, '\u0026')
            .replace(/</g, '\u003c')
            .replace(/>/g, '\u003e')
            .replace(/"/g, '\u0022')
            .replace(/'/g, '\u0027')
            .replace(/`/g, '\u0060')
            .replace(/:/g, '\u003a')
            .replace(/;/g, '\u003b');
        return text;
    }

    /**
     * @description format response
     * @param {string} text
     * @returns {string} formated response text
     */
    responseFormat(text) {
        text = this._pangoConvert(text);
        return text;
    }

    /**
     * @description create gnome notify
     * @param {string} text
     * @param {string} [type='normal']
     */
    gnomeNotify(text, type = 'normal') {
        const command =
            'notify-send --urgency=' +
            type +
            ' -a "AI Voice Assistant" ' +
            text;
        this.executeCommand(command);
    }

    /**
     * @description fetch url rss
     * @param {string} url
     * @returns list
     */
    fetchRSS(url) {
        return new Promise((resolve, reject) => {
            let session = new Soup.Session();
            let message = Soup.Message.new('GET', url);

            // Send requisition
            session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (session, res) => {
                    try {
                        let responseBytes = session.send_and_read_finish(res);
                        let responseText = new TextDecoder('utf-8').decode(
                            responseBytes.get_data(),
                        );

                        // Extract the first 10 news
                        let newsItems = [];
                        let itemRegex = /<item>(.*?)<\/item>/g;
                        let match;
                        while (
                            (match = itemRegex.exec(responseText)) !== null &&
                            newsItems.length < 10
                        ) {
                            let itemContent = match[1];

                            let titleMatch = /<title>(.*?)<\/title>/.exec(
                                itemContent,
                            );
                            let title = titleMatch ? titleMatch[1] : 'No title';

                            newsItems.push(title);
                        }

                        // returns news items
                        resolve(newsItems);
                    } catch (error) {
                        reject(
                            new Error(
                                `Failed to complete request: ${error.message}`,
                            ),
                        );
                    }
                },
            );
        });
    }

    /**
     * @description add to chat news from google
     * @param {string} topic
     * @param {string} [lang='en-US']
     * @param {*} callback
     */
    async readNews(topic = undefined, lang = 'en-US', callback) {
        try {
            let url = '';
            const countryLang = lang.split('-')[1];
            if (topic !== undefined) {
                url = `https://news.google.com/rss/search?q=${topic}&hl=${lang}&gl=${countryLang}&ceid=${countryLang}`;
            } else {
                url = `https://news.google.com/rss?hl=${lang}&gl=${countryLang}&ceid=${countryLang}`;
            }
            const fetchNews = await this.fetchRSS(url);
            const stringNews = JSON.stringify(fetchNews, null, 2);
            const preFormattedNews = stringNews
                .replace(/",/g, '\n')
                .replace(/"/g, '')
                .replace(/\[/g, '')
                .replace(/\]/g, '');

            const news = this.swapNewspaperAndNews(preFormattedNews);
            callback(`${_('Here are the main news')}:\n\n` + news);
        } catch (error) {
            callback(_('Error fetching news'));
            throw new Error(`Error fetching news: ${error}`);
        }
    }

    /**
     * @description invert string, category first, news later.
     * @param {string} newsString
     * @returns inverted string
     */
    swapNewspaperAndNews(newsString) {
        const newsArray = newsString.split('\n');
        for (let i = 0; i < newsArray.length; i++) {
            const [news, newspaper] = newsArray[i].split(' - ');
            if (news !== undefined && newspaper !== undefined) {
                newsArray[i] = `<b>${newspaper}</b>:${news}`;
            }
        }
        return newsArray.join('\n');
    }

    /**
     * @description remove gnome notification by title
     * @param {string} title
     */
    removeNotificationByTitle(title) {
        // eslint-disable-next-line no-unused-vars
        let [stdout, stderr, status] =
            GLib.spawn_command_line_async('notify-send -l');
        let notifications = stdout.toString().split('\n');

        // search title
        for (let i = 0; i < notifications.length; i++) {
            let notification = notifications[i];
            if (notification.includes(title)) {
                // get notification id
                let notificationId = notification.split('\t')[0];
                // remove notification
                GLib.spawn_command_line_async(
                    'notify-send -c ' + notificationId,
                );
                break;
            }
        }
    }

    /**
     * @description converts audio to base64
     * @param {string} filePath
     * @returns base64
     */
    encodeFileToBase64(filePath) {
        try {
            const file = Gio.File.new_for_path(filePath);
            const [, contents] = file.load_contents(null);
            return GLib.base64_encode(contents);
        } catch (error) {
            this.log('Error while encoding file to base64: ' + error);
            return null;
        }
    }

    /**
     * @description extract code and tts from text
     * @param {string} text
     * @returns {object} { code, tts }
     */
    extractCodeAndTTS(text) {
        const formatTTS = (tts) => {
            tts = text.split('*').join('');
            tts = tts
                .replace(/&/g, '')
                .replace(/</g, '')
                .replace(/>/g, '')
                .replace(/`{3}/g, '')
                .replace(/<code>/g, '') // Remove open <code> tags
                .replace(/<\/code>/g, '') // Remove tags close </code> tags
                .replace(/\[red\](.*?)\[\/red\]/g, '')
                .replace(/\[green\](.*?)\[\/green\]/g, '')
                .replace(/\[yellow\](.*?)\[\/yellow\]/g, '')
                .replace(/\[cyan\](.*?)\[\/cyan\]/g, '')
                .replace(/\[white\](.*?)\[\/white\]/g, '')
                .replace(/\[black\](.*?)\[\/black\]/g, '')
                .replace(/\[gray\](.*?)\[\/gray\]/g, '')
                .replace(/\[brown\](.*?)\[\/brown\]/g, '')
                .replace(/\[blue\](.*?)\[\/blue\]/g, '')
                .replace(/\[(.*?)\]\((.*?)\)/g, '') // Remove links from tts
                .replace(/https?:\/\/[^\s"]*/g, '');

            return tts;
        };

        // If tts is more then 2000 characters, change tts text
        // if (tts.length > 2000) {
        //     tts = this.randomPhraseToShowOnScreen();
        // }

        // Search for code example
        const regex = /`{3}([\s\S]*?)`{3}/;
        const match = text.match(regex);

        if (match) {
            // If found more match, add to code result
            let code = match[1];
            let nextMatch = text.match(regex);
            while (nextMatch) {
                code += nextMatch[1];
                text = text.replace(nextMatch[0], _('Look at example below:'));
                nextMatch = text.match(regex);
            }
            this.log('code detected!');
            let tts = formatTTS(text);
            return {code, tts};
        } else {
            // If not
            let tts = formatTTS(text);
            this.log('code not detected!');
            return {code: null, tts};
        }
    }

    /**
     * @description execute shell command
     * @param {string} cmd
     * @returns
     */
    executeCommand(cmd) {
        const command = cmd;
        try {
            const process = GLib.spawn_async(
                null, // pasta de trabalho
                ['/bin/sh', '-c', command], // comando e argumentos
                null, // opções
                GLib.SpawnFlags.SEARCH_PATH, // flags
                null, // PID
            );
            return process;
        } catch (error) {
            throw new Error(`Failed to complete request: ${error.message}`);
        }
    }

    /**
     * @description check if app is installed
     * @param {string} command
     * @returns {boolean} [true/false]
     */
    isAppInstalled(command) {
        try {
            this.log('Checking if app is installed: ' + command);
            const process = GLib.spawn_command_line_sync(`which ${command}`);
            this.log('Process: ' + process[0]);
            return process[0];
        } catch (error) {
            this.logError('Error checking if app is installed:', error);
            return false;
        }
    }

    /**
     * @description remove all gva .wav files from /tmp folder
     */
    removeWavFiles() {
        this.log('Removing all .wav files from /tmp folder');
        const command = 'rm -rf /tmp/gva*.wav';
        const process = GLib.spawn_async(
            null, // pasta de trabalho
            ['/bin/sh', '-c', command], // comando e argumentos
            null, // opções
            GLib.SpawnFlags.SEARCH_PATH, // flags
            null, // PID
        );

        if (process) {
            this.log('Wav files removed successfully.');
        } else {
            this.log('Error removing wav files.');
        }
    }

    /**
     * @description send curl
     * @param {string} url
     * @param {*} callback
     */
    curl(url, callback) {
        try {
            let _httpSession = new Soup.Session();
            let message = Soup.Message.new('GET', url);
            _httpSession.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (_httpSession, result) => {
                    let bytes = _httpSession.send_and_read_finish(result);
                    let decoder = new TextDecoder('utf-8');
                    let response = decoder.decode(bytes.get_data());
                    callback(response);
                },
            );
        } catch {
            throw new Error('Failed to complete request.');
        }
    }

    isDayString(res) {
        switch (res.current.is_day) {
            case 0:
                return _('night');
            case 1:
                return _('day');
            default:
                return _('unknown');
        }
    }

    sensationString(res) {
        if (res.current.apparent_temperature < 10) {
            return _('the weather is cold');
        }
        if (
            res.current.apparent_temperature >= 10 &&
            res.current.apparent_temperature < 25
        ) {
            return _('the weather is mild');
        }
        if (
            res.current.apparent_temperature >= 25 &&
            res.current.apparent_temperature < 35
        ) {
            return _('the weather is warm');
        }
        if (res.current.apparent_temperature >= 35) {
            return _('the weather is hot');
        }
        return '';
    }

    climeStatus(res) {
        let clime = '';
        if (res.current.precipitation > 0) {
            clime = _(' and is raining');
        }
        if (res.current.snowfall > 0) {
            clime = _(' and is snowing');
        }
        if (res.current.is_day === 1) {
            clime = _(' and is sunny');
        }
        return clime;
    }

    /**
     * @description load json file
     * @param {string} filename
     */
    loadJsonFile = (filename) => {
        let contents;
        const datadir = Gio.File.new_for_path(
            Gio.get_user_data_dir(),
        ).get_path();
        filename = Gio.File.new_for_path(datadir + '/' + filename).get_path();
        try {
            contents = Gio.File.new_for_path(filename)
                .load_contents(null)[1]
                .toString();
        } catch (e) {
            logError(e);
            return null;
        }

        return contents;
    };

    /**
     * @description color adjust
     * @param {string} rgbString - rgb string
     * @param {string} mode - darken or lighten
     * @param {string} factor
     * @returns {string} '12, 12, 12'
     */
    adjustColor(rgbString, mode = 'darken', factor = '10') {
        // Split the RGB string into its component parts.
        const [r, g, b] = rgbString.split(',');

        // Convert the component parts to integers.
        const rInt = parseInt(r);
        const gInt = parseInt(g);
        const bInt = parseInt(b);
        const factorInt = parseInt(factor);

        // Adjust the brightness of each component.
        let rAdjusted, gAdjusted, bAdjusted;

        switch (mode) {
            case 'darken':
                rAdjusted = rInt > 0 ? rInt - factorInt : rInt;
                gAdjusted = gInt > 0 ? gInt - factorInt : gInt;
                bAdjusted = bInt > 0 ? bInt - factorInt : bInt;
                break;
            case 'lighten':
                rAdjusted = rInt < 255 ? rInt + factorInt : rInt;
                gAdjusted = gInt < 255 ? gInt + factorInt : gInt;
                bAdjusted = bInt < 255 ? bInt + factorInt : bInt;
                break;
            default:
                break;
        }

        // Convert the adjusted component parts back to a string.
        const adjustedRgbString = `${rAdjusted},${gAdjusted},${bAdjusted}`;

        return adjustedRgbString;
    }

    /**
     * @description Fetches and returns the text content of a website from the given URL, with all HTML tags removed.
     * @param {string} url - The URL of the website to fetch.
     * @param {*} callback
     */
    readUrlText(url, callback) {
        try {
            let _httpSession = new Soup.Session();
            let message = Soup.Message.new('GET', url);
            _httpSession.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (_httpSession, result) => {
                    let bytes = _httpSession.send_and_read_finish(result);
                    let decoder = new TextDecoder('utf-8');
                    let response = decoder.decode(bytes.get_data());
                    const plainText = response.replace(/<[^>]*>/g, '');
                    callback(plainText);
                },
            );

            // Remove HTML tags using a regular expression
        } catch (error) {
            throw new Error(`Failed to complete request: ${error.message}`);
        }
    }
}
