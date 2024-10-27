import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class MicrosoftAzure {
    constructor(app) {
        this.app = app;
        this.log = app.utils.log;

        this.AZURE_SPEECH_KEY = app.AZURE_SPEECH_KEY;
        this.AZURE_SPEECH_REGION = app.AZURE_SPEECH_REGION;
        this.AZURE_SPEECH_LANGUAGE = app.AZURE_SPEECH_LANGUAGE;
        this.AZURE_SPEECH_VOICE = app.AZURE_SPEECH_VOICE;
        this.app.utils.log('Microsoft Azure API loaded');
    }

    // Função para converter texto em áudio usando Microsoft Text-to-Speech API
    tts(text) {
        const apiUrl = `https://${this.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

        // Headers para a requisição
        const headers = [
            'Content-Type: application/ssml+xml', // O conteúdo será enviado em formato SSML
            'X-Microsoft-OutputFormat: riff-24khz-16bit-mono-pcm', // Especifica o formato do áudio
            'Ocp-Apim-Subscription-Key: ' + this.AZURE_SPEECH_KEY, // Chave da API da Azure
        ];

        // Estrutura SSML (Speech Synthesis Markup Language) para definir o texto e a voz
        const ssml = `
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${this.AZURE_SPEECH_LANGUAGE}'>
            <voice name='${this.AZURE_SPEECH_VOICE}'>${text}</voice>
        </speak>
    `;

        // Criar um arquivo temporário para salvar o áudio gerado
        const [success, tempFilePath] = GLib.file_open_tmp(
            'gva_azure_tts_audio_XXXXXX.wav',
        );
        if (!success) {
            this.app.utils.log('Error creating temporary audio file.');
            return;
        }

        // Escrever o SSML no arquivo temporário
        try {
            GLib.file_set_contents(tempFilePath, ssml);
            this.app.utils.log('SSML written to temporary audio file.');
        } catch (e) {
            this.app.utils.log(
                'Error writing to temporary audio file: ' + e.message,
            );
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
            // Processa a resposta (áudio)
            try {
                // eslint-disable-next-line no-unused-vars
                let [ok, stdout, stderr] = proc.communicate_utf8_finish(res);
                if (ok) {
                    this.app.utils.log('Audio file saved to: ' + tempFilePath);
                    // Tocar o áudio gerado
                    this.app.audio.play(tempFilePath);
                } else {
                    this.app.utils.log('Requisition error: ' + stderr);
                }
            } catch (e) {
                this.app.utils.log('Error processing response: ' + e.message);
            } finally {
                // Limpeza: pode optar por remover o arquivo temporário após tocar o áudio, se necessário
                // GLib.unlink(tempFilePath);
            }
        });
    }

    // Função para transcrever o áudio gravado usando Microsoft Speech-to-Text API
    transcribe(audioPath) {
        // Carregar o arquivo de áudio em formato binário
        let file = Gio.File.new_for_path(audioPath);
        let [, audioBinary] = file.load_contents(null);

        if (!audioBinary) {
            this.app.utils.log('Falha ao carregar o arquivo de áudio.');
            return;
        }

        // Requisição à API do Microsoft Speech-to-Text
        const apiUrl = `https://${this.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${this.AZURE_SPEECH_LANGUAGE}`;

        // Headers necessários para a requisição
        const headers = [
            'Content-Type: audio/wav', // O arquivo será enviado em formato .wav
            'Ocp-Apim-Subscription-Key: ' + this.AZURE_SPEECH_KEY, // Chave de autenticação
            'Accept: application/json', // A resposta será em JSON
        ];

        // Criar um arquivo temporário para armazenar o áudio binário (opcional)
        const [success, tempFilePath] = GLib.file_open_tmp(
            'gva_azure_att_audio_XXXXXX.wav',
        );
        if (!success) {
            this.app.utils.log('Error creating temporary audio file.');
            return;
        }

        // Escrever o áudio binário no arquivo temporário
        try {
            GLib.file_set_contents(tempFilePath, audioBinary);
        } catch (e) {
            this.app.utils.log(
                'Erro ao escrever no arquivo temporário: ' + e.message,
            );
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
                let [ok, stdout, stderr] = proc.communicate_utf8_finish(res);
                if (ok && stdout) {
                    this.app.utils.log('Resposta da API: ' + stdout);
                    let response = JSON.parse(stdout);

                    if (response && response.DisplayText) {
                        let transcription = response.DisplayText;
                        this.app.utils.log('Transcrição: ' + transcription);
                        this.app.chat(transcription);
                    } else {
                        this.app.utils.log('Nenhuma transcrição encontrada.');
                        this.app.chat('Transcribe error.');
                    }
                } else {
                    this.app.utils.log('Erro na requisição: ' + stderr);
                    this.app.chat(stderr);
                }
            } catch (e) {
                this.app.utils.log('Erro ao processar resposta: ' + e.message);
                this.app.chat(e.message);
            }
        });
    }
}
