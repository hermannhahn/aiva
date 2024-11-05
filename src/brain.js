import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import {Open} from './actions/open.js';
import {Close} from './actions/close.js';

export class Brain {
    constructor(app) {
        this.app = app;
        this.open = new Open(this.app);
        this.close = new Close(this.app);
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
        let activationWords = [
            _('computer'),
            'aiva',
            this.app.userSettings.ASSIST_NAME,
        ];

        // Check if the first three words includes "computer"
        const words = text.split(/\s+/).slice(0, 3);
        for (const word of words) {
            if (activationWords.includes(word)) {
                return true;
            }
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

    _voiceCommandInterpreter(text) {
        text = text.toLowerCase();
        const maxWords = 10;
        const openAppWords = [
            _('open'),
            'abre',
            'abra',
            _('start'),
            'inicie',
            'inicia',
            _('launch'),
            _('run'),
            'rode',
            'roda',
            _('execute'),
            'execute',
            'executa',
        ];
        const closeAppWords = [
            _('close'),
            'feche',
            'fecha',
            _('terminate'),
            'termine',
            'termina',
            'encerra',
            'encerre',
            _('exit'),
            'saie',
            'saia',
            _('kill'),
            'mate',
            'mata',
        ];
        // Dividir o texto em palavras e pegar as primeiras 'maxWords'
        const words = text.split(/\s+/).slice(0, maxWords);
        for (const word of words) {
            if (openAppWords.includes(word)) {
                this.open.app(text);
            } else if (closeAppWords.includes(word)) {
                this.close.app(text);
            } else {
                this.app.log('Command not found');
            }
        }
    }
}
