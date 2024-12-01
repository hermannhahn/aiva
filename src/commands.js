import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Commands {
    constructor() {
        this.assistant = [
            _('computer'),
            'aiva',
            this.app.userSettings.ASSIST_NAME,
        ];

        this.activation = [
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

        this.suffix = [
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

        this.options = [
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

        this.function = {
            read_clipboard: {
                description: _('Read text from clipboard'),
                parameters: {
                    type: 'object',
                    properties: {},
                    required: ['clipboard'],
                },
            },
        };
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
