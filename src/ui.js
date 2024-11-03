import St from 'gi://St';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export class AppLayout {
    constructor(app) {
        this.app = app;
    }

    log(message) {
        if (message) {
            this.app.utils.log(`[UI] ${message}`);
        }
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

        this.createApp();
        this.addItems();
        this.itemsActions();
    }

    createApp() {
        // Icon tray
        this.tray.add_child(this.icon);
        this.app.add_child(this.tray);
        this.log('App tray initialized.');
    }

    addItems() {
        // Add items container to menu
        this.app.menu.addMenuItem(this.item);
        this.app.menu.style_class = 'menu';

        // Add scrollview to menu box
        this.app.menu.box.add_child(this.scrollView);
        this.app.menu.box.style_class = 'menu-box';

        // Add chat to scrollbar
        this.scrollView.add_child(this.chatSection.actor);

        // Add search entry, mic button, clear button and settings button to items container
        this.item.add_child(this.searchEntry);
        this.item.add_child(this.micButton);
        this.item.add_child(this.clearButton);
        this.item.add_child(this.settingsButton);
    }

    itemsActions() {
        //
        // Actions
        //

        // If press enter on question input box
        this.searchEntry.clutter_text.connect('activate', (actor) => {
            const question = actor.text;
            this.searchEntry.clutter_text.set_text('');
            this.searchEntry.clutter_text.reactive = false;
            this.app.chat.addQuestion(question);
        });

        // If press mic button
        this.micButton.connect('clicked', (_self) => {
            this.app.audio.record();
        });

        // If press clear button
        this.clearButton.connect('clicked', (_self) => {
            this.searchEntry.clutter_text.set_text('');
            this.app.chat.history = [];
            this.app.menu.box.remove_child(this.scrollView);
            this.chatSection = new PopupMenu.PopupMenuSection();
            this.scrollView.add_child(this.chatSection.actor);
            this.app.menu.box.add_child(this.scrollView);
        });

        // If press settings button
        this.settingsButton.connect('clicked', (_self) => {
            this.app.openSettings();
            // Close App
            this.app.menu.close();
        });
    }

    question() {
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
}
