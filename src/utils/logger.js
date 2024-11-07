/**
 * @description app logger
 * @param debug [debug = true]
 * @example
 * log(text) - return null - show console log
 * logError(text) - return null - show console log error
 */
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
        if (this.debug === true) {
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
        if (this.debug === true) {
            if (message) {
                console.log(`[AIVA][ERROR] ${message}`);
            }
        }
    }
}
