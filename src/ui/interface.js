import St from 'gi://St';

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
        // Return tray and icon
        return {tray: this.tray, icon: this.icon};
    }
}
