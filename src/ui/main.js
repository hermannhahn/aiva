import St from 'gi://St';
import {Menu} from './menu.js';

export class Main {
    constructor(app) {
        this.app = app;
        this.app.log('Main loaded.');
    }

    CreateInterface() {
        // Create tray
        this.app.ui.tray = new St.BoxLayout({
            style_class: 'system-tray',
        });
        this.app.ui.icon = new St.Icon({
            style_class: 'tray-icon',
        });
    }

    CreateMenu() {
        const menu = new Menu(this.app);
        menu.add();
    }
}
