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
            _('open-var-1'),
            _('open-var-2'),
            _('start'),
            _('start-var-1'),
            _('start-var-2'),
            _('launch'),
            _('launch-var-1'),
            _('launch-var-2'),
            _('run'),
            _('run-var-1'),
            _('run-var-2'),
            _('execute'),
            _('execute-var-1'),
            _('execute-var-2'),
            _('read'),
            _('read-var-1'),
            _('read-var-2'),
            _('write'),
            _('write-var-1'),
            _('write-var-2'),
            _('access'),
            _('access-var-1'),
            _('access-var-2'),
            _('load'),
            _('load-var-1'),
            _('load-var-2'),
            _('visit'),
            _('visit-var-1'),
            _('visit-var-2'),
            _('browse'),
            _('browse-var-1'),
            _('browse-var-2'),
            _('join'),
            _('join-var-1'),
            _('join-var-2'),
            _('enter'),
            _('enter-var-1'),
            _('enter-var-2'),
            _('navigate'),
            _('navigate-var-1'),
            _('navigate-var-2'),
            _('go'),
            _('go-var-1'),
            _('go-var-2'),
            _('take me'),
            _('take me-var-1'),
            _('take me-var-2'),
        ];

        this.suffix = [
            _('in the'),
            _('in the-var-1'),
            _('in the-var-2'),
            _('to the'),
            _('to the-var-1'),
            _('to the-var-2'),
            _('in this'),
            _('in this-var-1'),
            _('in this-var-2'),
            _('to this'),
            _('to this-var-1'),
            _('to this-var-2'),
            _('in that'),
            _('in that-var-1'),
            _('in that-var-2'),
            _('to that'),
            _('to that-var-1'),
            _('to that-var-2'),
            _('this'),
            _('this-var-1'),
            _('this-var-2'),
            _('that'),
            _('that-var-1'),
            _('that-var-2'),
            _('in'),
            _('in-var-1'),
            _('in-var-2'),
            _('to'),
            _('to-var-1'),
            _('to-var-2'),
            _('the'),
            _('the-var-1'),
            _('the-var-2'),
            _('on'),
            _('on-var-1'),
            _('on-var-2'),
            _('at'),
            _('at-var-1'),
            _('at-var-2'),
            _('of'),
            _('of-var-1'),
            _('of-var-2'),
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
            _('text'),
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
}
