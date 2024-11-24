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
        this._connect();
    }

    hide() {
        this.menu.remove_child(this.container);
        this.isOpen = false;
    }

    /**
     * @description actions
     */
    _connect() {
        // If press appearance button
        this.menu.appearanceButton.connect('clicked', (_self) => {
            if (this.isOpen) {
                this.appearanceMenu.remove_child(this.appearanceBox);
                this.isOpen = false;
                return;
            }
            this.isOpen = true;
            // get menu box parent
            // show appearance box
            this.appearanceMenu.add_child(this.appearanceBox);
            // Add transparency slider
            this.appearanceBox.add_child(this.transparencyLabel);
            this.appearanceBox.add_child(this.transparencyEntry);
            this.appearanceBox.add_child(this.transparencyButton);
            // Add appearance buttons to appearance box
            this.appearanceBox.add_child(this.colorsLabel);
            this.appearanceBox.add_child(this.colorBlackButton);
            this.appearanceBox.add_child(this.colorBlueButton);
            this.appearanceBox.add_child(this.colorRedButton);
            this.appearanceBox.add_child(this.colorGreenButton);
            this.appearanceBox.add_child(this.colorYellowButton);
            this.appearanceBox.add_child(this.colorPurpleButton);

            this.transparencyButton.connect('clicked', (_self) => {
                const transparency = this.transparencyEntry.clutter_text.text;
                if (transparency === '' || isNaN(parseInt(transparency))) {
                    return;
                }
                this.setTheme(transparency, this.app.userSettings.COLOR);
            });

            // Connect color buttons
            this.colorBlueButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '0, 0, 100');
            });
            this.colorRedButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '100, 0, 0');
            });
            this.colorGreenButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '0, 100, 0');
            });
            this.colorYellowButton.connect('clicked', () => {
                this.setTheme(
                    this.app.userSettings.TRANSPARENCY,
                    '100, 100, 0',
                );
            });
            this.colorPurpleButton.connect('clicked', () => {
                this.setTheme(
                    this.app.userSettings.TRANSPARENCY,
                    '100, 0, 100',
                );
            });
            this.colorBlackButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '54, 54, 54');
            });
        });
    }
}
