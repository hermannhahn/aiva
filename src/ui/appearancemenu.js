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
        this.container = new PopupMenu.PopupBaseMenuItem({
            style_class: 'appearence-bar',
            reactive: false,
            can_focus: true,
        });
        this.container.set_style(
            `background-color: rgba(${this.app.userSettings.COLOR}, 0);`,
        );

        this.box = new St.BoxLayout({
            style_class: 'appearence-box',
        });

        // Create transparency slider
        this.transparencyEntry = new St.Entry({
            style_class: 'transparency-entry',
            can_focus: true,
        });

        // Create transparency label
        this.transparencyLabel = new St.Label({
            text: 'Transparency: ',
            style_class: 'transparency-label',
        });

        // Create transparency ok button
        this.transparencyButton = new St.Button({
            label: 'OK',
            style_class: 'transparency-ok-icon',
            toggle_mode: true,
            can_focus: true,
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
        this.box.add_child(this.transparencyLabel);
        this.box.add_child(this.transparencyEntry);
        this.box.add_child(this.transparencyButton);
        this.box.add_child(this.colorsLabel);
        this.box.add_child(this.colorBlackButton);
        this.box.add_child(this.colorBlueButton);
        this.box.add_child(this.colorRedButton);
        this.box.add_child(this.colorGreenButton);
        this.box.add_child(this.colorYellowButton);
        this.box.add_child(this.colorPurpleButton);
    }
}
