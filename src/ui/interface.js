import St from 'gi://St';

/**
 * @description user interface
 */
export class Interface {
    constructor() {
        // Create tray
        this.tray = new St.BoxLayout({
            style_class: 'tray',
        });
        this.icon = new St.Icon({
            style_class: 'tray-icon',
        });
    }
}
