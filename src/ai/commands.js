import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Commands {
    constructor(app) {
        this.app = app;
        this.app.log('Commands loaded.');
    }

    slash(text) {
        if (text.startsWith('/help')) {
            this._help();
            return;
        }

        if (text.startsWith('/settings')) {
            this.app.openSettings();
            return;
        }

        // else
        this.app.chat.editResponse(_('Invalid command'));
    }

    _help() {
        this.app.chat.editResponse(
            '\n' +
                _('HELP') +
                '\n\n' +
                _('Commands') +
                ':' +
                '\n' +
                '/settings' +
                ' - ' +
                _('Open settings') +
                '\n' +
                '/help    ' +
                ' - ' +
                _('Show this help') +
                '\n',
        );
    }
}
