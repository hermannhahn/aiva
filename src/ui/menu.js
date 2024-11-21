import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export class Menu {
    constructor(app) {
        this.app = app;
        this.app.log('Menu loaded.');
    }

    CreateMenu() {
        // Create app item section
        this.app.items = new PopupMenu.PopupBaseMenuItem({
            style_class: 'app-items',
            reactive: false,
            can_focus: true,
        });
    }
}
