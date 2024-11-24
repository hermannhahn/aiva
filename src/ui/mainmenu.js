import St from 'gi://St';
import * as PopupMenu from 'gi://PopupMenu';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description main bar
 */
export class MainMenu {
    constructor() {
        // Create app item section
        this.container = new PopupMenu.PopupBaseMenuItem({
            style_class: 'main-bar',
            reactive: false,
            can_focus: true,
        });

        // Status Icon
        this.character = new St.Button({
            label: '🤖',
            style_class: 'character-icon',
            can_focus: false,
        });

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
    }
}
