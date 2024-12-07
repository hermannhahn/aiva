/**
 * @description app logger
 * @param {boolean} [debug=true]
 * @example
 * instance:
 *  const logger = new Logger(true) - false to disable debug
 *
 * functions:
 *  log(text) - return null - log
 *  logError(text) - return null - log error
 */
export class Logger {
    constructor(debug = true) {
        this.debug = debug;
        if (debug === true) {
            this.log('Debug mode enabled.');
        }
    }

    /**
     * @description show console log
     * @param {*} message
     * @example
     * log(text)
     */
    log(message) {
        if (this.debug === true) {
            if (message) {
                console.log(`[AIVA] ${message}`);
            }
        }
    }

    /**
     * @description show console log error
     * @param {*} message
     * @example
     * logError(text)
     */
    logError(message) {
        if (this.debug === true) {
            if (message) {
                console.error(`[AIVA] ${message}`);
            }
        }
    }
}
