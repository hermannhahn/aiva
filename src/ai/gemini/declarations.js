import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description gemini functions
 * @param {object} app
 */
export class FunctionsDeclarations {
    constructor(app) {
        this.app = app;

        this.readClipboard = {
            name: 'read_clipboard',
            description: _('Clipboard Text-to-Speech'),
            parameters: {
                type: 'object',
                properties: {
                    response: {
                        type: 'string',
                        description:
                            _('Response text before run, e.g.: ') +
                            _('Sure, start reading...'),
                    },
                },
                required: ['response'],
            },
        };

        this.cmd = {
            name: 'command_line',
            description:
                _('Run non-sudo commandline in the user terminal') +
                '. [OS: Ubuntu 24.04.1 LTS]',
            parameters: {
                type: 'object',
                properties: {
                    commandLine: {
                        type: 'string',
                        description: _('commandline to run'),
                    },
                    response: {
                        type: 'string',
                        description:
                            _('Response text before run, e.g.: ') +
                            _('Sure, opening GNOME Software...'),
                    },
                },
                required: ['commandLine', 'response'],
            },
        };

        this.browse = {
            name: 'browse_web',
            description: _('Open url in the browser.'),
            parameters: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description:
                            _('URL to open, e.g.: ') + 'https://google.com',
                    },
                    response: {
                        type: 'string',
                        description:
                            _('Response text before open, e.g.: ') +
                            _('Sure, opening...'),
                    },
                },
                required: ['url'],
            },
        };

        this.weather = {
            name: 'get_weather',
            description: _(
                'Show the weather for today. Use only if user wants to know weather information.',
            ),
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description:
                            _(
                                'Provide a location, e.g.: "New York, NY" (always use this format)',
                            ) +
                            ' ' +
                            _(
                                "or don't provide a location to show weather from user location",
                            ),
                    },
                },
            },
        };

        console.log('Functions Declarations loaded.');
    }

    get(text) {
        let functionDeclarations = [];
        text = text.replace(/[.,!?;:"]/g, '');
        const words = text.toLowerCase().split(' ');
        const firstFiveWords = words.slice(0, 5);
        const firstTenWords = words.slice(0, 10);

        for (const cmdActivation of firstFiveWords) {
            // read
            if (
                this.app.gemini.function.activation.read.includes(cmdActivation)
            ) {
                for (const cmdFunction of firstTenWords) {
                    // clipboard
                    if (
                        this.app.gemini.function.activation.clipboard.includes(
                            cmdFunction,
                        )
                    ) {
                        functionDeclarations.push(this.readClipboard);
                    }
                }
            }
            // browse
            if (
                this.app.gemini.function.activation.browse.includes(
                    cmdActivation,
                )
            ) {
                for (const cmdFunction of firstTenWords) {
                    // site
                    if (
                        this.app.gemini.function.activation.site.includes(
                            cmdFunction,
                        )
                    ) {
                        functionDeclarations.push(this.browse);
                    }
                }
            }
            // pre weather
            if (
                this.app.gemini.function.activation.preweather.includes(
                    cmdActivation,
                )
            ) {
                for (const cmdFunction of firstTenWords) {
                    // weather
                    if (
                        this.app.gemini.function.activation.weather.includes(
                            cmdFunction,
                        )
                    ) {
                        functionDeclarations.push(this.weather);
                    }
                }
            }
            // app
            if (
                this.app.gemini.function.activation.open.includes(cmdActivation)
            ) {
                // commandline
                functionDeclarations.push(this.cmd);
            }
        }

        return [{functionDeclarations}];
    }
}
