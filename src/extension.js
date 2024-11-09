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

// Extension
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

// App
import {Logger} from './utils/logger.js';
import {Audio} from './audio.js';
import {Interpreter} from './interpreter.js';
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
            // fetch settings
            this._fetchSettings();
            // update settings if changed
            this._settingsChangedId = this.extension.settings.connect(
                'changed',
                () => {
                    this._fetchSettings();
                },
            );
        }

        /**
         * @description fetch settings
         */
        _fetchSettings() {
            // extension settings
            const {settings} = this.extension;
            // extension directory
            const EXT_DIR = GLib.build_filenamev([
                GLib.get_home_dir(),
                '.local',
                'share',
                'gnome-shell',
                'extensions',
                this.uuid,
            ]);
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
        }

        /**
         * @description public instances
         */
        _createInstances() {
            this.logger = new Logger(DEBUG);
            this.gemini = new GoogleGemini(this);
            this.azure = new MicrosoftAzure(this);
            this.audio = new Audio(this);
            this.utils = new Utils(this);
            this.ui = new UI(this);
            this.chat = new Chat(this);
            this.interpreter = new Interpreter(this);
        }

        /**
         * @description init extension
         * @param {*} extension - this.extension
         */
        _init(extension) {
            // initialize
            super._init(0.0, 'aiva');
            this.extension = extension;

            // load settings
            this._loadSettings();
            this.log('Settings loaded.');

            // set language
            GLib.setenv(
                'LANGUAGE',
                this.userSettings.AZURE_SPEECH_LANGUAGE,
                true,
            );

            // create instances
            this.log('Creating instances...');
            this._createInstances();

            // open settings if gemini api key is not configured
            this.log('Checking API key...');
            if (this.userSettings.GEMINI_API_KEY === '') {
                this.log('API key not configured.');
                this.openSettings();
            } else {
                this.log('API key configured.');
            }

            // initialize ui
            this.ui.init();

            // initialize chat
            this.chat.init();
        }

        /**
         * @description open settings
         */
        openSettings() {
            this.log('Opening settings...');
            this.extension.openSettings();
        }

        /**
         * @description destroy loop
         */
        destroyLoop() {
            if (this.gemini.afterTune) {
                clearTimeout(this.gemini.afterTune);
                this.gemini.afterTune = null;
            }
        }

        /**
         * @description destroy extension
         */
        destroy() {
            this.destroyLoop();
            super.destroy();
        }

        /**
         * @description log shortcut
         * @param {string} message - string to log
         */
        log(message) {
            this.logger.log(message);
        }

        /**
         * @description log error shortcut
         * @param {string} message - string to log error
         */
        logError(message) {
            this.logger.logError(message);
        }
    },
);

/**
 *
 */
export default class AivaExtension extends Extension {
    /**
     * @description enable extension
     */
    enable() {
        // aiva instance
        this._aiva = new Aiva({
            clipboard: St.Clipboard.get_default(),
            settings: this.getSettings(),
            openSettings: this.openPreferences,
            uuid: this.uuid,
            userSettings: this.userSettings,
            log: (message) => {
                console.log('[AIVA] ' + message);
            },
        });
        this._aiva.log('Starting AIVA...');

        // add to status bar
        Main.panel.addToStatusArea('gvaGnomeExtension', this._aiva, 1);

        // get and save location
        this._aiva.log('Getting IP and location...');
        let url = 'https://api.myip.com';
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
                const res = JSON.parse(response);
                const ip = res.ip;
                const country = res.country;
                this._aiva.log('IP: ' + ip);
                this._aiva.log('Country: ' + country);
                this._aiva.userSettings.LOCATION = country;
            },
        );

        this._aiva.log('AIVA started.');
    }

    /**
     * @description disable extension
     */
    disable() {
        this._aiva.log('Stopping AIVA...');
        this._aiva.destroy();
        this._aiva = null;
        this._aiva.log('AIVA stopped.');
    }
}
