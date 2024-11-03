export class Logger {
    log(message) {
        if (message) {
            console.log(`[AIVA] ${message}`);
        }
    }

    logError(message) {
        if (message) {
            console.log(`[AIVA][ERROR] ${message}`);
        }
    }
}
