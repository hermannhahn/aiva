import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Brain {
    constructor(app) {
        this.app = app;
        this.app.log('Brain loaded.');
    }

    proccess(question) {
        if (this._isCommand(question)) {
            this._commandInterpreter(question);
            this.app.ui.searchEntry.clutter_text.reactive = true;
        } else if (this._isVoiceCommand(question)) {
            this._voiceCommandInterpreter(question);
            this.app.ui.searchEntry.clutter_text.reactive = true;
        } else {
            this.app.gemini.response(question);
        }
    }

    _isCommand(text) {
        if (text.startsWith('/')) {
            return true;
        }
        return false;
    }

    _isVoiceCommand(text) {
        text = text.toLowerCase();
        if (text.startsWith(_('computer'))) {
            return true;
        }
        return false;
    }

    _commandInterpreter(text) {
        if (text.startsWith('/')) {
            if (text.startsWith('/help')) {
                this.app.chat.add(`
HELP

/settings   - Open settings
/help       - Show this help
                `);
            }

            if (text.startsWith('/settings')) {
                this.app.openSettings();
            }
        }
    }

    _activationWord(text) {
        const maxWords = 10;
        const activationWords = [
            _('open'),
            _('start'),
            _('launch'),
            _('activate'),
            _('close'),
            _('stop'),
            _('terminate'),
            _('exit'),
            _('run'),
            _('execute'),
            _('play'),
            _('watch'),
            _('search'),
            _('find'),
            _('read'),
        ];
        // Dividir o texto em palavras e pegar as primeiras 'maxWords'
        const words = text.split(/\s+/).slice(0, maxWords);
        const getActivationWord = () => {
            for (const word of words) {
                if (activationWords.includes(word)) {
                    return word;
                }
            }
            return false;
        };
        return getActivationWord();
    }

    _getSoftwareName(text) {
        // Get software name
        const softwareOptions = [
            _('google'),
            _('chrome'),
            _('firefox'),
            _('vscode'),
            _('code editor'),
            _('youtube'),
            _('gmail'),
            _('outlook'),
            _('maps'),
            _('calculator'),
            _('calendar'),
            _('notepad'),
            _('snap store'),
            _('extensions manager'),
            _('settings'),
            _('emulator'),
            _('terminal'),
        ];

        // Check if software name is in softwareOptions
        const maxWords = 10;
        const words = text.split(/\s+/).slice(0, maxWords);
        const softwareName = words.find((word) =>
            softwareOptions.includes(word),
        );
        return softwareName;
    }

    _runSoftware(software) {
        switch (software) {
            case 'google':
                this.app.utils.executeCommand('google-chrome');
                break;
            case 'chrome':
                this.app.utils.executeCommand('google-chrome');
                break;
            case 'firefox':
                this.app.utils.executeCommand('firefox');
                break;
            case 'youtube':
                this.app.utils.executeCommand('firefox youtube.com');
                break;
            case 'vscode':
                this.app.utils.executeCommand('code');
                break;
            case 'code editor':
                this.app.utils.executeCommand('code');
                break;
            case 'gmail':
                this.app.utils.executeCommand('google-chrome gmail.com');
                break;
            case 'outlook':
                this.app.utils.executeCommand('google-chrome outlook.com');
                break;
            case 'maps':
                this.app.utils.executeCommand('google-chrome maps.google.com');
                break;
            case 'calculator':
                this.app.utils.executeCommand('google-chrome calculator.com');
                break;
            case 'calendar':
                this.app.utils.executeCommand(
                    'google-chrome calendar.google.com',
                );
                break;
            case 'notepad':
                this.app.utils.executeCommand('google-chrome notepad.com');
                break;
            case 'snap store':
                this.app.utils.executeCommand('google-chrome snap.shop');
                break;
            case 'extensions manager':
                this.app.utils.executeCommand(
                    'google-chrome extensions.gnome.org',
                );
                break;
            case 'settings':
                this.app.openSettings();
                break;
            case 'emulator':
                this.app.utils.executeCommand(
                    'google-chrome emulator.google.com',
                );
                break;
            case 'terminal':
                this.app.utils.executeCommand('gnome-terminal');
                break;
            default:
                this.app.log('Software not found');
                break;
        }
    }

    _voiceCommandInterpreter(text) {
        text = text.toLowerCase();
        const activationWordInText = this._activationWord(text);
        if (activationWordInText) {
            // If command is open
            if (
                activationWordInText === _('open') ||
                activationWordInText === _('start') ||
                activationWordInText === _('launch') ||
                activationWordInText === _('run')
            ) {
                const softwareName = this._getSoftwareName(text);

                if (softwareName) {
                    this._runSoftware(softwareName);
                } else {
                    this.app.log('Software not found');
                }
            }
        }
    }
}
