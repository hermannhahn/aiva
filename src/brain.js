import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Brain {
    constructor(app) {
        this.app = app;
    }

    proccess(question) {
        this.app.response(question);
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
        let please = _(
            'please',
        )
        let activationWords = [
            _(
                'open',
            ),
            _('run'),
            _('execute'),
            _('start'),
            _('launch'),
            _('activate'),
            _('close'),
            _('stop'),
            _('terminate'),
            _('deactivate'),
        ]
        let regexs = [/please\s+open\s+in/g;
        if (text.includes('voice')) {
            return true;
        }
        return false;
    }
}
