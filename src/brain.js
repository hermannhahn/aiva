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

    _isVoiceCommand(text) {
        text = text.toLowerCase();
        // Regex: please and open in same prhase
        let please = _('please');
        let activationWords = [
            _('open'),
            _('run'),
            _('execute'),
            _('start'),
            _('launch'),
            _('activate'),
            _('close'),
            _('stop'),
            _('terminate'),
            _('exit'),
        ];
        // Regex: * + ${please} + * + ${activationWords} + *
        let regex = new RegExp(
            '.*' + please + '.*' + activationWords.join('.*') + '.*',
        );

        if (regex.test(text)) {
            return true;
        }
        return false;
    }
}
