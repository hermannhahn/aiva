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
            style_class: 'app-item',
        });

        // Create search entry
        this.searchEntry = new St.Entry({
            name: 'searchEntry',
            style_class: 'searchEntry',
            hint_text: _('Ask me anything...'),
            x_expand: true,
        });

        // Create voice activation button
        this.micButton = new St.Button({
            style_class: 'mic-icon',
            toggle_mode: true,
        });

        // Create clear history button
        this.clearButton = new St.Button({
            style_class: 'trash-icon',
            toggle_mode: true,
        });

        // Create settings button
        this.settingsButton = new St.Button({
            style_class: 'settings-icon',
            toggle_mode: true,
        });

        // Create chat section
        this.chatSection = new PopupMenu.PopupMenuSection({
            style_class: 'chat-section',
            hover: false,
        });

        // Create scrollbar
        this.scrollView = new St.ScrollView({
            style_class: 'chat-scroll-section',
            overlay_scrollbars: false,
        });

        // Create input and response chat items
        this.inputChat = new PopupMenu.PopupMenuItem('', {
            style_class: 'input-chat',
        });
        this.responseChat = new PopupMenu.PopupMenuItem('', {
            style_class: 'response-chat',
        });

        // Create copy button
        this.copyButton = new PopupMenu.PopupMenuItem('', {
            style_class: 'copy-icon',
        });

        // Separator
        this.newSeparator = new PopupMenu.PopupSeparatorMenuItem();

        return this;
    }
}
