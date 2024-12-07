import St from 'gi://St';
import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

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
        this.app.log('Getting weather from ' + location);
        this.lat = this.app.userSettings.LAT;
        this.lon = this.app.userSettings.LON;
        this.loc = this.app.userSettings.CITY;

        if (location !== undefined) {
            try {
                this.loc = location;
                let coordURL = `https://geocode.maps.co/search?q=${location}&api_key=6753c06c9c8c8475490416eox643a09`;
                let _httpSessionCoord = new Soup.Session();
                let messageCoord = Soup.Message.new('GET', coordURL);

                _httpSessionCoord.send_and_read_async(
                    messageCoord,
                    GLib.PRIORITY_DEFAULT,
                    null,
                    (_httpSessionCoord, result) => {
                        let bytes =
                            _httpSessionCoord.send_and_read_finish(result);
                        let decoder = new TextDecoder('utf-8');
                        let response = decoder.decode(bytes.get_data());
                        let res = JSON.parse(response);
                        this.lat = res[0]?.lat;
                        this.lon = res[0]?.lon;
                    },
                );
            } catch (error) {
                this.app.log(`Failed to process response: ${error}`);
            }
        }

        try {
            // curl
            let url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,cloud_cover`;
            let _httpSession = new Soup.Session();
            let message = Soup.Message.new('GET', url);

            _httpSession.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (_httpSession, result) => {
                    let bytes = _httpSession.send_and_read_finish(result);
                    let decoder = new TextDecoder('utf-8');
                    let response = decoder.decode(bytes.get_data());
                    let res = JSON.parse(response);

                    function isDayString() {
                        switch (res.current.is_day) {
                            case 0:
                                return _('night');
                            case 1:
                                return _('day');
                            default:
                                return _('unknown');
                        }
                    }

                    function sensationString() {
                        if (res.current.apparent_temperature < 10) {
                            return _('cold');
                        }
                        if (
                            res.current.apparent_temperature >= 10 &&
                            res.current.apparent_temperature < 25
                        ) {
                            return _('mild');
                        }
                        if (
                            res.current.apparent_temperature >= 25 &&
                            res.current.apparent_temperature < 35
                        ) {
                            return _('warm');
                        }
                        if (res.current.apparent_temperature >= 35) {
                            return _('hot');
                        }
                        return _('unknown temperature');
                    }

                    function climeStatus() {
                        let clime = '';
                        if (res.current.precipitation > 0) {
                            clime = _(' and raining');
                        }
                        if (res.current.snowfall > 0) {
                            clime = _(' and snowing');
                        }
                        if (res.current.is_day === 1) {
                            clime = _(' and sunny');
                        }
                        return clime;
                    }

                    let weatherDescription = `${_('Now it is')} ${isDayString()}${climeStatus()} ${_('in')} ${this.loc} ${_('and the weather is')} ${sensationString()}, ${_('the temperature is now')} ${res.current.temperature_2m}${res.current_units.temperature_2m}, ${_('but it feels like')} ${res.current.apparent_temperature}${res.current_units.apparent_temperature}. ${_('The humidity of the air is')} ${res.current.relative_humidity_2m}%.`;
                    this.app.chat.editResponse(weatherDescription);
                },
            );
        } catch (error) {
            this.app.logError('Error getting weather:', error);
            this.app.chat.editResponse(_('Error getting weather'));
        }
    }
}
