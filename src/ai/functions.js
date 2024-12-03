import St from 'gi://St';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description functions
 * @param {object} app
 */
export class Functions {
    constructor(app) {
        this.app = app;
        console.log('Functions loaded.');
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
