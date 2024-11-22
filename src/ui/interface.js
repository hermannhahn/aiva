import St from 'gi://St';

import * as PopupMenu from 'gi://PopupMenu';

/**
 * @description app user interface
 * @param {object} app
 */
export class Interface {
    constructor(app) {
        this.app = app;
        this._create();
        return this;
    }

    _create() {
        // Create tray
        this.tray = new St.BoxLayout({
            style_class: 'system-tray',
        });
        // Create icon
        this.icon = new St.Icon({
            style_class: 'tray-icon',
        });

        // Create interface
        this.interface = new PopupMenu.PopupBaseMenuItem({
            style_class: 'app-interface',
            reactive: false,
            can_focus: true,
        });
    }

    add() {
        this.interface.style_class = 'app';
        this.interface.box.style_class = 'app-box';
        this.tray.add_child(this.icon);
        this.app.add_child(this.tray);
    }
}
