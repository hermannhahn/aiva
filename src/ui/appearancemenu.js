import * as St from 'gi://St';
import * as PopupMenu from 'gi://PopupMenu';

/**
 * @description appearance menu
 */
export class AppearanceMenu {
    constructor() {
        this.container = new PopupMenu.PopupBaseMenuItem({
            style_class: 'theme-bar',
            reactive: false,
            can_focus: true,
        });

        // Create transparency slider
        this.transparencyEntry = new St.Entry({
            style_class: 'transparency-entry',
            can_focus: true,
        });
        this.transparencyEntry.clutter_text.set_text(
            this.app.userSettings.TRANSPARENCY,
        );

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
    }

    show() {
        this.isOpen = true;
        this.container.add_child(this.transparencyLabel);
        this.container.add_child(this.transparencyEntry);
        this.container.add_child(this.transparencyButton);
        this.container.add_child(this.colorsLabel);
        this.container.add_child(this.colorBlackButton);
        this.container.add_child(this.colorBlueButton);
        this.container.add_child(this.colorRedButton);
        this.container.add_child(this.colorGreenButton);
        this.container.add_child(this.colorYellowButton);
        this.container.add_child(this.colorPurpleButton);
    }

    hide() {
        this.isOpen = false;
        this.menu.remove_child(this.container);
    }
}
