export class Chat {
    constructor(app) {
        this.app = app;
    }

    log(message) {
        if (message) {
            console.log(`[CHAT] ${message}`);
        }
    }

    init() {
        this.log('Chat initialized.');
    }
}
