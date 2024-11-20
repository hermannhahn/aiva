import St from 'gi://St';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description app user interface
 * @param {object} app
 * @example
 * instance:
 * const ui = new UI(app);
 *
 * public function
 * init() - initialize interfaces
 * chat() - return chat item
 * question() - return new question item
 * response() - return new response item
 * copy() - return new copy button item
 *
 * private function
 * _createApp() - create app and tray
 * _addItems() - add items to app
 * _itemsActions() - event handlers
 */
export class UI {
    constructor(app) {
        this.app = app;
        this.app.log('UI loaded.');
    }

    /**
     * @description initialize interfaces
     */
    init() {
        this.app.log('Initializing UI...');

        // Create tray
        this.tray = new St.BoxLayout({
            style_class: 'system-tray',
        });
        this.icon = new St.Icon({
            style_class: 'google-assistant-icon',
        });

        // Create app item section
        this.item = new PopupMenu.PopupBaseMenuItem({
            style_class: 'app-items',
            reactive: false,
            can_focus: true,
        });

        // Status Icon
        this.statusBar = new St.Button({
            label: '🤖',
            style_class: 'status-icon',
            can_focus: false,
        });

        this.searchEntry = new St.Entry({
            style_class: 'search-entry',
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

        // Create appearance box
        this.appearanceBox = new St.BoxLayout({
            style_class: 'appearance-box',
        });

        // Create transparency slider
        this.transparencyEntry = new St.Entry({
            style_class: 'transparency-entry',
            can_focus: true,
        });

        // Create transparency label
        this.transparencyLabel = new St.Label({
            style_class: 'transparency-label',
        });

        // Create transparency ok button
        this.transparencyButton = new St.Button({
            label: 'OK',
            style_class: 'transparency-ok-icon',
            toggle_mode: true,
            can_focus: true,
        });

        // Create scrollbar
        this.scrollView = new St.ScrollView({
            style_class: 'chat-scroll',
            overlay_scrollbars: false,
            can_focus: false,
        });

        // Create chat section
        this.chatSection = new PopupMenu.PopupMenuSection({
            style_class: 'chat-section',
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

        // Initialize
        this._createApp();
        this._addItems();
        this._itemsActions();

        this.app.log('UI initialized.');
    }

    /**
     * @description create app tray
     */
    _createApp() {
        // Icon tray
        this.tray.add_child(this.icon);
        this.app.add_child(this.tray);
        this.app.log('App tray initialized.');
    }

    /**
     * @description add items to app tray
     */
    _addItems() {
        // Add items container to app
        this.app.menu.addMenuItem(this.item);
        this.app.menu.box.style_class = 'app';

        // Add items
        this.item.add_child(this.statusBar);
        this.item.add_child(this.searchEntry);
        this.item.add_child(this.enterButton);
        this.item.add_child(this.micButton);
        this.item.add_child(this.clearButton);
        this.item.add_child(this.settingsButton);
        this.item.add_child(this.appearanceButton);

        // Add scrollview
        this.app.menu.box.add_child(this.scrollView);

        // Add chat to scrollbar
        this.scrollView.add_child(this.chatSection.actor);
    }

    /**
     * @description items actions
     */
    _itemsActions() {
        // If press enter on question input box
        this.searchEntry.clutter_text.connect('activate', (actor) => {
            const question = actor.text;
            this.searchEntry.clutter_text.set_text('');
            this.searchEntry.clutter_text.reactive = false;
            this.app.chat.addQuestion(question);
            this.app.interpreter.proccess(question);
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

        // If press appearance button
        this.appearanceBoxIsOpen = false;
        this.appearanceButton.connect('clicked', (_self) => {
            const parent = this.app.menu.box.get_parent();
            if (this.appearanceBoxIsOpen) {
                parent.remove_child(this.appearanceBox);
                this.appearanceBoxIsOpen = false;
                return;
            }
            // get menu box parent
            // show appearance box
            if (parent) {
                parent.insert_child_above(
                    this.appearanceBox,
                    this.app.menu.box,
                );
                this.appearanceBox.add_child(this.transparencyLabel);
                this.appearanceBox.add_child(this.transparencyEntry);
                this.appearanceBox.add_child(this.transparencyButton);

                this.transparencyButton.connect('clicked', (_self) => {
                    const transparency =
                        this.transparencyEntry.clutter_text.text;
                    if (transparency === '' || isNaN(parseInt(transparency))) {
                        this.app.logError('Transparency value is invalid.');
                        return;
                    }
                    this.setTransparency(transparency);
                });
            }
            this.appearanceBoxIsOpen = true;
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

    setTransparency(transparency) {
        // set menu box transparency
        transparency = parseInt(transparency) / 100;
        this.app.menu.box.set_style(
            `background-color: rgba(42, 42, 42, ${transparency});`,
        );
    }
}
