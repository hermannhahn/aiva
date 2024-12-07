import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description gemini functions
 * @param {object} app
 */
export class FunctionsActivations {
    constructor(app) {
        this.app = app;

        this.tools = ['aiva', this.app.userSettings.ASSIST_NAME];

        this.readClipboard = [
            _('read'),
            _('read_lang_var1'),
            _('read_lang_var2'),
        ];

        this.cmd = [
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

        this.browseWeb = [
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

        this.weather = [
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

        this.words = [
            ...this.toolsActivation,
            ...this.weatherActivation,
            ...this.readClipboardActivation,
            ...this.browseWebActivation,
            ...this.cmdActivation,
        ];

        console.log('Functions loaded.');
    }
}
