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
            description: _('Text-to-Speech, read copied text from clipboard'),
            parameters: {
                type: 'object',
                properties: {
                    response: {
                        type: 'string',
                        description:
                            _('Response text before start read, e.g.: ') +
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
        // Normalização do texto
        const sanitizedText = text
            .replace(/[.,!?]/g, '')
            .toLowerCase()
            .split(/\s+/);

        console.log('Sanitized Text: ' + JSON.stringify(sanitizedText));

        // Função auxiliar para verificar se uma frase está contida na ordem correta
        function containsPhraseInOrder(text, phrase) {
            let index = 0;
            for (const word of phrase) {
                index = text.indexOf(word, index);
                if (index === -1) {
                    return false;
                }
            }
            return true;
        }

        // Verifica se alguma frase de ativação está nas primeiras 5 palavras
        let hasActivation = cmdActivation.some((phrase) =>
            containsPhraseInOrder(sanitizedText.slice(0, 5).join(' '), phrase),
        );

        // Verifica se alguma frase de função está nas primeiras 10 palavras
        let hasFunction = cmdFunction.some((phrase) =>
            containsPhraseInOrder(sanitizedText.slice(0, 10).join(' '), phrase),
        );

        console.log(
            'Has Activation: ' +
                hasActivation +
                ' Has Function: ' +
                hasFunction,
        );

        return hasActivation && hasFunction;
    }

    // checkTextActivation(text, cmdActivation, cmdFunction) {
    //     // Normaliza o texto: remove pontuações, transforma em minúsculas e divide em palavras
    //     const sanitizedText = text
    //         .replace(/[.,!?]/g, '') // Remove pontuações
    //         .toLowerCase(); // Transforma em minúsculas

    //     const words = sanitizedText.split(/\s+/); // Divide em palavras

    //     // Junta as 5 primeiras palavras em uma string para buscar frases
    //     const firstFiveWords = words.slice(0, 5).join(' ');

    //     // Junta as 10 primeiras palavras em uma string para buscar frases
    //     const firstTenWords = words.slice(0, 10).join(' ');

    //     // Verifica se alguma frase ou palavra de cmdActivation está nas 5 primeiras palavras
    //     let hasActivation = false;
    //     for (const phrase of cmdActivation) {
    //         if (firstFiveWords.includes(phrase.toLowerCase())) {
    //             hasActivation = true;
    //             break;
    //         }
    //     }

    //     // Se não contém ativação, retorna false
    //     if (!hasActivation) {
    //         return false;
    //     }

    //     // Verifica se alguma frase ou palavra de cmdFunction está nas 10 primeiras palavras
    //     let hasFunction = false;
    //     for (const phrase of cmdFunction) {
    //         if (firstTenWords.includes(phrase.toLowerCase())) {
    //             hasFunction = true;
    //             break;
    //         }
    //     }

    //     // Se não contém função, retorna false
    //     return hasFunction;
    // }
}
