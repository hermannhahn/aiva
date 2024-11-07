/**
 * @description app logger
 * @param {boolean} [debug=true]
 * @example
 * [instance]
 *
 * let logger = new Logger(true) - false to disable debug
 *
 * [functions]
 *
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
     * @param {*} message
     * @example
     * log(text)
     * @return null
     * @description [show console log]
     */
    log(message) {
        if (this.debug === true) {
            if (message) {
                console.log(`[AIVA] ${message}`);
            }
        }
    }

    /**
     * @param {*} message
     * @example
     * logError(text)
     * @return null
     * @description show console log error
     */
    logError(message) {
        if (this.debug === true) {
            if (message) {
                console.log(`[AIVA][ERROR] ${message}`);
            }
        }
    }
}
