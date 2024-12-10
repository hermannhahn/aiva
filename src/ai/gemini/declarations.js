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
            description: _(
                'Execute Text-to-Speech in the user terminal to read user clipboard text.',
            ),
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
            description: _('Open url in the user browser.'),
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
        // Remove pontuações e converte para minúsculas.
        const normalizedText = text.replace(/[.,!?]/g, '').toLowerCase();

        // Divide o texto em palavras.
        const textWords = normalizedText.split(/\s+/);

        // Verifica se todas as palavras de uma frase estão no texto (independente da ordem).
        function containsAllWords(phraseWords, textWords) {
            return phraseWords.every((word) =>
                textWords.includes(word.toLowerCase()),
            );
        }

        // Verifica se ao menos uma das frases de uma lista está presente no texto.
        function anyPhraseMatches(phrases, textWords) {
            return phrases.some((phrase) => {
                const phraseWords = phrase.toLowerCase().split(/\s+/);
                return containsAllWords(phraseWords, textWords);
            });
        }

        // Verifica as listas de ativação e função.
        const hasActivation = anyPhraseMatches(cmdActivation, textWords);
        const hasFunction = anyPhraseMatches(cmdFunction, textWords);

        console.log(
            `Has Activation: ${hasActivation}, Has Function: ${hasFunction}`,
        );

        return hasActivation && hasFunction;
    }
}
