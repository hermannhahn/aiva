import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Commands {
    constructor() {
        this.local = {
            readClipboardText: [
                _('read this text'),
                _('read the text'),
                _('read the clipboard'),
                _('read copied text'),
                _('read clipboard text'),
                _('read this clipboard'),
                _('read text from clipboard'),
                _('read text in memory'),
                _('read memorized text'),
                _('read for me'),
                _('read this for me'),
                _('read text for me'),
                _('read this please'),
                _('you can read now'),
                _('read what’s copied'),
                _('read the copied content'),
                _('read the clipboard content'),
                _('read the copied message'),
            ],
            openSite: [
                _('open the site'),
                _('open this site'),
                _('open the website'),
                _('open site'),
                _('open online page'),
                _('open the page'),
                _('open the link'),
                _('open this link'),
                _('open web page'),
                _('open the web page'),
                _('go to the site'),
                _('go to the website'),
                _('access the site'),
                _('access the website'),
                _('go online'),
                _('load the site'),
                _('load the website'),
                _('visit the site'),
                _('visit the website'),
                _('navigate to the site'),
                _('navigate to the website'),
                _('take me to the site'),
                _('take me to the website'),
            ],
            openYoutubeChannel: [
                _('open the channel'),
                _('open this channel'),
                _('open channel'),
                _('open the YouTube channel'),
                _('open YouTube channel'),
                _('open the channel on YouTube'),
                _('open this channel on YouTube'),
                _('go to the channel'),
                _('go to this channel'),
                _('access the channel'),
                _('access this channel'),
                _('visit the channel'),
                _('visit this channel'),
                _('navigate to the channel'),
                _('navigate to this channel'),
                _('load the channel'),
                _('load this channel'),
                _('open YouTube'),
                _('on YouTube'),
                _('open it on YouTube'),
                _('access the channel on YouTube'),
                _('visit the channel on YouTube'),
            ],
        };
    }

    findCategoryInArrays(string, commands) {
        for (const category in commands) {
            for (let i = 0; i < commands[category].length; i++) {
                if (string.includes(commands[category][i])) {
                    // remove category from string
                    string = string.replace(commands[category][i], '');
                    return {type: category, request: string};
                }
            }
        }
        return false;
    }
}
