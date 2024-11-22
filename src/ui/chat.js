import St from 'gi://St';
import * as PopupMenu from 'gi://PopupMenu';

export class Chat {
    constructor(intrface) {
        this.interface = intrface;
        this._create();
        return this;
    }

    _create() {
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
    }

    add() {
        this.interface.box.add_child(this.scrollView);
        this.scrollView.add_child(this.chatSection.actor);
        this.scrollView.set_style(`background-color: rgba(42, 42, 42, 0);`);
    }
}
