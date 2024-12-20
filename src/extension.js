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
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import {
    Extension,
    gettext as _,
} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

// App
import {Database} from './database.js';
import {Audio} from './audio.js';
import {Interpreter} from './interpreter.js';
import {Chat} from './chat.js';
import {UI} from './ui.js';
import {Utils} from './utils/utils.js';
import {Commands} from './commands.js';

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
            this._shortcutBinding = null;
            this.interface = this.menu;

            // extension directory
            const EXT_DIR = GLib.build_filenamev([
                GLib.get_home_dir(),
                '.local',
                'share',
                'gnome-shell',
                'extensions',
                this.extension.uuid,
            ]);

            // user name
            let username = settings.get_string('user-name');
            if (username === '') {
                username = GLib.get_real_name();
                settings.set_string('user-name', username);
            }

            // settings
            this.userSettings = {
                ASSIST_NAME: settings.get_string('assist-name'),
                AZURE_SPEECH_KEY: settings.get_string('azure-speech-key'),
                AZURE_SPEECH_REGION: settings.get_string('azure-speech-region'),
                AZURE_SPEECH_LANGUAGE: settings.get_string(
                    'azure-speech-language',
                ),
                AZURE_SPEECH_VOICE: settings.get_string('azure-speech-voice'),
                GEMINI_API_KEY: settings.get_string('gemini-api-key'),
                HISTORY_FILE: GLib.build_filenamev([EXT_DIR, 'history.sqlite']),
                RECURSIVE_TALK: settings.get_boolean('log-history'),
                TRANSPARENCY: settings.get_string('theme-transparency'),
                COLOR: settings.get_string('theme-color'),
                LOCATION: settings.get_string('location'),
                USERNAME: username,
            };
        }

        /**
         * @description public instances
         */
        _createInstances() {
            this.database = new Database(this);
            this.audio = new Audio(this);
            this.interpreter = new Interpreter(this);
            this.chat = new Chat(this);
            this.ui = new UI(this);
            this.utils = new Utils(this);
            this.commands = new Commands(this);
            this.azure = new MicrosoftAzure(this);
            this.gemini = new GoogleGemini(this);
        }

        /**
         * @description init extension
         * @param {*} extension - this.extension
         */
        _init(extension) {
            // initialize
            console.log('[AIVA] Initializing extension...');
            super._init(0.0, 'aiva');
            this.extension = extension;

            // load settings
            this._loadSettings();
            GLib.setenv(
                'LANGUAGE',
                this.userSettings.AZURE_SPEECH_LANGUAGE,
                true,
            );
            console.log('[AIVA] Settings loaded!');

            // create instances
            console.log('[AIVA] Creating instances...');
            this._createInstances();
            this.log('Instances created!');

            // open settings if gemini api key is not configured
            if (this.userSettings.GEMINI_API_KEY === '') {
                this.log('API key not configured.');
                this.openSettings();
            } else {
                this.log('API key configured!');
            }

            // ui
            this.ui.create();
            this.chat.init();

            this.log('Extension initialized.');
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
            console.log('[AIVA] ' + message);
        }

        /**
         * @description log error shortcut
         * @param {string} message - string to log error
         */
        logError(message) {
            console.error('[AIVA] ' + message);
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
        this._app = new Aiva({
            clipboard: St.Clipboard.get_default(),
            settings: this.getSettings(),
            openSettings: this.openPreferences,
            uuid: this.uuid,
            userSettings: this.userSettings,
            log: console.log,
            logError: console.error,
        });
        this._app.log('Starting...');

        // add to status bar
        Main.panel.addToStatusArea('gvaGnomeExtension', this._app, 1);

        // key events
        this._shortcutBinding = global.stage.connect(
            'key-press-event',
            this._onKeyPress.bind(this),
        );

        // register dbus
        this._registerDBus();
    }

    /**
     * @description disable extension
     */
    disable() {
        if (this._shortcutBinding) {
            global.display.disconnect(this._shortcutBinding);
            this._shortcutBinding = null;
        }
        this._app.database.closeDatabase();
        this._app.log('Disabling extension...');
        this._app.destroy();
        this._app = null;
        console.log('[AIVA] Extension disabled.');
    }

    _onKeyPress(display, event) {
        const symbol = event.get_key_symbol();
        // Keybind: ESC [65307]
        // Clutter.KEY_ESC
        if (symbol === 65307 || symbol === Clutter.KEY_F1) {
            // start recording, true to enable spam protection
            this._app.audio.record(true);
            return Clutter.EVENT_STOP; // Impede a propagação do evento
        }
        return Clutter.EVENT_PROPAGATE;
    }

    _registerDBus() {
        const interfaceXML = `
        <node>
            <interface name="org.gnome.shell.extensions.aiva">
                <method name="SetRequestable">
                    <arg type="s" name="request" direction="in"/>
                </method>
            </interface>
        </node>
        `;

        const dbusImpl = Gio.DBusExportedObject.wrapJSObject(interfaceXML, {
            SetRequestable(request) {
                this._app.log(`Request received: ${request}`);
            },
        });

        dbusImpl.export(Gio.DBus.session, '/org/gnome/shell/extensions/aiva');

        this._app.log('D-Bus server started');
    }
}
