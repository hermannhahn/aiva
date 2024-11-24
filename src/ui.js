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
    init() {
        // Initialize
        this._createApp();
        this._addItems();
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
        // Add items container to app
        this.container.addMenuItem(this.appearancemenu.container);
        this.container.addMenuItem(this.mainmenu.container);

        // Add items
        this.mainbar.add_child(this.character);
        this.mainbar.add_child(this.userEntry);
        this.mainbar.add_child(this.enterButton);
        this.mainbar.add_child(this.micButton);
        this.mainbar.add_child(this.clearButton);
        this.mainbar.add_child(this.settingsButton);
        this.mainbar.add_child(this.appearanceButton);

        // Add scrollview
        this.container.box.add_child(this.chat.container);

        // Add chat to scrollbar
        this.chat.container.add_child(this.chat.box.actor);

        // Apply userSettings appearance
        this.setTheme(
            this.app.userSettings.TRANSPARENCY,
            this.app.userSettings.COLOR,
        );
        this.scrollView.set_style(`background-color: rgba(42, 42, 42, 0);`);
    }

    /**
     * @description items actions
     */
    _itemsActions() {
        // If press enter on question input box
        this.userEntry.clutter_text.connect('activate', (actor) => {
            const question = actor.text;
            this.userEntry.clutter_text.set_text('');
            this.userEntry.clutter_text.reactive = false;
            this.app.chat.addQuestion(question);
            this.app.interpreter.proccess(question);
        });

        // If press mic button
        this.micButton.connect('clicked', (_self) => {
            this.app.audio.record();
        });

        // If press clear button
        this.clearButton.connect('clicked', (_self) => {
            this.userEntry.clutter_text.set_text('');
            this.app.chat.history = [];
            this.container.box.remove_child(this.scrollView);
            this.chatSection = new PopupMenu.PopupMenuSection();
            this.scrollView.add_child(this.chatSection.actor);
            this.container.box.add_child(this.scrollView);
        });

        // If press settings button
        this.settingsButton.connect('clicked', (_self) => {
            this.app.openSettings();
            // Close App
            if (this.appearanceBoxIsOpen) {
                this.appearanceMenu.remove_child(this.appearanceBox);
                this.appearanceBoxIsOpen = false;
            }
            this.container.close();
        });

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
        this.character.label = icon;
        return true;
    }

    resetStatusIcon() {
        this.character.label = '🤖';
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
        this.mainbar.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
        this.scrollView.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
        if (transparency < 0.8) {
            transparency += 0.2;
        }
        this.userEntry.set_style(
            `background-color: rgba(${color}, ${transparency});`,
        );
    }
}
