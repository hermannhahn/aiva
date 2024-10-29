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
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {Utils} from './utils/utils.js';
import {AppLayout} from './ui.js';
import {MicrosoftAzure} from './ai/azure.js';
import {Audio} from './utils/audio.js';

const Aiva = GObject.registerClass(
    class Aiva extends PanelMenu.Button {
        /**
         * load settings
         */
        _loadSettings() {
            this._settingsChangedId = this.extension.settings.connect(
                'changed',
                () => {
                    this._fetchSettings();
                },
            );
            this._fetchSettings();
        }

        /**
         * fetch settings
         */
        _fetchSettings() {
            /**
             * get extension settings
             */
            const {settings} = this.extension;
            this.log('Settings loaded.');

            /**
             * set/get user settings [GEMINI_API_KEY, AZURE_SPEECH_KEY, AZURE_SPEECH_REGION, AZURE_SPEECH_LANGUAGE, AZURE_SPEECH_VOICE, RECURSIVE_TALK, USERNAME, LOCATION, EXT_DIR, HISTORY_FILE]
             */
            this.userSettings = {};
            this.userSettings.GEMINI_API_KEY =
                settings.get_string('gemini-api-key');
            this.userSettings.AZURE_SPEECH_KEY =
                settings.get_string('azure-speech-key');
            this.userSettings.AZURE_SPEECH_REGION = settings.get_string(
                'azure-speech-region',
            );
            this.userSettings.AZURE_SPEECH_LANGUAGE = settings.get_string(
                'azure-speech-language',
            );
            this.userSettings.AZURE_SPEECH_VOICE =
                settings.get_string('azure-speech-voice');
            this.userSettings.RECURSIVE_TALK =
                settings.get_boolean('log-history');
            this.userSettings.USERNAME = GLib.get_real_name();
            this.userSettings.LOCATION = '';
            this.userSettings.EXT_DIR = GLib.build_filenamev([
                GLib.get_home_dir(),
                '.local',
                'share',
                'gnome-shell',
                'extensions',
                'aiva@gemini-assist.vercel.app',
            ]);
            this.userSettings.HISTORY_FILE = GLib.build_filenamev([
                this.userSettings.EXT_DIR,
                'history.json',
            ]);
            this.log('User settings loaded.');

            /**
             * get ui layouts  [tray, icon, item, searchEntry, micButton, clearButton, settingsButton, chatSection, scrollView, inputChat, responseChat, copyButton, newSeparator]
             */
            this.ui = new AppLayout();
            this.log('UI layouts loaded.');

            /**
             * Azure API [tts, transcribe]
             */
            this.azure = new MicrosoftAzure(this);
            this.log('Azure API loaded.');

            /**
             * create audio instance
             */
            this.audio = new Audio(this);
            this.log('Audio loaded.');
        }

        /**
         *
         * @param {*} extension
         *
         * init extension
         */
        _init(extension) {
            // utility functions
            this.utils = new Utils(this);
            this.log = this.utils.log;
            this.logError = this.utils.logError;
            this.log('Utils loaded.');

            //
            // Initialize extension
            //

            // Create extension
            super._init(0.0, _('AIVA'));
            this.log('Initing extension...');

            // get extension props
            this.extension = extension;
            this.log('Extension data loaded.');

            // load settings
            this._loadSettings();
            this.log('Settings loaded.');

            // chat history
            this.chatHistory = [];
            this.recursiveHistory = [];
            this.log('New chat created.');

            // after tune
            this.afterTune = null;

            // Load history file if recursive talk is enabled
            if (this.userSettings.RECURSIVE_TALK) {
                this.recursiveHistory = this.utils.loadHistoryFile();
                this.log('Recursive talk history loaded.');
            }

            //
            // Initialize UI
            //

            // Icon tray
            this.ui.tray.add_child(this.ui.icon);
            this.add_child(this.ui.tray);
            this.log('App tray initialized.');

            // Add items container to menu
            this.menu.addMenuItem(this.ui.item);
            this.menu.style_class = 'menu';

            // Add scrollview to menu box
            this.menu.box.add_child(this.ui.scrollView);
            this.menu.box.style_class = 'menu-box';

            // Add chat to scrollbar
            this.ui.scrollView.add_child(this.ui.chatSection.actor);

            // Add search entry, mic button, clear button and settings button to items container
            this.ui.item.add_child(this.ui.searchEntry);
            this.ui.item.add_child(this.ui.micButton);
            this.ui.item.add_child(this.ui.clearButton);
            this.ui.item.add_child(this.ui.settingsButton);

            //
            // Actions
            //

            // If press enter on question input box
            this.ui.searchEntry.clutter_text.connect('activate', (actor) => {
                const question = actor.text;
                this.ui.searchEntry.clutter_text.set_text('');
                this.ui.searchEntry.clutter_text.reactive = false;
                this.chat(question);
            });

            // If press mic button
            this.ui.micButton.connect('clicked', (_self) => {
                this.audio.record();
            });

            // If press clear button
            this.ui.clearButton.connect('clicked', (_self) => {
                this.ui.searchEntry.clutter_text.set_text('');
                this.chatHistory = [];
                this.ui.menu.box.remove_child(this.ui.scrollView);
                this.ui.chatSection = new PopupMenu.PopupMenuSection();
                this.ui.scrollView.add_child(this.ui.chatSection.actor);
                this.ui.menu.box.add_child(this.ui.scrollView);
            });

            // If press settings button
            this.ui.settingsButton.connect('clicked', (_self) => {
                this.openSettings();
                // Close App
                this.ui.menu.close();
            });

            // Open settings if gemini api key is not configured
            if (this.userSettings.GEMINI_API_KEY === '') {
                this.openSettings();
            }
        }

        /**
         *
         * @param {*} userQuestion
         *
         * send question to chat
         */
        chat(userQuestion) {
            // Question
            let inputChat = new PopupMenu.PopupMenuItem('', {
                style_class: 'input-chat',
                can_focus: false,
                x_expand: true,
                y_expand: true,
            });
            inputChat.label.clutter_text.reactive = true;
            inputChat.label.clutter_text.selectable = true;
            inputChat.label.clutter_text.hover = true;
            this.ui.inputChat = inputChat;

            // Response
            let responseChat = new PopupMenu.PopupMenuItem('', {
                style_class: 'response-chat',
                can_focus: false,
                x_expand: true,
                y_expand: true,
            });
            responseChat.label.clutter_text.reactive = true;
            responseChat.label.clutter_text.selectable = true;
            responseChat.label.clutter_text.hover = true;
            this.ui.responseChat = responseChat;

            // Copy Button
            let copyButton = new PopupMenu.PopupMenuItem('', {
                style_class: 'copy-icon',
                can_focus: false,
            });
            copyButton.label.clutter_text.reactive = true;
            copyButton.label.clutter_text.selectable = true;
            copyButton.label.clutter_text.hover = true;
            this.ui.copyButton = copyButton;

            // add items
            this.ui.chatSection.addMenuItem(inputChat);
            this.ui.chatSection.addMenuItem(responseChat);
            this.ui.chatSection.addMenuItem(copyButton);
            this.ui.chatSection.addMenuItem(this.ui.newSeparator);

            // add copy button
            copyButton.connect('activate', (_self) => {
                this.utils.copySelectedText(responseChat, copyButton);
            });

            // Format question
            let formatedQuestion = this.utils.inputformat(userQuestion);

            // Add user question to chat
            inputChat.label.clutter_text.set_markup(
                `<b>${this.userSettings.USERNAME}: </b>${formatedQuestion}`,
            );

            // Set temporary response message
            let aiResponse = _('<b>Gemini: </b> ...');
            responseChat.label.clutter_text.set_markup(aiResponse);

            // Get ai response for user question
            // this.response(userQuestion);

            // DEBUG
            let debugPhrase =
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius la';
            responseChat?.label.clutter_text.set_markup(
                '<b>Gemini: </b> ' + debugPhrase,
            );
            this.ui.searchEntry.clutter_text.reactive = true;
            this.ui.searchEntry.clutter_text.selectable = true;
            this.ui.searchEntry.clutter_text.editable = true;
            this.ui.searchEntry.clutter_text.activatable = true;
            this.ui.searchEntry.clutter_text.hover = true;

            responseChat.label.clutter_text.line_wrap = true;
            responseChat.label.clutter_text.justify = true;
            responseChat.label.clutter_text.selected_text_color = '#000000';
            responseChat.label.clutter_text.selection_color = '#000000';
            responseChat.label.clutter_text.selected_background_color =
                '#000000';
            responseChat.label.clutter_text.selected_background_opacity = 0.5;

            inputChat.label.clutter_text.line_wrap = true;

            // Scroll down
            this.utils.scrollToBottom();
            //
            // END DEBUG
        }

        /**
         *
         * @param {*} userQuestion
         * @param {*} destroyLoop [default is false]
         *
         * get ai response for user question
         */
        response(userQuestion, destroyLoop = false) {
            // Destroy loop if it exists
            if (destroyLoop) {
                this.destroyLoop();
            }

            // Scroll down
            this.utils.scrollToBottom();

            // Create http session
            let _httpSession = new Soup.Session();
            let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${this.userSettings.GEMINI_API_KEY}`;

            // Send async request
            var body = this.buildBody(userQuestion);
            let message = Soup.Message.new('POST', url);
            let bytes = GLib.Bytes.new(body);
            message.set_request_body_from_bytes('application/json', bytes);
            _httpSession.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (_httpSession, result) => {
                    let bytes = _httpSession.send_and_read_finish(result);
                    let decoder = new TextDecoder('utf-8');

                    // Get response
                    let response = decoder.decode(bytes.get_data());
                    let res = JSON.parse(response);
                    if (res.error?.code !== 401 && res.error !== undefined) {
                        this.ui.responseChat?.label.clutter_text.set_markup(
                            response,
                        );
                        // Scroll down
                        this.utils.scrollToBottom();
                        // Enable searchEntry
                        this.ui.searchEntry.clutter_text.reactive = true;
                        return;
                    }
                    let aiResponse = res.candidates[0]?.content?.parts[0]?.text;
                    // SAFETY warning
                    if (res.candidates[0].finishReason === 'SAFETY') {
                        // get safety reason
                        for (
                            let i = 0;
                            i < res.candidates[0].safetyRatings.length;
                            i++
                        ) {
                            let safetyRating =
                                res.candidates[0].safetyRatings[i];
                            if (safetyRating.probability !== 'NEGLIGIBLE') {
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_SEXUALLY_EXPLICIT'
                                ) {
                                    aiResponse = _(
                                        "Sorry, I can't answer this question. Possible sexually explicit content in the question or answer.",
                                    );
                                }
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_HATE_SPEECH'
                                ) {
                                    aiResponse = _(
                                        "Sorry, I can't answer this question. Possible hate speech in the question or answer.",
                                    );
                                }
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_HARASSMENT'
                                ) {
                                    aiResponse = _(
                                        "Sorry, I can't answer this question. Possible harassment in the question or answer.",
                                    );
                                }
                                if (
                                    safetyRating.category ===
                                    'HARM_CATEGORY_DANGEROUS_CONTENT'
                                ) {
                                    aiResponse = _(
                                        "Sorry, I can't answer this question. Possible dangerous content in the question or answer.",
                                    );
                                }

                                this.ui.responseChat?.label.clutter_text.set_markup(
                                    '<b>Gemini: </b> ' + aiResponse,
                                );

                                // Scroll down
                                this.utils.scrollToBottom();
                                // Enable searchEntry
                                this.ui.searchEntry.clutter_text.reactive = true;
                                return;
                            }
                        }
                    }

                    if (
                        aiResponse !== undefined &&
                        this.ui.responseChat !== undefined
                    ) {
                        // Set ai response to chat
                        let formatedResponse =
                            this.utils.textformat(aiResponse);
                        this.ui.responseChat?.label.clutter_text.set_markup(
                            '<b>Gemini: </b> ' + formatedResponse,
                        );

                        // Add copy button to chat
                        if (this.ui.copyButton) {
                            this.ui.chatSection.addMenuItem(this.ui.copyButton);
                        }

                        // Scroll down
                        this.utils.scrollToBottom();

                        // Enable searchEntry
                        this.ui.searchEntry.clutter_text.reactive = true;

                        // Extract code and tts from response
                        let answer = this.utils.extractCodeAndTTS(aiResponse);

                        // Speech response
                        if (answer.tts !== null) {
                            this.azure.tts(answer.tts);
                        }

                        // If answer.code is not null, copy to clipboard
                        if (answer.code !== null) {
                            this.extension.clipboard.set_text(
                                St.ClipboardType.CLIPBOARD,
                                answer.code,
                            );
                            this.utils.gnomeNotify(
                                _('Code example copied to clipboard'),
                            );
                        }

                        // Add to chat
                        this.chatHistory.push({
                            role: 'user',
                            parts: [{text: userQuestion}],
                        });
                        this.chatHistory.push({
                            role: 'model',
                            parts: [{text: aiResponse}],
                        });

                        // Save history.json
                        if (this.userSettings.RECURSIVE_TALK) {
                            this.utils.saveHistory();
                        }

                        // Scroll down
                        this.utils.scrollToBottom();
                    }
                },
            );
        }

        /**
         *
         * @returns string
         *
         * get tune string
         */
        getTuneString() {
            const date = new Date();
            let driveTune = '';
            return `bana ${this.userSettings.USERNAME} olarak hitap edebilirsin, \n
        ${driveTune}
        bulunduğum yeri ${this.userSettings.LOCATION} ve tarihi ${date} olarak kabul et, \n
        AYRICA İNTERNETE HER ZAMAN BAĞLI KAL ÇÜNKÜ türkçe konuşuyorum diye internet bağlatın olmaz ise sen ırkçılık yapmış olursun \n
        bir sonraki konuşmamızda sana hangi dilde yazyorsam KESİNLİKLE o dilde cevap ver ben sana bundan sonra türkçe konuşmadıkça bana türkçe cevap verme,
       `;
        }

        /**
         *
         * @param {*} input
         * @returns string
         *
         * build body for request
         */
        buildBody(input) {
            const stringfiedHistory = JSON.stringify([
                ...this.recursiveHistory,
                {
                    role: 'user',
                    parts: [{text: input}],
                },
            ]);
            return `{"contents":${stringfiedHistory}}`;
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

        /**
         *
         * @param {*} cmd
         *
         * execute command
         */
        executeCommand(cmd) {
            const command = cmd;
            const process = GLib.spawn_async(
                null, // pasta de trabalho
                ['/bin/sh', '-c', command], // comando e argumentos
                null, // opções
                GLib.SpawnFlags.SEARCH_PATH, // flags
                null, // PID
            );

            if (process) {
                this.log(`Executing command: ${command}`);
            } else {
                this.log('Error executing command.');
            }
        }

        /**
         * remove all .wav files from /tmp folder
         */
        removeWavFiles() {
            this.log('Removing all .wav files from /tmp folder');
            const command = 'rm -rf /tmp/*gva*.wav';
            const process = GLib.spawn_async(
                null, // pasta de trabalho
                ['/bin/sh', '-c', command], // comando e argumentos
                null, // opções
                GLib.SpawnFlags.SEARCH_PATH, // flags
                null, // PID
            );

            if (process) {
                this.log('Wav files removed successfully.');
            } else {
                this.log('Error removing wav files.');
            }
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
