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

    readClipboardText() {
        this.app.extension.clipboard.get_text(
            St.ClipboardType.CLIPBOARD,
            (clipboard, result) => {
                if (result) {
                    let clipboardText = result;
                    this.app.azure.tts(
                        _('Start reading...') +
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

    openApp(command, args) {
        try {
            const apps = {
                calculator: 'gnome-calculator',
                terminal: 'gnome-terminal',
                files: 'nautilus',
                settings: 'gnome-control-center',
                firefox: 'firefox',
            };
            for (const [key, app] of Object.entries(apps)) {
                if (command.includes(key)) {
                    this.app.chat.editResponse(`${_('Opening')} ${key}...`);
                    const request = app + args;
                    this.app.utils.executeCommand(request);
                    return;
                }
            }

            this.app.chat.editResponse(
                _(
                    `Sorry, I can't open ${command} right now. Maybe in the future.`,
                ),
            );
        } catch (error) {
            this.app.logError('Error opening site:', error);
            this.app.chat.editResponse(_('Error opening site'));
        }
    }

    callback(command, request = undefined, args = undefined) {
        command = command.toLowerCase();
        request = request?.toLowerCase();
        args = args?.toLowerCase();

        switch (command) {
            case 'read_clipboard':
                this.readClipboardText();
                break;
            case 'open_app':
                this.openApp(request, args);
                break;
            default:
                this.app.chat.editResponse(
                    _("Sorry, I can't do that right now. Maybe in the future."),
                );
                break;
        }
    }
}
