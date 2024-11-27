import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import {AppearanceMenu} from './ui/appearancemenu.js';
import {Chat} from './ui/chat.js';
import {Interface} from './ui/interface.js';
import {MainMenu} from './ui/mainmenu.js';

/**
 * @description app user interface
 * @param {object} app
 */
export class UI {
    constructor(app) {
        this.app = app;
        this.container = this.app.menu;
        this.interface = new Interface();
        this.mainmenu = new MainMenu();
        this.appearancemenu = new AppearanceMenu();
        this.chat = new Chat();
    }

    /**
     * @description initialize interfaces
     */
    create() {
        // Initialize
        this._createApp();
        this._addItems();
        this.setTheme();
        this._itemsActions();
    }

    /**
     * @description create app
     */
    _createApp() {
        this.interface.tray.add_child(this.interface.icon);
        this.app.add_child(this.interface.tray);
    }

    /**
     * @description add items to app
     */
    _addItems() {
        // add style
        this.container.style_class = 'app';
        this.container.box.style_class = 'app-box';

        // add items
        this.container.addMenuItem(this.appearancemenu.container);
        this.container.addMenuItem(this.mainmenu.container);
        this.container.box.add_child(this.chat.container);
    }

    /**
     * @description items actions
     */
    _itemsActions() {
        // If press enter on question input box
        this.mainmenu.userEntry.clutter_text.connect('activate', (actor) => {
            const question = actor.text;
            this.mainmenu.userEntry.clutter_text.set_text('');
            this.mainmenu.userEntry.clutter_text.reactive = false;
            this.app.chat.addQuestion(question);
            this.app.interpreter.proccess(question);
        });

        // If press mic button
        this.mainmenu.micButton.connect('clicked', (_self) => {
            this.app.audio.record();
        });

        // If press clear button
        this.mainmenu.clearButton.connect('clicked', (_self) => {
            this.mainmenu.userEntry.clutter_text.set_text('');
            this.app.chat.history = [];
            this.container.box.remove_child(this.chat.container);
            this.chat.box = new PopupMenu.PopupMenuSection();
            this.chat.container.add_child(this.chat.box.actor);
            this.container.box.add_child(this.chat.container);
        });

        // If press settings button
        this.appearancemenu.isOpen = false;
        this.mainmenu.settingsButton.connect('clicked', (_self) => {
            this.app.openSettings();
            // Close App
            if (this.appearancemenu.isOpen) {
                this.appearancemenu.container.remove_child(
                    this.appearancemenu.menu,
                );
                this.appearancemenu.isOpen = false;
            }
            this.container.close();
        });

        // If press appearance button
        this.mainmenu.appearanceButton.connect('clicked', (_self) => {
            // show or hide
            if (this.appearancemenu.isOpen) {
                this.appearancemenu.container.remove_child(
                    this.appearancemenu.menu,
                );
                this.appearancemenu.isOpen = false;
                return;
            }
            this.appearancemenu.transparencyEntry.clutter_text.set_text(
                this.app.userSettings.TRANSPARENCY,
            );
            this.appearancemenu.container.add_child(this.appearancemenu.menu);
            this.appearancemenu.isOpen = true;

            // theme mode switch
            this.appearancemenu.themeModeButton.connect('clicked', (_self) => {
                this._switchThemeMode();
            });

            // transparency ok button
            this.appearancemenu.transparencyButton.connect(
                'clicked',
                (_self) => {
                    const transparency =
                        this.appearancemenu.transparencyEntry.clutter_text.text;
                    if (transparency === '' || isNaN(parseInt(transparency))) {
                        return;
                    }
                    this.appearancemenu.transparencyEntry.clutter_text.set_text(
                        this.app.userSettings.TRANSPARENCY,
                    );
                    this.setTheme(transparency, this.app.userSettings.COLOR);
                },
            );

            // Connect color buttons
            this.appearancemenu.colorBlueButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '5, 5, 25');
            });
            this.appearancemenu.colorRedButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '25, 5, 5');
            });
            this.appearancemenu.colorGreenButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '5, 25, 5');
            });
            this.appearancemenu.colorYellowButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '25, 25, 5');
            });
            this.appearancemenu.colorPurpleButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '25, 5, 25');
            });
            this.appearancemenu.colorBlackButton.connect('clicked', () => {
                this.setTheme(this.app.userSettings.TRANSPARENCY, '25, 25, 25');
            });
        });
    }

    /**
     * @description status icon
     * @param {string} icon
     */
    statusIcon(icon) {
        this.mainmenu.character.label = icon;
        return true;
    }

    /**
     * @description reset status icon
     */
    resetStatusIcon() {
        this.mainmenu.character.label = '🤖';
        return true;
    }

    /**
     * @description set theme
     * @param {string} [transparency=this.app.userSettings.TRANSPARENCY]
     * @param {string} [color=this.app.userSettings.COLOR]
     * @param {string} [mode=this.app.userSettings.MODE]
     */
    setTheme(
        transparency = this.app.userSettings.TRANSPARENCY,
        color = this.app.userSettings.COLOR,
        mode = this.app.userSettings.MODE,
    ) {
        // set default if empty, null or undefined
        if (
            transparency === '' ||
            transparency === null ||
            transparency === undefined
        ) {
            transparency = '75';
        }
        if (color === '' || color === null || color === undefined) {
            color = '25, 25, 25';
        }
        if (mode === '' || mode === null || mode === undefined) {
            mode = 'dark';
        }

        // save
        this.app.extension.settings.set_string(
            'theme-transparency',
            transparency,
        );
        this.app.userSettings.TRANSPARENCY = transparency;
        this.app.extension.settings.set_string('theme-color', color);
        this.app.userSettings.COLOR = color;
        this.app.extension.settings.set_string('theme-mode', mode);
        this.app.userSettings.MODE = mode;

        // invert transparency value to css
        transparency = 100 - transparency;
        transparency = parseInt(transparency) / 100;

        switch (mode) {
            case 'dark':
                color = this.darkTheme(color, transparency);
                break;
            case 'light':
                color = this.lightTheme(color, transparency);
                break;
            default:
                break;
        }
    }

    darkTheme(color, transparency) {
        const darkColors = this.app.utils.darkColors(color);

        // appearance menu
        this.appearancemenu.menu.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
        this.appearancemenu.transparencyEntry.set_style(
            `color: rgb(200, 200, 200);`,
        );
        this.appearancemenu.transparencyEntry.set_style(
            `background-color: rgba(${darkColors}, ${transparency});`,
        );

        // main menu
        this.mainmenu.container.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
        this.mainmenu.userEntry.set_style(`color: rgb(200, 200, 200);`);
        this.mainmenu.userEntry.set_style(
            `background-color: rgba(${darkColors}, ${transparency});`,
        );

        // chat
        this.chat.container.set_style(`color: rgb(200, 200, 200);`);
        this.chat.container.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
    }

    /**
     * @description light theme
     * @param {string} color
     * @param {string} transparency
     */
    lightTheme(color, transparency) {
        const lightColors = this.app.utils.lightColors(color);
        // appearance menu
        this.appearancemenu.menu.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
        this.appearancemenu.transparencyEntry.set_style(
            `color: rgb(25, 25, 25);`,
        );
        this.appearancemenu.transparencyEntry.set_style(
            `background-color: rgba(${lightColors}, ${transparency});`,
        );

        // main menu
        this.mainmenu.container.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
        this.mainmenu.userEntry.set_style(`color: rgb(25, 25, 25);`);
        this.mainmenu.userEntry.set_style(
            `background-color: rgba(${lightColors}, ${transparency});`,
        );

        // chat
        this.chat.container.set_style(`color: rgb(25, 25, 25);`);
        this.chat.container.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
    }

    /**
     * @description switch theme mode
     */
    _switchThemeMode() {
        let theme = this.app.userSettings.MODE;
        if (theme === 'dark') {
            this.appearancemenu.themeModeButton.label = '☀️';
            theme = 'light';
        } else {
            this.appearancemenu.themeModeButton.label = '🌙';
            theme = 'dark';
        }
        this.setTheme(
            this.app.userSettings.TRANSPARENCY,
            this.app.userSettings.COLOR,
            theme,
        );
    }
}
