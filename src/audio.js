import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description audio player and recorder
 * @param {object} app
 * @example
 * instance:
 * const audio = new Audio(app);
 *
 * public function
 * record() - start recording
 * stopRecord() - stop recording and start transcription
 * play(path) - play audio path
 * stop() - stop playing
 * encodeFileToBase64() - encode file to base64
 */
export class Audio {
    constructor(app) {
        this.app = app;
        this.isPlaying = false;
        this.isRecording = false;
        this.playingPid = 0;
        this.pipeline = null;
        this.questionPath = null;
    }

    /**
     * @description play audio file
     * @param {string} path
     */
    play(path) {
        if (!this.isPlaying) {
            this.app.log('Playing audio... ' + path);
            // Process sync, not async
            const process = GLib.spawn_async(
                null, // workspace folder
                ['/bin/sh', '-c', `play ${path}`], // commands and args
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
            this.play(path);
        }
    }

    /**
     * @description stop playing
     */
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

    /**
     * @description start recording
     */
    record() {
        if (this.isRecording) {
            // Stop recording
            this.stopRecord();
            this.app.log('Recording stopped.');
            return;
        }

        // afk protection
        clearTimeout(this.afkProtectionTimeout);
        this.afkProtectionTimeout = null;
        this.afkProtectionTimeout = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            100000,
            () => {
                this.stopRecord();
            },
        );

        if (this.app.spamProtection === true) {
            this.app.log('Spam protection activated.');
            // clear timeout
            clearTimeout(this.app.spamProtectionTimeout);
            this.app.spamProtectionTimeout = null;
            // set timeout to disable spam protection
            this.app.spamProtectionTimeout = GLib.timeout_add(
                GLib.PRIORITY_DEFAULT,
                3000,
                () => {
                    this.app.spamProtection = false;
                },
            );
            return;
        }

        this.isRecording = true;
        this.app.spamProtection = true;
        this.app.log('Recording...');

        clearTimeout(this.app.spamProtectionTimeout);
        this.app.spamProtectionTimeout = null;
        // set timeout to disable spam protection
        this.app.spamProtectionTimeout = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            3000,
            () => {
                this.app.spamProtection = false;
            },
        );

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

    /**
     * @description stop recording and transcribe
     */
    stopRecord() {
        clearTimeout(this.afkProtectionTimeout);
        if (!this.isRecording) {
            this.app.log('Recording already stopped.');
            return;
        }
        this.isRecording = false;
        this.app.log('Stopping recording...');

        // Stop recording
        this.pipeline.force_exit();
        this.app.log('Recording stopped successfully.');

        // Transcribe audio
        this.app.chat.addQuestion(_('Transcribing...'));
        this.app.azure.transcribe(this.questionPath);
    }

    /**
     * @description encode file to base64
     * @param {string} path
     * @returns
     */
    encodeFileToBase64(path) {
        try {
            const file = Gio.File.new_for_path(path);
            const [, contents] = file.load_contents(null);
            return GLib.base64_encode(contents);
        } catch (error) {
            this.app.log('Erro ao ler o arquivo: ' + error);
            return null;
        }
    }
}
