export class App {
    constructor(app) {
        this.app = app;
    }

    log(message) {
        if (message) {
            console.log(`[AIVA] ${message}`);
        }
    }

    init() {
        this.log('App initialized.');
    }
}
