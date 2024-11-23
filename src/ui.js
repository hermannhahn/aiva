import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import St from 'gi://St';

import {Chat} from './chat.js';
import {Menu} from './menu.js';
import {Themes} from './themes.js';

/**
 * @description user interface
 * @param {object} app
 */
export class UI {
    constructor(app) {
        this.app = app;
        this.theme = new Themes();
        this.interface = new Interface();
        this.chat = new Chat();

        // App
        this.tray = new St.BoxLayout({
            style_class: 'system-tray',
        });
        this.icon = new St.Icon({
            style_class: 'tray-icon',
        });
    }

    /**
     * @description initialize app ui
     */
    create() {
        this.app.add_child(this.tray);
        this.tray.add_child(this.icon);
        this.app.menu.addMenuItem(this.theme.menu);
        this.app.menu.addMenuItem(this.interface.ui);
        this.chat.create(this.app.menu);
    }
}
