import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import {Interface} from './ui/interface.js';
import {Menu} from './ui/menu.js';
import {Themes} from './ui/themes.js';
import {Chat} from './ui/chat.js';

/**
 * @description app user interface
 * @param {object} app
 */
export class UI {
    constructor(app) {
        this.app = app;
        this.interface = new Interface(this.app);
        this.menu = new Menu(this.interface);
        this.themes = new Themes(this.menu);
        this.chat = new Chat();
    }

    /**
     * @description initialize interfaces
     */
    init() {
        this.app.log('Initializing UI...');
        this.interface.add();
        this.themes.add();
        this.menu.add();

        this.setTheme(
            this.app.userSettings.TRANSPARENCY,
            this.app.userSettings.COLOR,
        );

        this.app.log('UI initialized.');
    }

    /**
     * @description items actions
     */
    _itemsActions() {
        // If press appearance button
        this.appearanceBoxIsOpen = false;
        this.appearanceButton.connect('clicked', (_self) => {
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

    /**
     * @description create chat item
     * @returns {object} chat item
     */
    chat() {
        // Question
        let chat = new PopupMenu.PopupMenuItem('', {
            style_class: 'input-chat',
            can_focus: false,
        });
        let scolor = chat.label.clutter_text.get_selected_text_color();
        this.app.log('Selection Color ' + scolor);
        console.log('Selection Color ' + scolor);
        chat.label.clutter_text.reactive = true;
        chat.label.clutter_text.selectable = true;
        chat.label.clutter_text.hover = true;
        return chat;
    }

    /**
     * @description create question item
     * @returns {object} question item
     */
    question() {
        this.setTheme(
            this.app.userSettings.TRANSPARENCY,
            this.app.userSettings.COLOR,
        );
        // Question
        let inputChat = new PopupMenu.PopupMenuItem('', {
            style_class: 'input-chat',
            can_focus: false,
        });
        inputChat.label.clutter_text.reactive = true;
        inputChat.label.clutter_text.selectable = true;
        inputChat.label.clutter_text.hover = true;
        this.inputChat = inputChat;
        return inputChat;
    }

    /**
     * @description create response item
     * @returns {object} response item
     */
    response() {
        // Response
        let responseChat = new PopupMenu.PopupMenuItem('', {
            style_class: 'response-chat',
            can_focus: false,
        });
        responseChat.label.clutter_text.reactive = true;
        responseChat.label.clutter_text.selectable = true;
        responseChat.label.clutter_text.hover = true;
        responseChat.label.clutter_text.justify = true;
        this.responseChat = responseChat;
        return responseChat;
    }

    /**
     * @description create copy button item
     * @returns {object} copy button item
     */
    copy() {
        // Copy Button
        let copyButton = new PopupMenu.PopupMenuItem('', {
            style_class: 'copy-icon',
            can_focus: false,
        });
        copyButton.label.clutter_text.reactive = true;
        copyButton.label.clutter_text.selectable = true;
        copyButton.label.clutter_text.hover = true;
        this.copyButton = copyButton;
        return copyButton;
    }

    statusIcon(icon) {
        this.statusBar.label = icon;
        return true;
    }

    resetStatusIcon() {
        this.statusBar.label = '🤖';
        return true;
    }

    setTheme(transparency, color) {
        // set default if empty, null or undefined
        if (
            transparency === '' ||
            transparency === null ||
            transparency === undefined
        ) {
            transparency = '75';
        }
        if (color === '' || color === null || color === undefined) {
            color = '54, 54, 54';
        }
        // set transparencyEntry text
        this.transparencyEntry.clutter_text.set_text(transparency);

        // save
        const tString = transparency.toString();
        this.app.extension.settings.set_string('theme-transparency', tString);
        this.app.userSettings.TRANSPARENCY = tString;
        this.app.extension.settings.set_string('theme-color', color);
        this.app.userSettings.COLOR = color;
        // set theme
        transparency = 100 - transparency;
        transparency = parseInt(transparency) / 100;
        this.menu.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
        this.scrollView.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
        if (transparency < 0.8) {
            transparency += 0.2;
        }
        // make color more darkness
        const darkColors = this.app.utils.darkColors(color);
        this.searchEntry.set_style(
            `background-color: rgba(${darkColors}, ${transparency});`,
        );
    }
}
