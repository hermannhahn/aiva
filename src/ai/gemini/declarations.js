import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {FunctionsActivations} from './activations.js';

/**
 * @description gemini functions
 */
export class FunctionsDeclarations {
    constructor() {
        this.activation = new FunctionsActivations();

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

        // read clipboard
        let isCommand = this.checkTextActivation(
            text,
            this.activation.read,
            this.activation.clipboard,
        );
        if (isCommand) {
            functionDeclarations.push(this.readClipboard);
        }
        // browse
        isCommand = this.checkTextActivation(
            text,
            this.activation.browse,
            this.activation.site,
        );
        if (isCommand) {
            functionDeclarations.push(this.browse);
        }
        // pre weather
        isCommand = this.checkTextActivation(
            text,
            this.activation.preweather,
            this.activation.weather,
        );
        if (isCommand) {
            functionDeclarations.push(this.weather);
        }
        // app
        isCommand = this.checkTextActivation(
            text,
            this.activation.open,
            this.activation.applist,
        );
        if (isCommand) {
            functionDeclarations.push(this.cmd);
        }

        return [{functionDeclarations}];
    }

    checkTextActivation(text, cmdActivation, cmdFunction) {
        // Remove pontuações como vírgulas e pontos ao final das palavras
        const sanitizedText = text.replace(/[.,!?]/g, '');
        const normalizedText = sanitizedText.toLowerCase();

        // Divide o texto em palavras
        const words = normalizedText.split(/\s+/);

        // Verifica se as 5 primeiras palavras contêm alguma palavra de cmdActivation
        const hasActivation = words
            .slice(0, 5)
            .some((word) => cmdActivation.includes(word));

        // Se não contém palavra de ativação, retorna false
        if (!hasActivation) {
            return false;
        }

        // Verifica se as 10 primeiras palavras contêm alguma palavra de cmdFunction
        const hasFunction = words
            .slice(0, 10)
            .some((word) => cmdFunction.includes(word));

        return hasFunction;
    }
}
