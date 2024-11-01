import St from 'gi://St';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export class AppLayout {
    constructor(app) {
        this.app = app;
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
            reactive: false,
            can_focus: false,
        });

        // Create search entry
        this.searchEntry = new St.Entry({
            name: 'searchEntry',
            style_class: 'searchEntry',
            hint_text: _('Ask me anything...'),
            track_hover: true,
            x_expand: true,
            y_expand: true,
            can_focus: false,
        });

        // Create voice activation button
        this.micButton = new St.Button({
            style_class: 'mic-icon',
            toggle_mode: true,
            can_focus: false,
        });

        // Create clear history button
        this.clearButton = new St.Button({
            style_class: 'trash-icon',
            toggle_mode: true,
            can_focus: false,
        });

        // Create settings button
        this.settingsButton = new St.Button({
            style_class: 'settings-icon',
            toggle_mode: true,
            can_focus: false,
        });

        // Create chat section
        this.chatSection = new PopupMenu.PopupMenuSection({
            style_class: 'chat-section',
            can_focus: false,
        });

        // Create scrollbar
        this.scrollView = new St.ScrollView({
            style_class: 'chat-scroll-section',
            overlay_scrollbars: false,
            can_focus: false,
        });

        // Create input and response chat items
        this.inputChat = new PopupMenu.PopupMenuItem('', {
            style_class: 'input-chat',
            can_focus: false,
        });
        this.responseChat = new PopupMenu.PopupMenuItem('', {
            style_class: 'response-chat',
            can_focus: false,
        });

        // Create copy button
        this.copyButton = new PopupMenu.PopupMenuItem('', {
            style_class: 'copy-icon',
            can_focus: false,
        });

        // Separator
        this.newSeparator = new PopupMenu.PopupSeparatorMenuItem();

        this.createTray();
        this.addItems();
        this.itemsActions();
    }

    createTray() {
        // Icon tray
        this.ui.tray.add_child(this.ui.icon);
        this.add_child(this.ui.tray);
        this.log('App tray initialized.');
    }

    addItems() {
        // Add items container to menu
        this.menu.addMenuItem(this.ui.item);
        this.menu.style_class = 'menu';

        // Add scrollview to menu box
        this.menu.box.add_child(this.ui.scrollView);
        this.menu.box.style_class = 'menu-box';

        // Add chat to scrollbar
        this.ui.scrollView.add_child(this.ui.chatSection.actor);

        // Add search entry, mic button, clear button and settings button to items container
        this.ui.item.add_child(this.ui.searchEntry);
        this.ui.item.add_child(this.ui.micButton);
        this.ui.item.add_child(this.ui.clearButton);
        this.ui.item.add_child(this.ui.settingsButton);
    }

    itemsActions() {
        //
        // Actions
        //

        // If press enter on question input box
        this.ui.searchEntry.clutter_text.connect('activate', (actor) => {
            const question = actor.text;
            this.ui.searchEntry.clutter_text.set_text('');
            this.ui.searchEntry.clutter_text.reactive = false;
            this.chat(question);
        });

        // If press mic button
        this.ui.micButton.connect('clicked', (_self) => {
            this.audio.record();
        });

        // If press clear button
        this.ui.clearButton.connect('clicked', (_self) => {
            this.ui.searchEntry.clutter_text.set_text('');
            this.chatHistory = [];
            this.ui.menu.box.remove_child(this.ui.scrollView);
            this.ui.chatSection = new PopupMenu.PopupMenuSection();
            this.ui.scrollView.add_child(this.ui.chatSection.actor);
            this.ui.menu.box.add_child(this.ui.scrollView);
        });

        // If press settings button
        this.ui.settingsButton.connect('clicked', (_self) => {
            this.openSettings();
            // Close App
            this.menu.close();
        });
    }
}
