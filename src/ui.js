import St from 'gi://St';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export class AppLayout {
    constructor() {
        this.init();
    }

    init() {
        // Create tray
        this.tray = new St.BoxLayout({
            style_class: 'panel-status-menu-box',
        });
        this.icon = new St.Icon({
            style_class: 'google-gemini-icon',
        });

        // Create app item section
        this.item = new PopupMenu.PopupBaseMenuItem({
            reactive: true,
            can_focus: true,
            style_class: 'app-item',
        });

        // Create search entry
        this.searchEntry = new St.Entry({
            name: 'searchEntry',
            style_class: 'searchEntry',
            reactive: true,
            can_focus: true,
            hint_text: _('Ask me anything...'),
            x_expand: true,
            y_expand: true,
        });

        // Create voice activation button
        this.micButton = new St.Button({
            can_focus: true,
            reactive: true,
            toggle_mode: true,
            style_class: 'mic-icon',
        });

        // Create clear history button
        this.clearButton = new St.Button({
            can_focus: true,
            reactive: true,
            toggle_mode: true,
            style_class: 'trash-icon',
        });

        // Create settings button
        this.settingsButton = new St.Button({
            can_focus: true,
            reactive: true,
            toggle_mode: true,
            style_class: 'settings-icon',
        });

        // Create chat section
        this.chatSection = new PopupMenu.PopupMenuSection({
            style_class: 'chat-section',
            x_expand: true,
            y_expand: true,
            reactive: true,
            can_focus: false,
        });

        // Create scrollbar
        this.scrollView = new St.ScrollView({
            style_class: 'chat-scroll-section',
            reactive: true,
            overlay_scrollbars: false,
        });

        // Create input and response chat items
        this.inputChat = new PopupMenu.PopupMenuItem('', {
            style_class: 'input-chat',
            reactive: true,
            can_focus: false,
            hover: true,
        });
        this.responseChat = new PopupMenu.PopupMenuItem('', {
            style_class: 'response-chat',
            reactive: true,
            can_focus: false,
            hover: true,
        });

        // Create copy button
        this.copyButton = new PopupMenu.PopupMenuItem('', {
            style_class: 'copy-icon',
            reactive: true,
            can_focus: false,
            hover: true,
        });

        // Separator
        this.newSeparator = new PopupMenu.PopupSeparatorMenuItem();

        return this;
    }
}
