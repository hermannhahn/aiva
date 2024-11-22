import St from 'gi://St';

export class Menu {
    constructor(intrface) {
        this.interface = intrface;
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
        return this;
    }

    add() {
        this.menu.add_child(this.character);
        this.menu.add_child(this.userEntry);
        this.menu.add_child(this.enterButton);
        this.menu.add_child(this.micButton);
        this.menu.add_child(this.clearButton);
        this.menu.add_child(this.settingsButton);
        this.menu.add_child(this.appearanceButton);
        this.interface.addMenuItem(this.menu);
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
