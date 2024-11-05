export class Open {
    constructor(app) {
        this.app = app;
    }

    software(text) {
        // Ask to gemini how to open what user want to open
        this.app.gemini.commandLine(
            `My boss asked me to open an application. The computer's operating system is Linux Ubuntu. Interpret the following sentence and respond with only one command line so that I can run it on his computer's terminal and achieve the objective of the request. Consider that the computer may not have the application and it will be necessary to include the installation in the command line. Rules for responding: Respond with only one command line. Solicitation: ${text}`,
        );
    }
}
