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

import {Utils} from './utils/utils.js';
import {AppLayout} from './ui.js';
import {MicrosoftAzure} from './ai/azure.js';
import {Audio} from './utils/audio.js';
import {Brain} from './brain.js';
import {Chat} from './chat.js';

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
                    GLib.get_home_dir(),
                    '.local',
                    'share',
                    'gnome-shell',
                    'extensions',
                    'aiva@gemini-assist.vercel.app',
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
            /**
             * log | logError | inputformat | textformat | insertLineBreaks
             */
            this.utils = new Utils(this);

            /**
             * tray | icon | chatSection | scrollView | copyButton
             */
            this.ui = new AppLayout(this);

            /**
             * tts | transcribe
             */
            this.azure = new MicrosoftAzure(this);

            /**
             * play | stop | record | stopRecord
             */
            this.audio = new Audio(this);

            /**
             * processes questions and makes decisions
             */
            this.brain = new Brain(this);

            /**
             * add | copy
             */
            this.chat = new Chat(this);
        }

        /**
         * @param {*} extension
         *
         * @description init extension
         */
        _init(extension) {
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

            // log shortcuts
            this.log = this.utils.log;
            this.logError = this.utils.logError;

            // Initialize UI
            this.ui.init();

            // Open settings if gemini api key is not configured
            if (this.userSettings.GEMINI_API_KEY === '') {
                this.openSettings();
            }

            // Init chat
            this.chat.init();
        }

        /**
         * open settings
         */
        openSettings() {
            this.extension.openSettings();
        }

        /**
         * destroy loop
         */
        destroyLoop() {
            if (this.afterTune) {
                clearTimeout(this.afterTune);
                this.afterTune = null;
            }
        }

        /**
         * destroy extension
         */
        destroy() {
            this.destroyLoop();
            super.destroy();
        }
    },
);

export default class AivaExtension extends Extension {
    /**
     * Enable extension
     */
    enable() {
        let url = 'https://api.ipify.org?format=json'; // e.g. response: {"ip":"177.97.182.155"}
        // Get IP from url response
        let _httpSession = new Soup.Session();
        let message = Soup.Message.new('GET', url);
        this._aiva = new Aiva({
            clipboard: St.Clipboard.get_default(),
            settings: this.getSettings(),
            openSettings: this.openPreferences,
            uuid: this.uuid,
            log: (message) => {
                this.log(message);
            },
        });
        Main.panel.addToStatusArea('gvaGnomeExtension', this._aiva, 1);
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
                // Get location from https://ipapi.co/{ip}/json/
                url = `https://ipapi.co/${ip}/json/`;
                message = Soup.Message.new('GET', url);
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
                        this._aiva.log(this._aiva.userSettings.LOCATION);
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
