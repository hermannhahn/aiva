export class Logger {
    constructor(debug) {
        this.debug = debug;
        if (debug) {
            this.log('Debug mode enabled.');
        }
    }

    /**
     *
     * @param {*} message
     */
    log(message) {
        if (this.debug && message) {
            console.log(`[AIVA] ${message}`);
        }
    }

    /**
     *
     * @param {*} message
     */
    logError(message) {
        if (this.debug && message) {
            console.log(`[AIVA][ERROR] ${message}`);
        }
    }
}
