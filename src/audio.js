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
        this.spamProtection = false;
        this.limitTimeout = null;
        this.spamProtectionTimeout = null;
        this.app.log('Audio loaded.');
    }

    /**
     * @description play audio file
     * @param {string} path
     */
    play(path) {
        if (!this.isPlaying) {
            this.speechStatusBar = this.app.ui.addStatusIcon('🔊');

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
            // get process status
            process.wait_for_child(this.stop);
        } else {
            this.app.log('Audio already playing.');
            this.stop();
        }
    }

    /**
     * @description stop playing
     */
    stop() {
        this.app.ui.removeStatusIcon(this.speechStatusBar);
        this.app.log('Stopping audio...');
        if (!this.isPlaying) {
            this.app.log('Audio not playing.');
            return;
        }
        this.isPlaying = false;

        // Kill player pid
        let result = GLib.spawn_command_line_async('kill ' + this.playingPid);
        // if success
        if (result.returncode === 0) {
            this.app.log('Audio stopped successfully.');
        } else {
            this.app.log('Error stopping audio. PID: ' + this.playingPid);
        }
    }

    /**
     * @description start recording
     */
    record() {
        // spam protection
        if (this.spamProtection === true) {
            this.spamBlock();
            return;
        }

        // Stop recording if recording
        if (this.isRecording) {
            this.stopRecord();
            this.app.log('Recording stopped.');
            return;
        }

        // enable spam protection
        this.spamProtection = true;
        // enable limit recording time
        this.limitProtection = true;

        // limit protection
        if (this.limitProtection) {
            this.recodingTimeout();
        }

        // Start recording
        this.app.log('Recording...');
        this.isRecording = true;
        this.recordStatusBar = this.app.ui.addStatusIcon('🎤');

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
        this.app.log('Recording started successfully.');
    }

    /**
     * @param {boolean} [tts=true]
     * @description stop recording and transcribe
     */
    stopRecord(tts = true) {
        if (!this.isRecording) {
            this.app.log('Recording already stopped.');
            return;
        }
        this.isRecording = false;
        this.app.ui.removeStatusIcon(this.recordStatusBar);
        this.app.log('Stopping recording...');

        // Stop recording
        this.pipeline.force_exit();
        this.app.log('Recording stopped successfully.');

        // Transcribe audio
        if (tts) {
            this.app.azure.transcribe(this.questionPath);
        }
    }

    spamBlock() {
        // clear timeout
        if (this.spamProtectionTimeout !== null) {
            GLib.Source.remove(this.spamProtectionTimeout);
            this.spamProtectionTimeout = null;
        }
        // set timeout to disable spam protection
        this.app.log('Spam protection enabled.');
        this.spamProtectionTimeout = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            3000,
            () => {
                this.spamProtection = false;
                this.app.log('Spam protection disabled.');
                return GLib.SOURCE_REMOVE;
            },
        );
    }

    recodingTimeout() {
        // clear timeout
        if (this.limitTimeout !== null) {
            GLib.Source.remove(this.limitTimeout);
            this.limitTimeout = null;
        }
        // set timeout to disable spam protection
        this.limitTimeout = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT,
            100000,
            () => {
                this.stopRecord(false);
                return GLib.SOURCE_REMOVE;
            },
        );
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
