import St from 'gi://St';

import {Menu} from './menu.js';
import {Chat} from './chat.js';

/**
 * @description app user interface
 */
export class Interface {
    constructor() {
        this.menu = new Menu();
        this.chat = new Chat();

        // Create tray
        this.tray = new St.BoxLayout({
            style_class: 'system-tray',
        });
        // Create icon
        this.icon = new St.Icon({
            style_class: 'tray-icon',
        });

        return this;
    }

    create() {
        this.tray.add_child(this.icon);
    }
}
