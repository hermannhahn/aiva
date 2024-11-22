import St from 'gi://St';

import * as PopupMenu from 'gi://PopupMenu';

/**
 * @description app user interface
 * @param {object} app
 */
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

        // Create interface
        this.interface = new PopupMenu.PopupBaseMenuItem({
            style_class: 'app-interface',
            reactive: false,
            can_focus: true,
        });
    }

    add() {
        this.interface.style_class = 'app';
        this.interface.box.style_class = 'app-box';
        this.tray.add_child(this.icon);
        this.app.add_child(this.tray);
    }

    /**
     * @description actions
     */
    connect() {
        // If press enter on question input box
        this.menu.userEntry.clutter_text.connect('activate', (actor) => {
            const question = actor.text;
            this.menu.userEntry.clutter_text.set_text('');
            this.menu.userEntry.clutter_text.reactive = false;
            this.app.chat.addQuestion(question);
            this.app.interpreter.proccess(question);
        });

        // If press mic button
        this.menu.micButton.connect('clicked', (_self) => {
            this.app.audio.record();
        });

        // If press clear button
        this.menu.clearButton.connect('clicked', (_self) => {
            this.menu.userEntry.clutter_text.set_text('');
            this.app.chat.history = [];
            this.interface.box.remove_child(this.scrollView);
            this.chat.chatSection = new PopupMenu.PopupMenuSection();
            this.chat.scrollView.add_child(this.chatSection.actor);
            this.app.interface.box.add_child(this.scrollView);
        });

        // If press settings button
        this.menu.settingsButton.connect('clicked', (_self) => {
            this.app.openSettings();
            // Close App
            if (this.appearanceBoxIsOpen) {
                this.appearanceMenu.remove_child(this.appearanceBox);
                this.appearanceBoxIsOpen = false;
            }
            this.app.interface.close();
        });

        // If press appearance button
        this.appearanceBoxIsOpen = false;
        this.menu.appearanceButton.connect('clicked', (_self) => {
            if (this.appearanceBoxIsOpen) {
                this.appearanceMenu.remove_child(this.appearanceBox);
                this.appearanceBoxIsOpen = false;
                return;
            }
            this.appearanceBoxIsOpen = true;
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
