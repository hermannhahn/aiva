import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export class Menu {
    add() {
        // Create app item section
        const item = new PopupMenu.PopupBaseMenuItem({
            style_class: 'app-items',
            reactive: false,
            can_focus: true,
        });
        return item;
    }
}
