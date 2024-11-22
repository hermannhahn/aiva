import St from 'gi://St';

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
    }

    _show() {
        this.tray.add_child(this.icon);
        this.app.add_child(this.tray);
    }
}
