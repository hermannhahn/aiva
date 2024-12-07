import St from 'gi://St';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {FunctionsActivations} from './activations.js';
import {FunctionsDeclarations} from './declarations.js';

/**
 * @description gemini functions
 * @param {object} app
 */
export class GeminiFunctions {
    constructor(app) {
        this.app = app;
        this.activation = new FunctionsActivations(app);
        this.declaration = new FunctionsDeclarations(app);
    }

    callback(command, args) {
        command = command?.toLowerCase();
        const commandLine = args.commandLine;
        const response = args.response;
        let location = args.location;
        if (!location || location === undefined) {
            location = this.app.userSettings.LOCATION;
        }
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
            case 'get_weather':
                this._getWeather(location);
                break;
            default:
                this.app.chat.editResponse(
                    _("Sorry, I can't do that right now. Maybe in the future."),
                );
                break;
        }
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
            // const msedgeIsInstalled = this.app.utils.isAppInstalled('msedge');
            // if (msedgeIsInstalled) {
            //     if (response) {
            //         this.app.chat.editResponse(response);
            //     }
            //     this.app.utils.executeCommand(`msedge ${url}`);
            //     return;
            // }

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

    _getWeather(location) {
        try {
            this.app.log('Getting weather from ' + location);
            this.app.utils.getCurrentLocalWeather(location);
        } catch (error) {
            this.app.logError('Error getting weather:', error);
            this.app.chat.editResponse(_('Error getting weather'));
        }
    }
}
