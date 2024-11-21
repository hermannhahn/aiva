import St from 'gi://St';
import {Menu} from './menu.js';

export class Main {
    constructor(app) {
        this.app = app;
        this.app.log('Main loaded.');
    }

    CreateInterface() {
        // Create tray
        const tray = new St.BoxLayout({
            style_class: 'system-tray',
        });
        const icon = new St.Icon({
            style_class: 'tray-icon',
        });
        return {tray, icon};
    }

    CreateMenu() {
        const menu = new Menu();
        return menu.add();
    }
}
