import St from 'gi://St';

import {Chat} from './chat.js';
import {Menu} from './menu.js';
import {Themes} from './themes.js';

/**
 * @description app user interface
 */
export class Interface {
    constructor() {
        this.menu = new Menu();
        this.chat = new Chat();
        this.theme = new Themes();

        // Create tray
        this.box = new St.BoxLayout({
            style_class: 'system-tray',
        });
        // Create icon
        this.icon = new St.Icon({
            style_class: 'tray-icon',
        });

        return this;
    }

    create() {
        this.box.add_child(this.icon);
        this.box.add_child(this.menu.box);
    }
}
