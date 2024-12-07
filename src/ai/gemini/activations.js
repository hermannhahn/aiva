import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description gemini functions
 * @param {object} app
 */
export class FunctionsActivations {
    constructor(app) {
        this.app = app;

        this.assitname = ['aiva', this.app.userSettings.ASSIST_NAME];

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
            _('open the website'),
            _('open the page'),
            _('open the blog'),
            _('go to the website'),
            _('go to the page'),
            _('go to the blog'),
            _('navigate to the site'),
            _('navigate to the page'),
            _('visit the website'),
            _('visit the page'),
            _('open this link'),
            _('go to this URL'),
            _('open the URL'),
            _('check out this site'),
            _('pull up the website'),
            _('can you open the site'),
            _('could you open the page'),
            _('bring up the website'),
            _('take me to the site'),
            _('take me to the page'),
            _('show me the website'),
            _('show me the page'),
            _('launch the site'),
            _('launch the page'),
            _('visit this link'),
            _('can you navigate to the URL'),
            _('please open this site'),
            _('please visit the page'),
            _('open this blog for me'),
            _('take me to this blog'),
            _('show me the link'),
            _('can you load this page'),
            _('go to this link'),
            _('open a new tab with this site'),
            _('navigate to this link'),
            _('find this website for me'),
            _('bring up the blog'),
            _('open a tab for this page'),
            _('could you visit this link'),
            _('click this link for me'),
            _('take me to this URL'),
            _('browse to the website'),
            _('open this webpage'),
            _('find this page online'),
            _('show me this site'),
        ];

        this.weather = [
            _('how is the weather'),
            _('what is the temperature'),
            _("what's the weather like"),
            _('is it raining'),
            _('is it sunny'),
            _('is it snowing'),
            _('is it windy'),
            _("what's the forecast"),
            _("what's the weather forecast"),
            _('how hot is it outside'),
            _('how cold is it outside'),
            _('is it cloudy'),
            _('is there a storm coming'),
            _("what's the humidity level"),
            _('is it going to rain today'),
            _('will it snow tomorrow'),
            _("what's the weather like this week"),
            _('do I need an umbrella'),
            _('do I need a jacket'),
            _('how warm is it outside'),
            _('is there a chance of rain'),
            _('is it foggy'),
            _('is it freezing'),
            _("what's the high for today"),
            _("what's the low for today"),
            _("how's the weather right now"),
            _('should I bring a coat'),
            _("what's the wind speed"),
            _('is it stormy'),
            _('is it drizzling'),
            _('is there thunder'),
            _('is it lightning'),
            _('is it mild outside'),
            _("what's the air pressure"),
            _('is there a heatwave'),
            _('is it chilly'),
            _('is it overcast'),
            _('is the weather clear'),
            _('will it be hot this weekend'),
            _('is it safe to go outside'),
            _('is there a hurricane warning'),
            _("what's the UV index today"),
            _('what time will it rain'),
            _('is it good weather for a walk'),
            _('is it safe to drive in this weather'),
            _('will it be sunny later'),
            _('how long will it rain'),
            _('are there any weather alerts'),
            _('will it clear up later'),
            _('should I expect hail'),
            _('will there be a frost tonight'),
            _('is there a cold front coming'),
            _("what's the dew point"),
            _("how's the visibility today"),
        ];

        this.words = [
            ...this.assitname,
            ...this.weather,
            ...this.readClipboard,
            ...this.browseWeb,
            ...this.cmd,
        ];

        console.log('Functions loaded.');
    }
}
