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
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import Gio from 'gi://Gio';
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
        }

        /**
         * @description create instances
         */
        _createInstances() {
            /**
             * logger
             */
            this.logger = new Logger(DEBUG);

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
            this.interpreter = new Interpreter(this);
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

            // load settings
            this._loadSettings();
            console.log('[AIVA] Settings loaded.');

            // set gettext language
            GLib.setenv(
                'LANGUAGE',
                this.userSettings.AZURE_SPEECH_LANGUAGE,
                true,
            );

            // create instances
            console.log('[AIVA] Creating instances...');
            this._createInstances();

            // open settings if gemini api key is not configured
            console.log('[AIVA] Checking API key...');
            if (this.userSettings.GEMINI_API_KEY === '') {
                console.log('[AIVA] API key not configured.');
                this.openSettings();
            }
            console.log('[AIVA] API key configured.');

            // initialize ui
            console.log('[AIVA] Initializing UI...');
            this.ui.init();

            // initialize chat
            console.log('[AIVA] Initializing chat...');
            this.chat.init();

            // Capture events
            this.captureEvents();

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

        /**
         * @param {*} message
         *
         * logger
         */
        log(message) {
            this.logger.log(message);
        }

        /**
         * @param {*} message
         *
         * log error
         */
        logError(message) {
            this.logger.logError(message);
        }
    },
);

export default class AivaExtension extends Extension {
    /**
     * Enable extension
     */
    enable() {
        // Adiciona o atalho global para F12
        Main.wm.addKeybinding(
            'my-f12-keybinding', // Nome único para o atalho
            new Gio.Settings({schema: 'org.gnome.shell.extensions.aiva'}), // Configurações do atalho
            Meta.KeyBindingFlags.NONE, // Sem flags especiais
            Shell.ActionMode.ALL, // Disponível em todos os modos de ação do Shell
            () => {
                // Função chamada quando F12 é pressionado
                log('F12 foi pressionado!');
            },
        );
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
        // Remove o atalho global para F12 ao desativar a extensão
        Main.wm.removeKeybinding('my-f12-keybinding');
        this._aiva.destroy();
        this._aiva = null;
    }
}
