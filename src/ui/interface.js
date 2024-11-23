import St from 'gi://St';

import * as PopupMenu from 'gi://PopupMenu';

import {Chat} from './chat.js';
import {Theme} from './theme.js';

/**
 * @description user interface
 */
export class Interface {
    constructor() {
        this.menu = new PopupMenu.PopupBaseMenuItem({
            style_class: 'menu',
            reactive: false,
            can_focus: true,
        });

        // AI Character
        this.character = new St.Button({
            label: '🤖',
            style_class: 'character-icon',
            can_focus: false,
        });

        // User question entry
        this.userEntry = new St.Entry({
            style_class: 'user-entry',
            hint_text: _('Ask me anything...'),
            track_hover: true,
            x_expand: true,
            y_expand: true,
            can_focus: true,
        });

        // Create enter button
        this.enterButton = new St.Button({
            label: '',
            style_class: 'enter-icon',
            toggle_mode: true,
            can_focus: false,
        });

        // Create voice activation button
        this.micButton = new St.Button({
            label: '',
            style_class: 'mic-icon',
            toggle_mode: true,
            can_focus: false,
        });

        // Create clear history button
        this.clearButton = new St.Button({
            label: '🗑️',
            style_class: 'trash-icon',
            toggle_mode: true,
            can_focus: false,
        });

        // Create settings button
        this.settingsButton = new St.Button({
            label: '⚙️',
            style_class: 'settings-icon',
            toggle_mode: true,
            can_focus: false,
        });

        // Create appearance button
        this.appearanceButton = new St.Button({
            label: '🎨',
            style_class: 'appearance-icon',
            toggle_mode: true,
            can_focus: false,
        });

        this.theme = new Theme();
        this.chat = new Chat();
    }

    create(app) {
        app.addMenuItem(this.theme.menu);
        app.addMenuItem(this.menu);
        this.menu.add_child(this.character);
        this.menu.add_child(this.userEntry);
        this.menu.add_child(this.enterButton);
        this.menu.add_child(this.micButton);
        this.menu.add_child(this.clearButton);
        this.menu.add_child(this.settingsButton);
        this.menu.add_child(this.appearanceButton);
        this._connect();
    }

    /**
     * @description actions
     */
    _connect() {
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
            this.interface.box.remove_child(this.scrollView);
            this.chat.chatSection = new PopupMenu.PopupMenuSection();
            this.chat.scrollView.add_child(this.chatSection.actor);
            this.app.interface.box.add_child(this.scrollView);
        });

        // If press settings button
        this.settingsButton.connect('clicked', (_self) => {
            this.app.openSettings();
            // Close App
            if (this.appearanceBoxIsOpen) {
                this.appearanceMenu.remove_child(this.menu);
                this.appearanceBoxIsOpen = false;
            }
            this.app.interface.close();
        });

        // If press appearance button
        this.appearanceBoxIsOpen = false;
        this.menu.appearanceButton.connect('clicked', (_self) => {
            if (this.appearanceBoxIsOpen) {
                this.appearanceMenu.remove_child(this.menu);
                this.appearanceBoxIsOpen = false;
                return;
            }
            this.appearanceBoxIsOpen = true;
        });
    }

    statusIcon(icon) {
        this.statusBar.label = icon;
        return true;
    }

    resetStatusIcon() {
        this.statusBar.label = '🤖';
        return true;
    }
}
