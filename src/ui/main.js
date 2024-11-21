import St from 'gi://St';

export class Main {
    constructor() {
        // Create tray
        const tray = new St.BoxLayout({
            style_class: 'system-tray',
        });
        // Create icon
        const icon = new St.Icon({
            style_class: 'tray-icon',
        });
        // Return tray and icon
        return {tray, icon};
    }
}
