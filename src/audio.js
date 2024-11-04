import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Audio {
    constructor(app) {
        /**
         * set/get app props
         */
        this.app = app;

        /**
         * set/get player props
         */
        this.isPlaying = false;
        this.isRecording = false;
        this.playingPid = 0;
        this.pipeline = null;
        this.questionPath = null;
    }

    // Play audio
    play(audiofile) {
        if (!this.isPlaying) {
            this.app.log('Playing audio... ' + audiofile);
            // Process sync, not async
            const process = GLib.spawn_async(
                null, // workspace folder
                ['/bin/sh', '-c', `play ${audiofile}`], // commands and args
                null, // options
                GLib.SpawnFlags.SEARCH_PATH, // flags
                null, // PID
            );
            if (process) {
                this.playingPid = process.pid;
                this.isPlaying = true;
                this.app.log('Audio played successfully.');
            } else {
                this.app.log('Error playing audio.');
            }
        } else {
            this.app.log('Audio already playing.');
            this.stop();
            this.play(audiofile);
        }
    }

    // Stop audio
    stop() {
        if (!this.isPlaying) {
            this.app.log('Audio not playing.');
            return;
        }
        this.isPlaying = false;
        this.app.log('Stopping audio...');

        // Kill player pid
        GLib.spawn_command_line_async('kill ' + this.playingPid);
        this.app.log(
            'Audio stopped successfully. [PID: ' + this.playingPid + ']',
        );
    }

    // Start record
    record() {
        if (this.isRecording) {
            // Stop recording
            this.stopRecord();
            this.app.log('Recording stopped.');
            return;
        }
        this.isRecording = true;
        this.app.log('Recording...');

        // Create temporary file for audio recording
        this.questionPath = 'gva_temp_audio_XXXXXX.wav';

        // Pipeline GStreamer
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
            this.app.log('Recording not started.');
            return;
        }
        this.isRecording = false;
        this.app.log('Stopping recording...');

        // Stop recording
        this.pipeline.force_exit();
        this.app.log('Recording stopped successfully.');

        // Transcribe audio
        this.app.azure.transcribe(this.questionPath);
    }

    // Convert audio
    encodeFileToBase64(filePath) {
        try {
            const file = Gio.File.new_for_path(filePath);
            const [, contents] = file.load_contents(null);
            return GLib.base64_encode(contents);
        } catch (error) {
            this.app.log('Erro ao ler o arquivo: ' + error);
            return null;
        }
    }
}
