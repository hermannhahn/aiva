import St from 'gi://St';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

/**
 * @description appearance menu
 */
export class AppearanceMenu {
    constructor() {
        this._create();
    }

    _create() {
        // Create container
        this.container = new PopupMenu.PopupBaseMenuItem({
            style_class: 'appearance-container',
        });

        // menu
        this.menu = new St.BoxLayout({
            style_class: 'appearance-menu',
            reactive: false,
            can_focus: true,
        });

        // Create transparency label
        this.transparencyLabel = new St.Label({
            text: 'Transparency: ',
            style_class: 'transparency-label',
        });

        // Create transparency entry
        this.transparencyEntry = new St.Entry({
            style_class: 'transparency-entry',
            can_focus: true,
            reactive: true,
            hover: true,
        });

        // Create colors label
        this.colorsLabel = new St.Label({
            text: 'Color: ',
            style_class: 'colors-label',
        });

        // Create color blue button
        this.colorBlueButton = new St.Button({
            label: '🟦',
            style_class: 'colors-icon',
            toggle_mode: true,
            can_focus: true,
        });

        // Create color red button
        this.colorRedButton = new St.Button({
            label: '🟥',
            style_class: 'colors-icon',
            toggle_mode: true,
            can_focus: true,
        });

        // Create color green button
        this.colorGreenButton = new St.Button({
            label: '🟩',
            style_class: 'colors-icon',
            toggle_mode: true,
            can_focus: true,
        });

        // Create color yellow button
        this.colorYellowButton = new St.Button({
            label: '🟨',
            style_class: 'colors-icon',
            toggle_mode: true,
            can_focus: true,
        });

        // Create color purple button
        this.colorPurpleButton = new St.Button({
            label: '🟪',
            style_class: 'colors-icon',
            toggle_mode: true,
            can_focus: true,
        });

        // Create color black button
        this.colorBlackButton = new St.Button({
            label: '⬛',
            style_class: 'colors-icon',
            toggle_mode: true,
            can_focus: true,
        });

        this._add();
    }

    _add() {
        this.menu.add_child(this.transparencyLabel);
        this.menu.add_child(this.transparencyEntry);
        this.menu.add_child(this.colorsLabel);
        this.menu.add_child(this.colorBlueButton);
        this.menu.add_child(this.colorRedButton);
        this.menu.add_child(this.colorGreenButton);
        this.menu.add_child(this.colorYellowButton);
        this.menu.add_child(this.colorPurpleButton);
        this.menu.add_child(this.colorBlackButton);
    }
}
