export class Logger {
    constructor(debug = true) {
        this.debug = debug;
        if (debug === true) {
            this.log('Debug mode enabled.');
        }
    }

    /**
     *
     * @param {*} message
     */
    log(message) {
        if (this.app.logger.debug === true) {
            if (message) {
                console.log(`[AIVA] ${message}`);
            }
        }
    }

    /**
     *
     * @param {*} message
     */
    logError(message) {
        if (this.app.logger.debug === true) {
            if (message) {
                console.log(`[AIVA][ERROR] ${message}`);
            }
        }
    }
}
