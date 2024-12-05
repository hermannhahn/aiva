import St from 'gi://St';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description gemini functions
 * @param {object} app
 */
export class GeminiFunctions {
    constructor(app) {
        this.app = app;

        this.readClipboardActivation = [
            _('read'),
            _('read_lang_var1'),
            _('read_lang_var2'),
        ];

        this._readClipboardDeclaration = {
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

        this.cmdActivation = [
            _('open'),
            _('open_lang_var1'),
            _('open_lang_var2'),
            _('run'),
            _('run_lang_var1'),
            _('run_lang_var2'),
            _('execute'),
            _('execute_lang_var1'),
            _('execute_lang_var2'),
            _('start'),
            _('start_lang_var1'),
            _('start_lang_var2'),
            _('launch'),
            _('launch_lang_var1'),
            _('launch_lang_var2'),
        ];

        this._cmdDeclaration = {
            name: 'command_line',
            description:
                _('Run non-sudo command line in terminal') +
                '. [OS: Ubuntu 24.04.1 LTS]',
            parameters: {
                type: 'object',
                properties: {
                    commandLine: {
                        type: 'string',
                        description:
                            _('Command line to run, e.g.: ') +
                            'firefox https://google.com',
                    },
                    response: {
                        type: 'string',
                        description:
                            _('Response text before run, e.g.: ') +
                            _('Sure, opening google...'),
                    },
                },
                required: ['commandLine', 'response'],
            },
        };

        this.browseWebActivation = [
            _('open'),
            _('open_lang_var1'),
            _('open_lang_var2'),
            _('search'),
            _('search_lang_var1'),
            _('search_lang_var2'),
            _('find'),
            _('find_lang_var1'),
            _('find_lang_var2'),
        ];

        this._browseWebDeclaration = {
            name: 'browse_web',
            description:
                _('To use when you want to browse the web') +
                ' [OS: Ubuntu 24.04.1 LTS]',
            parameters: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description:
                            _('URL to browse, e.g.: ') + 'https://google.com',
                    },
                    response: {
                        type: 'string',
                        description:
                            _('Response text before run, e.g.: ') +
                            _('Sure, opening...'),
                    },
                },
                required: ['url'],
            },
        };

        this.activationWords = [
            ...this.readClipboardActivation,
            ...this.cmdActivation,
            ...this.browseWebActivation,
        ];

        console.log('Functions loaded.');
    }

    callback(command, args) {
        command = command?.toLowerCase();
        const commandLine = args.commandLine;
        const response = args.response;
        const url = args.url;

        switch (command) {
            case 'read_clipboard':
                this._readClipboardText(response);
                break;
            case 'command_line':
                this._commandLine(commandLine, response);
                break;
            case 'browse_web':
                this._browseWeb(url, response);
                break;
            default:
                this.app.chat.editResponse(
                    _("Sorry, I can't do that right now. Maybe in the future."),
                );
                break;
        }
    }

    declarations(words) {
        let functionDeclarations = [];
        for (const word of words) {
            if (this.readClipboardActivation.includes(word)) {
                functionDeclarations.push(this._readClipboardDeclaration);
            }
            if (this.browseWebActivation.includes(word)) {
                functionDeclarations.push(this._browseWebDeclaration);
            }
            if (this.cmdActivation.includes(word)) {
                functionDeclarations.push(this._cmdDeclaration);
            }
        }
        return [
            {
                functionDeclarations,
            },
        ];
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

    _commandLine(commandLine, response) {
        try {
            if (commandLine) {
                const command = commandLine.split(' ')[0];

                // check if app is installed
                const isInstalled = this.app.utils.isAppInstalled(command);
                if (!isInstalled) {
                    this.app.chat.editResponse(
                        _('Please, install') +
                            ' ' +
                            command +
                            ' ' +
                            _('first') +
                            '.',
                    );
                    return;
                }

                if (response) {
                    this.app.chat.editResponse(response);
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

    _browseWeb(url, response) {
        try {
            const msedgeIsInstalled = this.app.utils.isAppInstalled('msedge');
            if (msedgeIsInstalled) {
                if (response) {
                    this.app.chat.editResponse(response);
                }
                this.app.utils.executeCommand(`msedge ${url}`);
                return;
            }

            const chromeIsInstalled =
                this.app.utils.isAppInstalled('google-chrome');
            if (chromeIsInstalled) {
                if (response) {
                    this.app.chat.editResponse(response);
                }
                this.app.utils.executeCommand(`google-chrome ${url}`);
                return;
            }

            const operaIsInstalled = this.app.utils.isAppInstalled('opera');
            if (operaIsInstalled) {
                if (response) {
                    this.app.chat.editResponse(response);
                }
                this.app.utils.executeCommand(`opera ${url}`);
                return;
            }

            const firefoxIsInstalled = this.app.utils.isAppInstalled('firefox');
            if (firefoxIsInstalled) {
                if (response) {
                    this.app.chat.editResponse(response);
                }
                this.app.utils.executeCommand(`firefox ${url}`);
                return;
            }

            this.app.chat.editResponse(
                _("You don't have any browser installed.") +
                    ' ' +
                    _('Please, install a browser and try again.') +
                    ' ' +
                    _('Opening App Store...'),
            );
            this.app.utils.executeCommand('gnome-software');
        } catch (error) {
            this.app.logError('Error opening site:', error);
            this.app.chat.editResponse(_('Error opening site'));
        }
    }
}
