import St from 'gi://St';
import Clutter from 'gi://Clutter';

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

        this.blackColor = Clutter.Color.from_string('black')[1];
        this.whiteColor = Clutter.Color.from_string('white')[1];

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
        chat.label.clutter_text.reactive = true;
        chat.label.clutter_text.selectable = true;
        chat.label.clutter_text.hover = true;
        return chat;
    }

    /**
     * @description create question item
     * @param {string} color
     * @returns {object} question item
     */
    question(color) {
        // Question
        let questionBox = new PopupMenu.PopupMenuItem('', {
            style_class: 'input-chat',
            can_focus: false,
            reactive: true,
            hover: true,
        });
        questionBox.label.clutter_text.set_selected_text_color(this.whiteColor);
        questionBox.label.clutter_text.set_selection_color(this.blackColor);
        questionBox.label.clutter_text.justify = true;
        questionBox.label.clutter_text.line_wrap = true;
        questionBox.label.clutter_text.line_wrap_mode = 0;
        questionBox.label.clutter_text.ellipsize = 0;
        questionBox.label.clutter_text.set_size(-1, -1);
        questionBox.label.clutter_text.set_line_alignment(
            Clutter.ActorAlign.FILL,
        );
        questionBox.set_style(`background-color: rgba(${color});`);
        questionBox.label.clutter_text.reactive = true;
        questionBox.label.clutter_text.selectable = true;
        questionBox.label.clutter_text.hover = true;
        this.inputChat = questionBox;
        return questionBox;
    }

    /**
     * @description create response item
     * @param {string} color
     * @returns {object} response item
     */
    response(color) {
        // Response
        let responseBox = new PopupMenu.PopupMenuItem('', {
            style_class: 'response-chat',
            can_focus: false,
            reactive: true,
            hover: true,
        });
        responseBox.label.clutter_text.set_selected_text_color(this.whiteColor);
        responseBox.label.clutter_text.set_selection_color(this.blackColor);
        responseBox.label.clutter_text.justify = true;
        responseBox.label.clutter_text.line_wrap = true;
        responseBox.label.clutter_text.line_wrap_mode = 0;
        responseBox.label.clutter_text.ellipsize = 0;
        responseBox.label.clutter_text.set_size(-1, -1);
        responseBox.label.clutter_text.set_line_alignment(
            Clutter.ActorAlign.FILL,
        );
        responseBox.set_style(`background-color: rgba(${color});`);
        responseBox.label.clutter_text.reactive = true;
        responseBox.label.clutter_text.selectable = true;
        responseBox.label.clutter_text.hover = true;
        responseBox.label.clutter_text.justify = true;
        this.responseChat = responseBox;
        return responseBox;
    }

    /**
     * @description create copy button item
     * @param {string} color
     * @returns {object} copy button item
     */
    copy(color) {
        // Copy Button
        let copyButton = new PopupMenu.PopupMenuItem('', {
            style_class: 'copy-icon',
            can_focus: false,
            reactive: true,
            hover: true,
        });
        copyButton.set_style(`background-color: rgba(${color});`);
        copyButton.label.clutter_text.reactive = true;
        copyButton.label.clutter_text.selectable = true;
        copyButton.label.clutter_text.hover = true;
        this.copyButton = copyButton;
        return copyButton;
    }
}
