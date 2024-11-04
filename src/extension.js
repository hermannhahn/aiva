const DEBUG = true;

/**
 *
 * AIVA - Artificial Intelligence Voice Assistant
 *
 * Author: Hermann Hahn
 * Contact: hermann.h.hahn@gmail.com
 * Repository: https://github.com/hermannhahn/aiva
 *
 */

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

// App
import {Audio} from './audio.js';
import {Brain} from './brain.js';
import {Chat} from './chat.js';
import {UI} from './ui.js';
import {Utils} from './utils/utils.js';

// API
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
            // extension directory
            const EXT_DIR = GLib.build_filenamev([
                GLib.get_home_dir(),
                '.local',
                'share',
                'gnome-shell',
                'extensions',
                'aiva@gemini-assist.vercel.app',
            ]);
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
                GEMINI_API_KEY: settings.get_string('gemini-api-key'),
                HISTORY_FILE: GLib.build_filenamev([EXT_DIR, 'history.json']),
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
            console.log('[AIVA] Creating instances...');

            /**
             * logger
             */
            const logger = new Logger(DEBUG);
            this.log = logger.log;
            this.logError = logger.logError;

            /**
             * response
             */
            this.gemini = new GoogleGemini(this);

            /**
             * tts | stt
             */
            this.azure = new MicrosoftAzure(this);

            /**
             * play | stop | record | stopRecord
             */
            this.audio = new Audio(this);

            /**
             * log | logError | inputformat | textformat | insertLineBreaks
             */
            this.utils = new Utils(this);

            /**
             * tray | icon | chatSection | scrollView | copyButton
             */
            this.ui = new UI(this);

            /**
             * add | copy
             */
            this.chat = new Chat(this);

            /**
             *
             */
            this.brain = new Brain(this);

            this.log('All instances loaded.');
        }

        /**
         * @param {*} extension
         *
         * @description init extension
         */
        _init(extension) {
            console.log('[AIVA] Initializing extension...');

            // initialize extension
            super._init(0.0, _('AIVA'));

            /**
             * @description extension props
             */
            this.extension = extension;

            // create instances
            this._createInstances();

            // load settings
            this._loadSettings();

            // open settings if gemini api key is not configured
            if (this.userSettings.GEMINI_API_KEY === '') {
                this.openSettings();
            }

            // initialize ui
            this.ui.init();

            // initialize chat
            this.chat.init();

            console.log('[AIVA] Extension initialized.');
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
        // Get IP
        let url = 'https://api.myip.com';
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
        Main.panel.addToStatusArea('gvaGnomeExtension', this._aiva, 1);
        this._aiva.log('[AIVA] Getting IP...');
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
                const country = res.country;
                this._aiva.log('[AIVA] IP: ' + ip);
                this._aiva.log('[AIVA] Country: ' + country);
                this._aiva.userSettings.LOCATION = res.country;
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
