import St from 'gi://St';
import GObject from 'gi://GObject';
import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

import {
    Extension,
    gettext as _,
} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import {Logger} from './utils/logger.js';
const logger = new Logger();
const log = logger.log;
const logError = logger.logError;

import {Audio} from './audio.js';
import {Brain} from './brain.js';
import {Chat} from './chat.js';
import {UI} from './ui.js';
import {Utils} from './utils/utils.js';

import {GoogleGemini} from './ai/gemini.js';
import {MicrosoftAzure} from './ai/azure.js';

const Aiva = GObject.registerClass(
    class Aiva extends PanelMenu.Button {
        /**
         * @description load and update settings
         */
        _loadSettings() {
            this.log('Loading settings...');
            // fetch settings
            this._fetchSettings();
            // update settings if changed
            this._settingsChangedId = this.extension.settings.connect(
                'changed',
                () => {
                    this._fetchSettings();
                },
            );
            this.log('Settings loaded.');
        }

        /**
         * @description fetch settings
         */
        _fetchSettings() {
            this.log('Fetching settings...');
            // extension settings
            const {settings} = this.extension;
            this.log('Extension settings loaded.');
            // user settings
            this.userSettings = {
                ASSIST_NAME: settings.get_string('assist-name'),
                AZURE_SPEECH_KEY: settings.get_string('azure-speech-key'),
                AZURE_SPEECH_REGION: settings.get_string('azure-speech-region'),
                AZURE_SPEECH_LANGUAGE: settings.get_string(
                    'azure-speech-language',
                ),
                AZURE_SPEECH_VOICE: settings.get_string('azure-speech-voice'),
                EXT_DIR: GLib.build_filenamev([
                    GLib.get_home_dir(),
                    '.local',
                    'share',
                    'gnome-shell',
                    'extensions',
                    'aiva@gemini-assist.vercel.app',
                ]),
                GEMINI_API_KEY: settings.get_string('gemini-api-key'),
                HISTORY_FILE: GLib.build_filenamev([
                    this.userSettings.EXT_DIR,
                    'history.json',
                ]),
                LOCATION: 'Unknown',
                RECURSIVE_TALK: settings.get_boolean('log-history'),
                USERNAME: GLib.get_real_name(),
            };
            this.afterTune = null;
            this.log('User settings loaded.');
            this.log('All Settings fetched.');
        }

        /**
         * @description create instances
         */
        _createInstances() {
            this.log('Creating instances...');

            /**
             * response
             */
            this.gemini = new GoogleGemini(this);
            this.log('Gemini instance created.');

            /**
             * tts | stt
             */
            this.azure = new MicrosoftAzure(this);
            this.log('Azure instance created.');

            /**
             * play | stop | record | stopRecord
             */
            this.audio = new Audio(this);
            this.log('Audio instance created.');

            /**
             * log | logError | inputformat | textformat | insertLineBreaks
             */
            this.utils = new Utils(this);
            this.log('Utils instance created.');

            /**
             * tray | icon | chatSection | scrollView | copyButton
             */
            this.ui = new UI(this);
            this.log('UI instance created.');

            /**
             * add | copy
             */
            this.chat = new Chat(this);
            this.log('Chat instance created.');

            /**
             *
             */
            this.brain = new Brain(this);
            this.log('Brain instance created.');

            this.log('All instances created.');
        }

        /**
         * @param {*} extension
         *
         * @description init extension
         */
        _init(extension) {
            // load logger
            this.log = log;
            this.logError = logError;

            // initialize extension
            super._init(0.0, _('AIVA'));

            /**
             * @description extension props
             */
            this.extension = extension;

            // load settings
            this._loadSettings();

            // create instances
            this._createInstances();

            // open settings if gemini api key is not configured
            if (this.userSettings.GEMINI_API_KEY === '') {
                this.openSettings();
            }

            // initialize ui
            this.ui.init();

            // initialize chat
            this.chat.init();
        }

        /**
         * open settings
         */
        openSettings() {
            this.log('Opening settings...');
            this.extension.openSettings();
        }

        /**
         * destroy loop
         */
        destroyLoop() {
            if (this.afterTune) {
                this.log('Destroying loop...');
                clearTimeout(this.afterTune);
                this.afterTune = null;
            }
        }

        /**
         * destroy extension
         */
        destroy() {
            this.log('Destroying extension...');
            this.destroyLoop();
            super.destroy();
            this.log('Extension destroyed.');
        }
    },
);

export default class AivaExtension extends Extension {
    /**
     * Enable extension
     */
    enable() {
        // Get IP from https://api.ipify.org?format=json
        let url = 'https://api.ipify.org?format=json';
        let _httpSession = new Soup.Session();
        let message = Soup.Message.new('GET', url);
        this._aiva = new Aiva({
            clipboard: St.Clipboard.get_default(),
            settings: this.getSettings(),
            openSettings: this.openPreferences,
            uuid: this.uuid,
            log: (message) => {
                console.log('[AIVA] ' + message);
            },
        });
        console.log(['[AIVA] Initializing extension...']);
        Main.panel.addToStatusArea('gvaGnomeExtension', this._aiva, 1);
        console.log(['[AIVA] Getting IP...']);
        _httpSession.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (_httpSession, result) => {
                let bytes = _httpSession.send_and_read_finish(result);
                let decoder = new TextDecoder('utf-8');
                let response = decoder.decode(bytes.get_data());
                const res = JSON.parse(response);
                const ip = res.ip;
                console.log(['[AIVA] IP: ' + ip]);
                // Get location from https://ipapi.co/{ip}/json/
                url = `https://ipapi.co/${ip}/json/`;
                message = Soup.Message.new('GET', url);
                console.log(['[AIVA] Getting location...']);
                _httpSession.send_and_read_async(
                    message,
                    GLib.PRIORITY_DEFAULT,
                    null,
                    (_httpSession, result) => {
                        let bytes = _httpSession.send_and_read_finish(result);
                        let decoder = new TextDecoder('utf-8');
                        let response = decoder.decode(bytes.get_data());
                        const res = JSON.parse(response);
                        this._aiva.userSettings.LOCATION = `${res.country_name}/${res.city}`;
                        console.log(
                            '[AIVA] Location: ' +
                                this._aiva.userSettings.LOCATION,
                        );
                    },
                );
            },
        );
    }

    /**
     * Disable extension
     */
    disable() {
        this._aiva.destroy();
        this._aiva = null;
    }
}
