import St from 'gi://St';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description gemini functions
 * @param {object} app
 */
export class GeminiFunctions {
    constructor(app) {
        this.app = app;
        this.activationWords = [
            this.app.userSettings.ASSIST_NAME,
            _('computer'),
            _('notebook'),
            _('desktop'),
            _('laptop'),
            _('pc'),
        ];
        this.activationSuffix = [
            _('open'),
            _('close'),
            _('search'),
            _('play'),
            _('start'),
            _('stop'),
            _('pause'),
            _('resume'),
            _('restart'),
            _('reboot'),
            _('shutdown'),
            _('lock'),
            _('unlock'),
            _('suspend'),
            _('hibernate'),
            _('sleep'),
            _('warn'),
            _('remind'),
            _('remember'),
            _('watch'),
            _('track'),
            _('localize'),
            _('find'),
            _('locate'),
            _('create'),
            _('make'),
            _('register'),
            _('modify'),
            _('get'),
            _('send'),
            _('receive'),
            _('download'),
            _('upload'),
            _('generate'),
            _('paint'),
            _('run'),
            _('execute'),
            _('launch'),
            _('browse'),
            _('navigate'),
            _('take me'),
            _('show'),
            _('read'),
            _('write'),
            _('copy'),
            _('move'),
            _('delete'),
            _('del'),
            _('clean'),
            _('clear'),
            _('turn on'),
            _('turn off'),
            _('please'),
            _('can you'),
            _('would you'),
            _('could you'),
            _('paste'),
            _('speak'),
            _('play'),
            _('speech'),
            _('install'),
            _('uninstall'),
            _('add'),
            _('remove'),
            _('update'),
            _('edit'),
            _('change'),
            _('configure'),
            _('print'),
            _('check'),
            _('access'),
        ];

        console.log('Functions loaded.');
    }

    /**
     * @description check if in the first five words includes one of the activationWords list and one of the activationSuffix
     * @param {string} text
     * @returns {boolean} true/false
     */
    isFunctionCall(text) {
        let firstFiveWords = text.split(' ');
        if (firstFiveWords.length < 3) {
            return false;
        }
        firstFiveWords = firstFiveWords.toLowerCase();
        const hasActivationWord = firstFiveWords.some((word) =>
            this.activationWords.includes(word.toLowerCase()),
        );
        const hasActivationSuffix = firstFiveWords.some((word) =>
            this.activationSuffix.includes(word.toLowerCase()),
        );
        return hasActivationWord && hasActivationSuffix;
    }

    callback(command, args) {
        command = command?.toLowerCase();
        const commandLine = args.commandLine?.toLowerCase();
        const response = args.response?.toLowerCase();
        const installInstructions = args.installInstructions?.toLowerCase();

        switch (command) {
            case 'read_clipboard':
                this._readClipboardText(response);
                break;
            case 'open_app':
                this._openApp(commandLine, response, installInstructions);
                break;
            default:
                this.app.chat.editResponse(
                    _("Sorry, I can't do that right now. Maybe in the future."),
                );
                break;
        }
    }

    declarations() {
        let result = {
            functionDeclarations: [
                {
                    name: 'open_app',
                    description:
                        _('To run apps, flatpak, snap, etc...') +
                        ' [OS: Ubuntu 24.04.1 LTS]',
                    parameters: {
                        type: 'object',
                        properties: {
                            commandLine: {
                                type: 'string',
                                description:
                                    _('Non-sudo command line to run, e.g.: ') +
                                    'firefox https://google.com --new-window',
                            },
                            response: {
                                type: 'string',
                                description:
                                    _('Response text before run, e.g.: ') +
                                    _('Sure, opening google...'),
                            },
                            installInstructions: {
                                type: 'string',
                                description: _(
                                    'Install instructions for app and dependencies if needed.',
                                ),
                            },
                        },
                        required: ['commandLine', 'response'],
                    },
                },
                {
                    name: 'read_clipboard',
                    description: _('read text from clipboard with tts'),
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
                },
            ],
        };
        return result;
    }

    _readClipboardText(response) {
        this.app.extension.clipboard.get_text(
            St.ClipboardType.CLIPBOARD,
            (clipboard, result) => {
                if (result) {
                    let clipboardText = result;
                    this.app.azure.tts(
                        response +
                            '\n ' +
                            clipboardText +
                            '\n ' +
                            _('End of text!'),
                    );
                } else {
                    this.app.chat.editResponse(
                        _('Failed to get text from clipboard'),
                    );
                }
            },
        );
    }

    _openApp(commandLine, response, installInstructions) {
        try {
            if (response) {
                this.app.chat.editResponse(response);
            }

            if (commandLine) {
                // get first word from commandLine
                const command = commandLine.split(' ')[0];

                // check if app is installed
                const isInstalled = this.app.utils.isAppInstalled(command);
                if (!isInstalled) {
                    if (installInstructions) {
                        this.app.chat.editResponse(installInstructions);
                        return;
                    }
                }

                this.app.utils.executeCommand(commandLine);
                return;
            }

            this.app.chat.editResponse(response);
        } catch (error) {
            this.app.logError('Error opening site:', error);
            this.app.chat.editResponse(_('Error opening site'));
        }
    }
}
