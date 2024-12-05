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
        this.openAppActivation = [
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
        this.searchWebActivation = [
            _('search'),
            _('search_lang_var1'),
            _('search_lang_var2'),
            _('find'),
            _('find_lang_var1'),
            _('find_lang_var2'),
        ];
        this.activationWords = [
            ...this.readClipboardActivation,
            ...this.openAppActivation,
            ...this.searchWebActivation,
        ];
        console.log('Functions loaded.');
    }

    callback(command, args) {
        command = command?.toLowerCase();
        const commandLine = args.commandLine;
        const response = args.response;

        switch (command) {
            case 'read_clipboard':
                this._readClipboardText(response);
                break;
            case 'open_app':
                this._openApp(commandLine, response);
                break;
            default:
                this.app.chat.editResponse(
                    _("Sorry, I can't do that right now. Maybe in the future."),
                );
                break;
        }
    }

    declarations(words) {
        let declarations = [];
        for (const word of words) {
            if(this.readClipboardActivation.includes(word)) {
                declarations.push(this._readClipboardDeclaration)
        }

        let result = {
            functionDeclarations: [
                {
                    name: 'open_app',
                    description:
                        _('To use when you want to open an application') +
                        ' [OS: Ubuntu 24.04.1 LTS]',
                    parameters: {
                        type: 'object',
                        properties: {
                            commandLine: {
                                type: 'string',
                                description:
                                    _('Non-sudo command line to run, e.g.: ') +
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
                },
            ],
        };
        return result;
    }

    _readClipboardDeclaration = 
        {
            name: 'read_clipboard',
            description: _(
                'To use when you want to read the clipboard',
            ),
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

    _openApp(commandLine, response) {
        try {
            if (commandLine) {
                // get first word from commandLine
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
}
