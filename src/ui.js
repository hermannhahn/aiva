import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import {Interface} from './ui/interface.js';

/**
 * @description user interface
 * @param {object} app
 */
export class UI {
    constructor(app) {
        this.app = app;
        this.interface = new Interface();
    }

    /**
     * @description initialize interfaces
     */
    create() {
        this.app.add_child(this.interface.box);
        this.interface.create();
    }
}
