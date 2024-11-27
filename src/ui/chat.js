import St from 'gi://St';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export class Chat {
    constructor() {
        this._create();
    }

    _create() {
        // Create scrollbar
        this.container = new St.ScrollView({
            style_class: 'chat-scroll',
            overlay_scrollbars: false,
            can_focus: false,
        });

        // Create chat section
        this.box = new PopupMenu.PopupMenuSection({
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

        this._addItems();
    }

    _addItems() {
        this.container.add_child(this.box.actor);
    }

    /**
     * @description create chat item
     * @returns {object} chat item
     */
    add() {
        // Question
        let chat = new PopupMenu.PopupMenuItem('', {
            style_class: 'input-chat',
            can_focus: false,
        });
        let scolor = chat.label.clutter_text.get_selected_text_color();
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
        let inputBox = new PopupMenu.PopupMenuItem('', {
            style_class: 'input-chat',
            can_focus: false,
        });
        inputBox.label.clutter_text.reactive = true;
        inputBox.label.clutter_text.selectable = true;
        inputBox.label.clutter_text.hover = true;
        this.inputChat = inputBox;
        return inputBox;
    }

    /**
     * @description create response item
     * @returns {object} response item
     */
    response() {
        // Response
        let responseBox = new PopupMenu.PopupMenuItem('', {
            style_class: 'response-chat',
            can_focus: false,
        });
        responseBox.label.clutter_text.reactive = true;
        responseBox.label.clutter_text.selectable = true;
        responseBox.label.clutter_text.hover = true;
        responseBox.label.clutter_text.justify = true;
        this.responseChat = responseBox;
        return responseBox;
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
}
