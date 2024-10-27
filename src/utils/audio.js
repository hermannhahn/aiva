import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {Utils} from './utils.js';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

// Utils
const utils = new Utils();
const log = utils.log;

export class Audio {
    constructor(app) {
        // Global variables
        this.app = app;
        /**
         * @description set/get player props
         */
        this.isPlaying = false;
        this.isRecording = false;
        this.playingPid = 0;
        this.pipeline = null;
        this.questionPath = null;
        console.log('Audio loaded');
    }

    // Play audio
    play(audiofile) {
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
            this.stop();
            this.play(audiofile);
        }
    }

    // Stop audio
    stop() {
        if (!this.isPlaying) {
            return;
        }
        this.isPlaying = false;

        // Kill player pid
        GLib.spawn_command_line_async('kill ' + this.playingPid);

        log('Stopping audio.');
    }

    // Start record
    record() {
        if (this.isRecording) {
            // Stop recording
            this.stopRecord();
        }

        this.isRecording = true;

        // Definir o arquivo de saída no diretório da extensão
        this.questionPath = 'gva_temp_audio_XXXXXX.wav';

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
                `location=${this.questionPath}`,
            ],
            flags:
                Gio.SubprocessFlags.STDOUT_PIPE |
                Gio.SubprocessFlags.STDERR_PIPE,
        });

        this.pipeline.init(null);
    }

    // Stop record
    stopRecord() {
        if (!this.isRecording) {
            return;
        }

        this.pipeline.force_exit();

        // Transcribe audio
        this.app.azure.transcribe(this.questionPath);

        // Stop recording
        this.isRecording = false;
    }

    // Função para converter arquivo de áudio em base64
    encodeFileToBase64(filePath) {
        try {
            const file = Gio.File.new_for_path(filePath);
            const [, contents] = file.load_contents(null);
            return GLib.base64_encode(contents);
        } catch (error) {
            log('Erro ao ler o arquivo: ' + error);
            return null;
        }
    }
}
