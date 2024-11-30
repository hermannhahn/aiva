import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Commands {
    get() {
        const commands = {
            readClipboardText: [
                _('read this'),
                _('read that'),
                _('read text'),
                _('read copied'),
                _('read clipboard'),
                _('read memorized'),
                _('read the text'),
                _('read the clipboard'),
                _('read the copied'),
                _('read text from clipboard'),
                _('read text from memory'),
                _('read for me'),
                _('you can read now'),
                _("read what's copied"),
            ],
            openSite: [
                _('open the site'),
                _('open this site'),
                _('open the website'),
                _('open site'),
                _('open page'),
                _('open the page'),
                _('open the link'),
                _('open this link'),
                _('open web page'),
                _('open the web page'),
                _('go to the site'),
                _('go to the website'),
                _('access the site'),
                _('access the website'),
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
                _('open the youtube channel'),
                _('open this youtube channel'),
                _('open youtube channel'),
                _('open the youtube channel'),
                _('open youtube channel'),
                _('open the channel on youtube'),
                _('open this channel on youtube'),
                _('go to the youtube channel'),
                _('go to this youtube channel'),
                _('access the youtube channel'),
                _('access this youtube channel'),
                _('visit the youtube channel'),
                _('visit this youtube channel'),
                _('navigate to the youtube channel'),
                _('navigate to this youtube channel'),
                _('load the youtube channel'),
                _('load this youtube channel'),
                _('access the channel on youtube'),
                _('visit the channel on youtube'),
            ],
        };
        return commands;
    }

    findCategoryInArrays(string, commands) {
        string = string.toLowerCase();
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
