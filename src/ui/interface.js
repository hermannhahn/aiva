import St from 'gi://St';

import * as PopupMenu from 'gi://PopupMenu';

/**
 * @description app user interface
 * @param {object} app
 */
export class Interface {
    constructor() {
        // Create tray
        this.tray = new St.BoxLayout({
            style_class: 'system-tray',
        });
        // Create icon
        this.icon = new St.Icon({
            style_class: 'tray-icon',
        });

        // Create interface
        this.box = new PopupMenu.PopupBaseMenuItem({
            style_class: 'app-interface',
            reactive: false,
            can_focus: true,
        });
        return this;
    }
}
