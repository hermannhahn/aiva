import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import St from 'gi://St';

import {Interface} from './interface.js';

/**
 * @description user interface
 * @param {object} app
 */
export class UI {
    constructor(app) {
        // App
        this.app = app;
        this.app.menu.style_class = 'app';
        this.app.menu.box.style_class = 'app-box';

        // Tray
        this.tray = new St.BoxLayout({
            style_class: 'app-menu',
        });
        this.icon = new St.Icon({
            style_class: 'tray-icon',
        });

        // Interface
        this.interface = new Interface();
    }

    /**
     * @description initialize app ui
     */
    create() {
        this.app.add_child(this.tray);
        this.tray.add_child(this.icon);
        this.app.menu.addMenuItem(this.interface.theme.menu);
        this.app.menu.addMenuItem(this.interface.menu);
        this.interface.create();
    }
}
