import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description gemini functions
 * @param {object} app
 */
export class FunctionsActivations {
    constructor(app) {
        this.app = app;

        this.assitname = ['aiva', this.app.userSettings.ASSIST_NAME];

        this.read = [_('read'), _('read_var1'), _('read_var2')];

        this.clipboard = [
            _('clipboard text'),
            _('clipboard_text_var1'),
            _('clipboard_text_var2'),
            _('text I copied'),
            _('what did I copy'),
            _('copied text'),
            _('my clipboard'),
            _("what's copied"),
            _('clipboard content'),
            _('just copied'),
            _('what I copied'),
            _('copied content'),
            _('clipboard data'),
            _('the clipboard'),
        ];

        this.open = [
            _('open'),
            _('launch'),
            _('start'),
            _('run'),
            _('load'),
            _('initialize'),
        ];

        this.browse = [
            _('open'),
            _('go to'),
            _('navigate'),
            _('visit'),
            _('check out'),
            _('pull up'),
            _('bring'),
            _('take me'),
            _('show me'),
            _('launch'),
            _('load'),
            _('find'),
            _('browse'),
            _('search'),
        ];

        this.site = [
            _('website'),
            _('site'),
            _('page'),
            _('webpage'),
            _('link'),
            _('url'),
            _('address'),
            _('blog'),
        ];

        this.preweather = [
            _('how is the'),
            _('what is the'),
            _("what's the"),
            _('how hot is it'),
            _('how cold is it'),
            _('is there'),
            _('will it'),
            _('do I need'),
            _('how warm is it'),
            _("how's the"),
            _('should I'),
            _('is the'),
            _('what time will it'),
            _('is it'),
            _('how long will it'),
            _('are there any'),
            _('will there be a'),
        ];

        this.weather = [
            _('weather'),
            _('temperature'),
            _('raining'),
            _('snowing'),
            _('windy'),
            _('forecast'),
            _('cloudy'),
            _('storm'),
            _('humidity'),
            _('rain'),
            _('snow'),
            _('umbrella'),
            _('jacket'),
            _('warm'),
            _('foggy'),
            _('freezing'),
            _('high for today'),
            _('low for today'),
            _('a coat'),
            _('wind'),
            _('stormy'),
            _('drizzling'),
            _('thunder'),
            _('lightning'),
            _('mild'),
            _('air pressure'),
            _('heatwave'),
            _('chilly'),
            _('overcast'),
            _('clear'),
            _('hot'),
            _('outside'),
            _('hurricane'),
            _('uv index'),
            _('sunny'),
            _('hail'),
            _('frost'),
            _('cold'),
            _('dew point'),
            _('visibility'),
        ];

        console.log('Functions loaded.');
    }
}
