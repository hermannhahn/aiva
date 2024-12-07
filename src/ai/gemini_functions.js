import St from 'gi://St';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description gemini functions
 * @param {object} app
 */
export class GeminiFunctions {
    constructor(app) {
        this.app = app;

        this.toolsActivation = ['aiva', this.app.userSettings.ASSIST_NAME];

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
            _('seek'),
            _('seek_lang_var1'),
            _('seek_lang_var2'),
            _('go'),
            _('go_lang_var1'),
            _('go_lang_var2'),
            _('visit'),
            _('visit_lang_var1'),
            _('visit_lang_var2'),
            _('navigate'),
            _('navigate_lang_var1'),
            _('navigate_lang_var2'),
            _('browse'),
            _('browse_lang_var1'),
            _('browse_lang_var2'),
            _('access'),
            _('access_lang_var1'),
            _('access_lang_var2'),
        ];

        this._browseWebDeclaration = {
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

        this.weatherActivation = [
            _('weather'),
            _('weather_lang_var1'),
            _('forecast'),
            _('temperature'),
            _('humidity'),
            _('humidity_lang_var1'),
            _('wind'),
            _('wind_lang_var1'),
            _('wind_lang_var2'),
            _('precipitation'),
            _('precipitation_lang_var1'),
            _('precipitation_lang_var2'),
            _('cloud'),
            _('cloud_lang_var1'),
            _('climate'),
            _('rain'),
            _('rain_lang_var1'),
            _('rain_lang_var2'),
            _('snow'),
            _('snow_lang_var1'),
            _('snow_lang_var2'),
            _('frost'),
            _('frost_lang_var1'),
            _('frost_lang_var2'),
            _('fog'),
            _('fog_lang_var1'),
            _('fog_lang_var2'),
            _('sun'),
            _('sun_lang_var1'),
            _('sun_lang_var2'),
            _('clouds'),
            _('clouds_lang_var1'),
            _('clouds_lang_var2'),
            _('sky'),
            _('windy'),
            _('windy_lang_var1'),
            _('humid'),
            _('humid_lang_var1'),
            _('humid_lang_var2'),
            _('dry'),
            _('dry_lang_var1'),
            _('dry_lang_var2'),
            _('cold'),
            _('cold_lang_var1'),
            _('cold_lang_var2'),
            _('hot'),
            _('hot_lang_var1'),
            _('hot_lang_var2'),
            _('warm'),
            _('warm_lang_var1'),
            _('mild'),
            _('mild_lang_var1'),
            _('mild_lang_var2'),
            _('freezing'),
            _('freezing_lang_var1'),
            _('blizzard'),
        ];

        this._weatherDeclaration = {
            name: 'get_weather',
            description: _('show the weather for today.'),
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
                                "or don't provide a location to get weather from user location",
                            ),
                    },
                },
            },
        };

        this.activationWords = [
            ...this.toolsActivation,
            ...this.weatherActivation,
            ...this.readClipboardActivation,
            ...this.browseWebActivation,
            ...this.cmdActivation,
        ];

        console.log('Functions loaded.');
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

    declarations(text) {
        let functionDeclarations = [];
        text = text.replace(/[.,!?;:"]/g, '');
        const words = text.toLowerCase().split(' ');

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
            if (this.weatherActivation.includes(word)) {
                functionDeclarations.push(this._weatherDeclaration);
            }
        }
        return [{functionDeclarations}];
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
