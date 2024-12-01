import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Commands {
    get(list) {
        const activation = [
            _('computer'),
            'aiva',
            this.app.userSettings.ASSIST_NAME,
        ];
        if (list === 'activation') {
            return activation;
        }

        const commandList = [
            _('open'),
            _('start'),
            _('launch'),
            _('run'),
            _('execute'),
            _('read'),
            _('write'),
            _('access'),
            _('load'),
            _('visit'),
            _('browse'),
            _('join'),
            _('enter'),
            _('navigate'),
            _('go'),
            _('take me'),
        ];
        if (list === 'commandList') {
            return commandList;
        }

        const commandSuffixList = [
            _('this'),
            _('that'),
            _('in'),
            _('to'),
            _('the'),
            _('on'),
            _('at'),
            _('of'),
            _('in the'),
            _('to the'),
            _('in this'),
            _('to this'),
            _('in that'),
            _('to that'),
        ];
        if (list === 'commandSuffixList') {
            return commandSuffixList;
        }

        const commandOptions = [
            _('website'),
            _('webpage'),
            _('web'),
            _('site'),
            _('page'),
            _('url'),
            _('app'),
            _('software'),
            _('application'),
        ];
        if (list === 'commandOptions') {
            return commandOptions;
        }

        const commands = {
            read_clipboard: [
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
            open_site: [
                _('go site'),
                _('open site'),
                _('access site'),
                _('load site'),
                _('visit site'),
                _('browse site'),
                _('join site'),
                _('enter site'),
                _('navigate site'),
                _('go page'),
                _('open page'),
                _('access page'),
                _('load page'),
                _('visit page'),
                _('browse page'),
                _('join page'),
                _('enter page'),
                _('navigate page'),
                _('go link'),
                _('open link'),
                _('access link'),
                _('load link'),
                _('visit link'),
                _('browse link'),
                _('join link'),
                _('enter link'),
                _('navigate link'),
                _('go website'),
                _('open website'),
                _('access website'),
                _('load website'),
                _('visit website'),
                _('browse website'),
                _('join website'),
                _('enter website'),
                _('navigate website'),
                _('go webpage'),
                _('open webpage'),
                _('access webpage'),
                _('load webpage'),
                _('visit webpage'),
                _('browse webpage'),
                _('join webpage'),
                _('enter webpage'),
                _('navigate webpage'),
                _('go url'),
                _('open url'),
                _('access url'),
                _('load url'),
                _('visit url'),
                _('browse url'),
                _('join url'),
                _('enter url'),
                _('navigate url'),
                _('go web'),
                _('open web'),
                _('access web'),
                _('load web'),
                _('visit web'),
                _('browse web'),
                _('join web'),
                _('enter web'),
                _('navigate web'),

                _('go the site'),
                _('open the site'),
                _('access the site'),
                _('load the site'),
                _('visit the site'),
                _('browse the site'),
                _('join the site'),
                _('enter the site'),
                _('navigate the site'),

                _('go this site'),
                _('open this site'),
                _('access this site'),
                _('load this site'),
                _('visit this site'),
                _('browse this site'),
                _('join this site'),
                _('enter this site'),
                _('navigate this site'),

                _('go that site'),
                _('open that site'),
                _('access that site'),
                _('load that site'),
                _('visit that site'),
                _('browse that site'),
                _('join that site'),
                _('enter that site'),
                _('navigate that site'),

                _('go in site'),
                _('open in site'),
                _('access in site'),
                _('load in site'),
                _('visit in site'),
                _('browse in site'),
                _('join in site'),
                _('enter in site'),
                _('navigate in site'),

                _('go in the site'),
                _('open in the site'),
                _('access in the site'),
                _('load in the site'),
                _('visit in the site'),
                _('browse in the site'),
                _('join in the site'),
                _('enter in the site'),
                _('navigate in the site'),

                _('go in this site'),
                _('open in this site'),
                _('access in this site'),
                _('load in this site'),
                _('visit in this site'),
                _('browse in this site'),
                _('join in this site'),
                _('enter in this site'),
                _('navigate in this site'),

                _('go in that site'),
                _('open in that site'),
                _('access in that site'),
                _('load in that site'),
                _('visit in that site'),
                _('browse in that site'),
                _('join in that site'),
                _('enter in that site'),
                _('navigate in that site'),

                _('go to site'),
                _('open to site'),
                _('access to site'),
                _('load to site'),
                _('visit to site'),
                _('browse to site'),
                _('join to site'),
                _('enter to site'),
                _('navigate to site'),

                _('go to the site'),
                _('open to the site'),
                _('access to the site'),
                _('load to the site'),
                _('visit to the site'),
                _('browse to the site'),
                _('join to the site'),
                _('enter to the site'),
                _('navigate to the site'),

                _('go to this site'),
                _('open to this site'),
                _('access to this site'),
                _('load to this site'),
                _('visit to this site'),
                _('browse to this site'),
                _('join to this site'),
                _('enter to this site'),
                _('navigate to this site'),

                _('go to that site'),
                _('open to that site'),
                _('access to that site'),
                _('load to that site'),
                _('visit to that site'),
                _('browse to that site'),
                _('join to that site'),
                _('enter to that site'),
                _('navigate to that site'),
            ],
            open_app: [
                _('open the app'),
                _('open this app'),
                _('open the application'),
                _('open this application'),
                _('open app'),
                _('open application'),
                _('open'),
                _('start'),
                _('launch'),
                _('run'),
                _('execute'),
            ],
        };
        if (list === 'commands') {
            return commands;
        }
        return false;
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

    toolCommandActivation(string) {
        string = string.toLowerCase();
        let activation = this.get('activation');
        for (let i = 0; i < activation.length; i++) {
            if (string.includes(activation[i])) {
                return true;
            }
        }
        return false;
    }
}
