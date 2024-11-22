import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import {Interface} from './ui/interface.js';
import {Menu} from './ui/menu.js';
import {Themes} from './ui/themes.js';
import {Chat} from './ui/chat.js';

/**
 * @description app user interface
 * @param {object} app
 */
export class UI {
    constructor(app) {
        this.app = app;
        this.interface = new Interface(this.app);
        this.menu = new Menu(this.interface);
        this.themes = new Themes(this.menu);
        this.chat = new Chat(this.interface);
    }

    /**
     * @description initialize interfaces
     */
    init() {
        this.app.log('Initializing UI...');
        this.interface.add();
        this.themes.add();
        this.menu.add();
        this.chat.add();

        this.setTheme(
            this.app.userSettings.TRANSPARENCY,
            this.app.userSettings.COLOR,
        );

        this._actions();

        this.app.log('UI initialized.');
    }
}
