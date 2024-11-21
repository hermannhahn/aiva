import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export class Menu {
    constructor() {
        this.menu = new PopupMenu.PopupBaseMenuItem({
            style_class: 'app-items',
            reactive: false,
            can_focus: true,
        });
        return this.menu;
    }
}
