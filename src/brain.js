import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Brain {
    constructor(app) {
        this.app = app;
    }

    proccess(question) {
        // this.app.response(question);
        if (this._isCommand(question)) {
            this.app.log('is command: ' + question);
            // this.executeCommand(question)
        } else if (this._isVoiceCommand(question)) {
            this.app.log('is voice command: ' + question);
        }
    }

    _isCommand(text) {
        if (text.startsWith('/')) {
            return true;
        }
        return false;
    }

    _isVoiceCommand(
        text,
        maxWords = 10,
        triggerWord = _('computer'),
        activationWords = [
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

            // 'open',
            // 'run',
            // 'execute',
            // 'start',
            // 'launch',
            // 'activate',
            // 'close',
            // 'stop',
            // 'terminate',
            // 'exit',
        ],
    ) {
        // Converter para minúsculas apenas uma vez
        text = text.toLowerCase();

        // Dividir o texto em palavras e pegar as primeiras 'maxWords'
        const words = text.split(/\s+/).slice(0, maxWords);
        const activationWordInText = words.some((word) =>
            activationWords.includes(word),
        );
        this.app.log(
            'activationWordInText: ' +
                activationWordInText +
                ' words: ' +
                words,
        );

        // Verificar se 'triggerWord' e pelo menos uma 'activationWord' estão presentes
        return (
            words.includes(triggerWord) &&
            words.some((word) => activationWords.includes(word))
        );
    }
}
