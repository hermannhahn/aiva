import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Commands {
    constructor() {
        this.assistant = [_('computer'), 'aiva'];

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
            _('enter'),
            _('enter-var-1'),
            _('enter-var-2'),
            _('navigate'),
            _('navigate-var-1'),
            _('navigate-var-2'),
            _('go'),
        ];

        this.suffix = [
            _('in the'),
            _('in the-var-1'),
            _('in the-var-2'),
            _('in the-var-3'),
            _('in the-var-4'),
            _('in the-var-5'),
            _('to the'),
            _('to the-var-1'),
            _('to the-var-2'),
            _('to the-var-3'),
            _('to the-var-4'),
            _('to the-var-5'),
            _('in this'),
            _('in this-var-1'),
            _('in this-var-2'),
            _('in this-var-3'),
            _('in this-var-4'),
            _('in this-var-5'),
            _('to this'),
            _('to this-var-1'),
            _('to this-var-2'),
            _('to this-var-3'),
            _('to this-var-4'),
            _('to this-var-5'),
            _('to this-var-6'),
            _('to this-var-7'),
            _('in that'),
            _('in that-var-1'),
            _('in that-var-2'),
            _('in that-var-3'),
            _('in that-var-4'),
            _('in that-var-5'),
            _('to that'),
            _('to that-var-1'),
            _('to that-var-2'),
            _('to that-var-3'),
            _('to that-var-4'),
            _('to that-var-5'),
            _('this'),
            _('this-var-1'),
            _('this-var-2'),
            _('this-var-3'),
            _('this-var-4'),
            _('this-var-5'),
            _('that'),
            _('that-var-1'),
            _('that-var-2'),
            _('that-var-3'),
            _('that-var-4'),
            _('that-var-5'),
            _('in'),
            _('in-var-1'),
            _('in-var-2'),
            _('in-var-3'),
            _('in-var-4'),
            _('in-var-5'),
            _('to'),
            _('to-var-1'),
            _('to-var-2'),
            _('to-var-3'),
            _('to-var-4'),
            _('to-var-5'),
            _('the'),
            _('the-var-1'),
            _('the-var-2'),
            _('the-var-3'),
            _('the-var-4'),
            _('the-var-5'),
        ];

        this.functions = [
            {
                functionDeclarations: [
                    {
                        name: 'get_current_weather',
                        description:
                            'Get the current weather in a given location',
                        parameters: {
                            type: 'OBJECT',
                            properties: {
                                location: {
                                    type: 'STRING',
                                    description:
                                        'The city and state, e.g. San Francisco, CA',
                                },
                                unit: {
                                    type: 'STRING',
                                    enum: ['celsius', 'fahrenheit'],
                                },
                            },
                            required: ['location'],
                        },
                    },
                    {
                        name: 'get_locations',
                        description:
                            'Get latitude and longitude for one or more locations',
                        parameters: {
                            type: 'OBJECT',
                            properties: {
                                locations: {
                                    type: 'ARRAY',
                                    description: 'A list of locations',
                                    items: {
                                        description: 'The address',
                                        type: 'OBJECT',
                                        properties: {
                                            poi: {
                                                type: 'STRING',
                                                description:
                                                    'Point of interest',
                                            },
                                            street: {
                                                type: 'STRING',
                                                description: 'Street name',
                                            },
                                            city: {
                                                type: 'STRING',
                                                description: 'City name',
                                            },
                                            county: {
                                                type: 'STRING',
                                                description: 'County name',
                                            },
                                            state: {
                                                type: 'STRING',
                                                description: 'State name',
                                            },
                                            country: {
                                                type: 'STRING',
                                                description: 'Country name',
                                            },
                                            postal_code: {
                                                type: 'STRING',
                                                description: 'Postal code',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        name: 'open_app',
                        description: 'open app by name or description',
                        parameters: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string',
                                    description:
                                        'The name of the app e.g. Google Chrome',
                                },
                            },
                            required: ['name'],
                        },
                    },
                    {
                        name: 'read_clipboard',
                        description:
                            'read text from clipboard, or non specified source, like: read this for me',
                    },
                ],
            },
        ];
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
