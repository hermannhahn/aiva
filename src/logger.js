export class Logger {
    /**
     *
     * @param {*} message
     */
    log(message) {
        if (message) {
            console.log(`[AIVA] ${message}`);
        }
    }

    /**
     *
     * @param {*} message
     */
    logError(message) {
        if (message) {
            console.log(`[AIVA][ERROR] ${message}`);
        }
    }
}
