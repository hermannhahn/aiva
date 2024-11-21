import St from 'gi://St';

export class Main {
    constructor(app) {
        this.app = app;
        this.app.log('Main loaded.');
    }

    CreateTray() {
        // Create tray
        this.app.ui.tray = new St.BoxLayout({
            style_class: 'system-tray',
        });
        this.app.ui.icon = new St.Icon({
            style_class: 'tray-icon',
        });
    }
}
