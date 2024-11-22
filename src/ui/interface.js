import St from 'gi://St';

export class Interface {
    constructor() {
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
}
