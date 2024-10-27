import St from 'gi://St';
import GObject from 'gi://GObject';
import Soup from 'gi://Soup';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

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
         * @description load settings
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
         * @description fetch settings
         */
        _fetchSettings() {
            /**
             * @description get extension settings
             */
            const {settings} = this.extension;

            /**
             * @description set/get user settings
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

            /**
             * @description get ui layouts  [tray, icon, item, searchEntry, micButton, clearButton, settingsButton, chatSection, scrollView, inputChat, responseChat, copyButton, newSeparator]
             */
            this.ui = new AppLayout();

            /**
             * @description utility functions [log, logError...]
             */
            this.utils = new Utils(this);

            /**
             * @description Azure API [tts, transcribe]
             */
            this.azure = new MicrosoftAzure(this);

            this.audio = new Audio(this);
        }

        /**
         *
         * @param {*} extension
         *
         * @description init extension
         */
        _init(extension) {
            this.keyLoopBind = 0;
            this.extension = extension;
            this.userSettings = {};
            super._init(0.0, _('AIVA'));
            this._loadSettings();
            this.chatHistory = [];
            this.recursiveHistory = [];
            this.afterTune = null;

            // Recursive Talk
            if (this.userSettings.RECURSIVE_TALK) {
                this.recursiveHistory = this.utils.loadHistoryFile();
            }
            // Tray
            this.ui.tray.add_child(this.ui.icon);
            this.add_child(this.ui.tray);

            // Add scroll to chat section
            this.ui.scrollView.add_child(this.ui.chatSection.actor);

            this.ui.searchEntry.clutter_text.connect('activate', (actor) => {
                const question = actor.text;
                this.ui.searchEntry.clutter_text.set_text('');
                this.ui.searchEntry.clutter_text.reactive = false;
                this.chat(question);
            });
            // Check if searchEntry has focus
            this.ui.searchEntry.connect('button-press-event', () => {
                this.ui.searchEntry.grab_key_focus();
            });

            this.ui.searchEntry.connect('key-focus-in', () => {
                log('Text has gained focus');
            });

            this.ui.searchEntry.connect('key-focus-out', () => {
                log('Text has lost focus');
            });

            this.ui.micButton.connect('clicked', (_self) => {
                this.audio.record();
            });
            this.ui.clearButton.connect('clicked', (_self) => {
                this.ui.searchEntry.clutter_text.set_text('');
                this.chatHistory = [];
                this.menu.box.remove_child(this.ui.scrollView);
                this.ui.chatSection = new PopupMenu.PopupMenuSection();
                this.ui.scrollView.add_child(this.ui.chatSection.actor);
                this.menu.box.add_child(this.ui.scrollView);
            });
            this.ui.settingsButton.connect('clicked', (_self) => {
                this.openSettings();
                // Close App
                this.menu.close();
            });

            // Add search entry, mic button, clear button and settings button to menu
            this.ui.item.add_child(this.ui.searchEntry);
            this.ui.item.add_child(this.ui.micButton);
            this.ui.item.add_child(this.ui.clearButton);
            this.ui.item.add_child(this.ui.settingsButton);

            // Add items to app
            this.menu.addMenuItem(this.ui.item);

            // Add chat section to app
            this.menu.box.add_child(this.ui.scrollView);

            // Open settings if gemini api key is not configured
            if (this.userSettings.GEMINI_API_KEY === '') {
                this.openSettings();
            }
        }

        chat(userQuestion) {
            // Create chat items
            // Create input and response chat items
            let inputChat = new PopupMenu.PopupMenuItem('', {
                style_class: 'input-chat',
                reactive: true,
                can_focus: false,
                hover: true,
            });
            let responseChat = new PopupMenu.PopupMenuItem('', {
                style_class: 'response-chat',
                reactive: true,
                can_focus: false,
                hover: true,
            });

            // Create copy button
            let copyButton = new PopupMenu.PopupMenuItem('', {
                style_class: 'copy-icon',
                reactive: true,
                can_focus: false,
                hover: false,
            });

            // Add user question to chat
            this.ui.chatSection.addMenuItem(inputChat);
            this.ui.chatSection.addMenuItem(responseChat);
            this.ui.chatSection.addMenuItem(copyButton);

            // Set mouse click to copy response to clipboard
            copyButton.connect('activate', (_self) => {
                this.utils.copySelectedText();
            });

            // Chat settings
            inputChat.label.x_expand = true;
            responseChat.label.x_expand = true;

            // Enable text selection
            inputChat.label.clutter_text.reactive = true;
            inputChat.label.clutter_text.selectable = true;

            // Disable clutter_text hover
            inputChat.label.clutter_text.hover = false;

            // Enable text selection
            responseChat.label.clutter_text.reactive = true;
            responseChat.label.clutter_text.selectable = true;

            // Disable clutter_text hover
            responseChat.label.clutter_text.hover = false;

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
            this.response(userQuestion, responseChat, copyButton);

            // Add separator to chat
            this.ui.chatSection.addMenuItem(this.ui.newSeparator);

            // DEBUG
            // let debugPhrase =
            //     'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius lacinia, lectus quam laoreet libero, at laoreet lectus lectus eu quam. Maecenas vitae lacus sit amet justo ultrices condimentum. Maecenas id dolor vitae quam semper blandit. Aenean sed sapien ut ante elementum bibendum. Sed euismod, nisl id varius la';
        }

        response(userQuestion, responseChat, copyButton, destroyLoop = false) {
            if (destroyLoop) {
                this.destroyLoop();
            }

            // Scroll down
            this._scrollToBottom();

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
                        responseChat?.label.clutter_text.set_markup(response);
                        // Scroll down
                        this._scrollToBottom();
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

                                responseChat?.label.clutter_text.set_markup(
                                    '<b>Gemini: </b> ' + aiResponse,
                                );

                                // Scroll down
                                this._scrollToBottom();
                                // Enable searchEntry
                                this.ui.searchEntry.clutter_text.reactive = true;
                                return;
                            }
                        }
                    }

                    if (
                        aiResponse !== undefined &&
                        responseChat !== undefined
                    ) {
                        // Set ai response to chat
                        let formatedResponse =
                            this.utils.textformat(aiResponse);
                        responseChat?.label.clutter_text.set_markup(
                            '<b>Gemini: </b> ' + formatedResponse,
                        );

                        // Add copy button to chat
                        if (copyButton) {
                            this.ui.chatSection.addMenuItem(copyButton);
                        }

                        // Scroll down
                        this._scrollToBottom();

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
                        this._scrollToBottom();
                    }
                },
            );
        }

        _scrollToBottom() {
            this.utils.scrollToBottom(this.ui.responseChat, this.ui.scrollView);
        }

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

        openSettings() {
            this.extension.openSettings();
        }

        destroyLoop() {
            if (this.afterTune) {
                clearTimeout(this.afterTune);
                this.afterTune = null;
            }
        }

        destroy() {
            this.destroyLoop();
            super.destroy();
        }

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
                log(`Executing command: ${command}`);
            } else {
                log('Error executing command.');
            }
        }

        // Remove all .wav file from /tmp folder
        removeWavFiles() {
            log('Removing all .wav files from /tmp folder');
            const command = 'rm -rf /tmp/*gva*.wav';
            const process = GLib.spawn_async(
                null, // pasta de trabalho
                ['/bin/sh', '-c', command], // comando e argumentos
                null, // opções
                GLib.SpawnFlags.SEARCH_PATH, // flags
                null, // PID
            );

            if (process) {
                log('Wav files removed successfully.');
            } else {
                log('Error removing wav files.');
            }
        }

        // Play audio
        playAudio(audiofile) {
            if (!this.isPlaying) {
                log('Playing audio: ' + audiofile);
                // Process sync, not async
                const process = GLib.spawn_async(
                    null, // pasta de trabalho
                    ['/bin/sh', '-c', `play ${audiofile}`], // comando e argumentos
                    null, // opções
                    GLib.SpawnFlags.SEARCH_PATH, // flags
                    null, // PID
                );
                if (process) {
                    this.playingPid = process.pid;
                    this.isPlaying = true;
                    log('Audio played successfully.');
                } else {
                    log('Error playing audio.');
                }
            } else {
                log('Audio already playing.');
                // Kill player pid
                GLib.spawn_command_line_async('kill ' + this.playingPid);
                this.isPlaying = false;
                this.playAudio(audiofile);
            }
        }

        // Função para iniciar a gravação
        startRecording() {
            if (this.isRecording) {
                // Stop recording
                this.stopRecording();
                return;
            }
            // Definir o arquivo de saída no diretório da extensão
            this.outputPath = 'gva_temp_audio_XXXXXX.wav';

            // Pipeline GStreamer para capturar áudio do microfone e salvar como .wav
            this.pipeline = new Gio.Subprocess({
                argv: [
                    'gst-launch-1.0',
                    'pulsesrc',
                    '!',
                    'audioconvert',
                    '!',
                    'wavenc',
                    '!',
                    'filesink',
                    `location=${this.outputPath}`,
                ],
                flags:
                    Gio.SubprocessFlags.STDOUT_PIPE |
                    Gio.SubprocessFlags.STDERR_PIPE,
            });

            this.pipeline.init(null);
            this.isRecording = true;
        }

        stopRecording() {
            if (!this.isRecording) {
                return;
            }

            // Stop recording
            this.pipeline.force_exit();

            // Transcribe audio
            this.transcribeAudio(this.outputPath);

            //
            this.isRecording = false;
        }

        // Função para transcrever o áudio gravado usando Microsoft Speech-to-Text API
        transcribeAudio(audioPath) {
            // Carregar o arquivo de áudio em formato binário
            let file = Gio.File.new_for_path(audioPath);
            let [, audioBinary] = file.load_contents(null);

            if (!audioBinary) {
                log('Falha ao carregar o arquivo de áudio.');
                return;
            }

            // Requisição à API do Microsoft Speech-to-Text
            const apiUrl = `https://${this.userSettings.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${this.userSettings.AZURE_SPEECH_LANGUAGE}`;

            // Headers necessários para a requisição
            const headers = [
                'Content-Type: audio/wav', // O arquivo será enviado em formato .wav
                'Ocp-Apim-Subscription-Key: ' +
                    this.userSettings.AZURE_SPEECH_KEY, // Chave de autenticação
                'Accept: application/json', // A resposta será em JSON
            ];

            // Criar um arquivo temporário para armazenar o áudio binário (opcional)
            const [success, tempFilePath] = GLib.file_open_tmp(
                'gva_azure_att_audio_XXXXXX.wav',
            );
            if (!success) {
                log('Error creating temporary audio file.');
                return;
            }

            // Escrever o áudio binário no arquivo temporário
            try {
                GLib.file_set_contents(tempFilePath, audioBinary);
            } catch (e) {
                log('Erro ao escrever no arquivo temporário: ' + e.message);
                return;
            }

            // Usa subprocesso para enviar requisição HTTP com curl, lendo o áudio do arquivo
            let subprocess = new Gio.Subprocess({
                argv: [
                    'curl',
                    '-X',
                    'POST',
                    '-H',
                    headers[0], // Content-Type
                    '-H',
                    headers[1], // Ocp-Apim-Subscription-Key
                    '-H',
                    headers[2], // Accept
                    '--data-binary',
                    '@' + tempFilePath, // Enviar o arquivo de áudio binário
                    apiUrl,
                ],
                flags:
                    Gio.SubprocessFlags.STDOUT_PIPE |
                    Gio.SubprocessFlags.STDERR_PIPE,
            });

            subprocess.init(null);

            // Captura a resposta da API
            subprocess.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    let [ok, stdout, stderr] =
                        proc.communicate_utf8_finish(res);
                    if (ok && stdout) {
                        log('Resposta da API: ' + stdout);
                        let response = JSON.parse(stdout);

                        if (response && response.DisplayText) {
                            let transcription = response.DisplayText;
                            log('Transcrição: ' + transcription);
                            this.aiResponse(transcription); // Função para processar a resposta da transcrição
                        } else {
                            log('Nenhuma transcrição encontrada.');
                        }
                    } else {
                        log('Erro na requisição: ' + stderr);
                    }
                } catch (e) {
                    log('Erro ao processar resposta: ' + e.message);
                } finally {
                    // Remove all temp files
                    GLib.unlink(audioPath);
                    GLib.unlink(tempFilePath);
                    this.utils.removeWavFiles();
                }
            });
        }

        // Função para converter texto em áudio usando Microsoft Text-to-Speech API
        textToSpeech(text) {
            const apiUrl = `https://${this.userSettings.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

            // Headers para a requisição
            const headers = [
                'Content-Type: application/ssml+xml', // O conteúdo será enviado em formato SSML
                'X-Microsoft-OutputFormat: riff-24khz-16bit-mono-pcm', // Especifica o formato do áudio
                'Ocp-Apim-Subscription-Key: ' +
                    this.userSettings.AZURE_SPEECH_KEY, // Chave da API da Azure
            ];

            // Estrutura SSML (Speech Synthesis Markup Language) para definir o texto e a voz
            const ssml = `
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${this.userSettings.AZURE_SPEECH_LANGUAGE}'>
            <voice name='${this.userSettings.AZURE_SPEECH_VOICE}'>${text}</voice>
        </speak>
    `;

            // Criar um arquivo temporário para salvar o áudio gerado
            const [success, tempFilePath] = GLib.file_open_tmp(
                'gva_azure_tts_audio_XXXXXX.wav',
            );
            if (!success) {
                log('Error creating temporary audio file.');
                return;
            }

            // Escrever o SSML no arquivo temporário
            try {
                GLib.file_set_contents(tempFilePath, ssml);
            } catch (e) {
                log('Error writing to temporary audio file: ' + e.message);
                return;
            }

            // Usa subprocesso para enviar requisição HTTP com curl, e salvar a resposta (áudio) em um arquivo
            let subprocess = new Gio.Subprocess({
                argv: [
                    'curl',
                    '-X',
                    'POST',
                    '-H',
                    headers[0], // Content-Type
                    '-H',
                    headers[1], // X-Microsoft-OutputFormat
                    '-H',
                    headers[2], // Ocp-Apim-Subscription-Key
                    '--data',
                    ssml, // Dados a serem enviados (SSML)
                    '--output',
                    tempFilePath, // Salva o áudio gerado no arquivo temporário
                    apiUrl,
                ],
                flags:
                    Gio.SubprocessFlags.STDOUT_PIPE |
                    Gio.SubprocessFlags.STDERR_PIPE,
            });

            subprocess.init(null);

            // Captura o status da requisição
            subprocess.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    // eslint-disable-next-line no-unused-vars
                    let [ok, stdout, stderr] =
                        proc.communicate_utf8_finish(res);
                    if (ok) {
                        log('Audio file saved to: ' + tempFilePath);

                        // Tocar o áudio gerado
                        this.playAudio(tempFilePath);
                    } else {
                        log('Requisition error: ' + stderr);
                    }
                } catch (e) {
                    log('Error processing response: ' + e.message);
                } finally {
                    // Limpeza: pode optar por remover o arquivo temporário após tocar o áudio, se necessário
                    // GLib.unlink(tempFilePath);
                }
            });
        }
    },
);

export default class AivaExtension extends Extension {
    enable() {
        let url = 'https://thisipcan.cyou/json';
        let _httpSession = new Soup.Session();
        let message = Soup.Message.new('GET', url);
        this._aiva = new Aiva({
            clipboard: St.Clipboard.get_default(),
            settings: this.getSettings(),
            openSettings: this.openPreferences,
            uuid: this.uuid,
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
                this._aiva.settings.LOCATION = `${res.countryName}/${res.cityName}`;
                log(this._aiva.settings.LOCATION);
            },
        );
    }

    disable() {
        this._aiva.destroy();
        this._aiva = null;
    }
}
