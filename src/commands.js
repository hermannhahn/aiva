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
