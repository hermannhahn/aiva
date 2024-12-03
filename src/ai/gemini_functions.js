import St from 'gi://St';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description gemini functions
 * @param {object} app
 */
export class GeminiFunctions {
    constructor(app) {
        this.app = app;
        console.log('Functions loaded.');
    }

    callback(command, args) {
        command = command?.toLowerCase();
        const commandLine = args.commandLine?.toLowerCase();
        const response = args.response?.toLowerCase();
        const installInstructions = args.installInstructions?.toLowerCase();

        switch (command) {
            case 'read_clipboard':
                this.readClipboardText(response);
                break;
            case 'open_app':
                this.openApp(commandLine, response, installInstructions);
                break;
            default:
                this.app.chat.editResponse(
                    _("Sorry, I can't do that right now. Maybe in the future."),
                );
                break;
        }
    }

    declarations() {
        return [
            {
                functionDeclarations: [
                    {
                        name: 'read_clipboard',
                        description: 'read text from clipboard',
                        parameters: {
                            type: 'object',
                            properties: {
                                response: {
                                    type: 'string',
                                    description:
                                        'Response text before run, e.g. "Sure, start reading...". PS: Always in same language of user question.',
                                },
                            },
                            required: ['response'],
                        },
                    },
                    {
                        name: 'open_app',
                        description:
                            'To run apps, flatpak, snap, etc... [OS: Ubuntu 24.04.1 LTS]',
                        parameters: {
                            type: 'object',
                            properties: {
                                commandLine: {
                                    type: 'string',
                                    description:
                                        'Non-sudo command line to run, e.g. "firefox https://google.com --new-window"',
                                },
                                response: {
                                    type: 'string',
                                    description:
                                        'Response text before run, e.g. "Sure, opening google...". PS: Always in same language of user question.',
                                },
                                installInstructions: {
                                    type: 'string',
                                    description:
                                        'The app and dependencies install instructions to run command line if needed. PS: Always in same language of user question.',
                                },
                            },
                            required: ['commandLine', 'response'],
                        },
                    },
                ],
            },
        ];
    }

    readClipboardText(response) {
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

    openApp(commandLine, response, installInstructions) {
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
