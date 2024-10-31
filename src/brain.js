import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Brain {
    constructor(app) {
        this.app = app;
    }

    proccess(question) {
        this.app.response(question);
    }
}
