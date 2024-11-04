import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class MicrosoftAzure {
    constructor(app) {
        /**
         * set/get app props
         */
        this.app = app;
        this.app.log('Microsoft Azure API loaded.');

        /**
         * get azure api settings
         */
        this.AZURE_SPEECH_KEY = app.userSettings.AZURE_SPEECH_KEY;
        this.AZURE_SPEECH_REGION = app.userSettings.AZURE_SPEECH_REGION;
        this.AZURE_SPEECH_LANGUAGE = app.userSettings.AZURE_SPEECH_LANGUAGE;
        this.AZURE_SPEECH_VOICE = app.userSettings.AZURE_SPEECH_VOICE;
    }

    /**
     *
     * @param {*} text
     * @returns Audio file path
     *
     * Microsoft Text-to-Speech API
     */
    tts(text) {
        /**
         * API URL
         */
        const apiUrl = `https://${this.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

        /**
         * Requisition headers
         */
        const headers = [
            'Content-Type: application/ssml+xml', // O conteúdo será enviado em formato SSML
            'X-Microsoft-OutputFormat: riff-24khz-16bit-mono-pcm', // Especifica o formato do áudio
            'Ocp-Apim-Subscription-Key: ' + this.AZURE_SPEECH_KEY, // Chave da API da Azure
        ];

        /**
         * Set text and voice language
         */
        const ssml = `
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${this.AZURE_SPEECH_LANGUAGE}'>
            <voice name='${this.AZURE_SPEECH_VOICE}'>${text}</voice>
        </speak>
    `;

        /**
         * Create temporary audio file
         */
        const [success, tempFilePath] = GLib.file_open_tmp(
            'gva_azure_tts_audio_XXXXXX.wav',
        );
        if (!success) {
            this.app.log('Error creating temporary audio file.');
            return;
        }

        /**
         * Write SSML to temporary file
         */
        try {
            GLib.file_set_contents(tempFilePath, ssml);
            this.app.log('SSML written to temporary audio file.');
        } catch (e) {
            this.app.log('Error writing to temporary audio file: ' + e.message);
            return;
        }

        /**
         * Use subprocess to send HTTP request with curl, and save the response (audio) to a file
         */
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
                ssml, // SSML
                '--output',
                tempFilePath, // Save temporary file path
                apiUrl,
            ],
            flags:
                Gio.SubprocessFlags.STDOUT_PIPE |
                Gio.SubprocessFlags.STDERR_PIPE,
        });
        subprocess.init(null);
        subprocess.communicate_utf8_async(null, null, (proc, res) => {
            try {
                // eslint-disable-next-line no-unused-vars
                let [success, stdout, stderr] =
                    proc.communicate_utf8_finish(res);
                if (success) {
                    this.app.log('Audio file saved to: ' + tempFilePath);
                    // Play audio
                    this.app.audio.play(tempFilePath);
                } else {
                    this.app.log('Requisition error: ' + stderr);
                }
            } catch (e) {
                this.app.log('Error processing response: ' + e.message);
            } finally {
                // GLib.unlink(tempFilePath);
            }
        });
    }

    /**
     *
     * @param {*} audioPath
     * @returns text
     *
     * Microsoft Speech-to-Text API
     */
    transcribe(audioPath) {
        /**
         * Load audio file
         */
        let file = Gio.File.new_for_path(audioPath);
        /**
         * convert file to binary
         */
        let [, audioBinary] = file.load_contents(null);
        if (!audioBinary) {
            this.app.log('Falha ao carregar o arquivo de áudio.');
            return;
        }

        /**
         * API URL
         */
        const apiUrl = `https://${this.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${this.AZURE_SPEECH_LANGUAGE}`;

        /**
         * Requisition headers
         */
        const headers = [
            'Content-Type: audio/wav', // O arquivo será enviado em formato .wav
            'Ocp-Apim-Subscription-Key: ' + this.AZURE_SPEECH_KEY, // Chave de autenticação
            'Accept: application/json', // A resposta será em JSON
        ];

        /**
         * Create temporary audio file
         */
        const [success, tempFilePath] = GLib.file_open_tmp(
            'gva_azure_att_audio_XXXXXX.wav',
        );
        if (!success) {
            this.app.log('Error creating temporary audio file.');
            return;
        }

        /**
         * Write audio to temporary file
         */
        try {
            GLib.file_set_contents(tempFilePath, audioBinary);
        } catch (e) {
            this.app.log(
                'Erro ao escrever no arquivo temporário: ' + e.message,
            );
            return;
        }

        /**
         * Use subprocess to send HTTP request with curl, reading the audio from the file
         */
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
                let [ok, stdout, stderr] = proc.communicate_utf8_finish(res);
                if (ok && stdout) {
                    this.app.log('Resposta da API: ' + stdout);
                    let response = JSON.parse(stdout);

                    if (response && response.DisplayText) {
                        let transcription = response.DisplayText;
                        this.app.log('Transcrição: ' + transcription);
                        this.app.brain.proccess(transcription);
                    } else {
                        this.app.log('Nenhuma transcrição encontrada.');
                        this.app.chat.addQuestion('Transcribe error.');
                    }
                } else {
                    this.app.log('Erro na requisição: ' + stderr);
                    this.app.chat.addResponse(stderr);
                }
            } catch (e) {
                this.app.log('Erro ao processar resposta: ' + e.message);
                this.app.chat.addResponse(e.message);
            }
        });
    }
}
