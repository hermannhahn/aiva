import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Interpreter {
    constructor(app) {
        this.app = app;
        this.app.log('Interpreter loaded.');
        this.pids = [];
    }

    proccess(question) {
        if (this._isCommand(question)) {
            this._commandInterpreter(question);
            this.app.ui.searchEntry.clutter_text.reactive = true;
        } else if (this._isVoiceCommand(question)) {
            this._voiceCommandInterpreter(question);
            this.app.ui.searchEntry.clutter_text.reactive = true;
        } else {
            this.app.gemini.response(question);
        }
    }

    _isCommand(text) {
        if (text.startsWith('/')) {
            return true;
        }
        return false;
    }

    _isVoiceCommand(text) {
        text = text.toLowerCase();
        let activationWords = [
            _('computer'),
            'aiva',
            this.app.userSettings.ASSIST_NAME,
        ];

        // Check if the first three words includes "computer"
        const words = text.split(/\s+/).slice(0, 3);
        for (const word of words) {
            if (activationWords.includes(word)) {
                return true;
            }
        }
        return false;
    }

    _commandInterpreter(text) {
        if (text.startsWith('/')) {
            if (text.startsWith('/help')) {
                this.app.chat.add(`
HELP

/settings   - Open settings
/help       - Show this help
                `);
            }

            if (text.startsWith('/settings')) {
                this.app.openSettings();
            }
        }
    }

    _voiceCommandInterpreter(text) {
        let solicitation = text.toLowerCase();
        // const maxWords = 10;
        // const openAppWords = [
        //     _('open'),
        //     'abre',
        //     'abra',
        //     _('start'),
        //     'inicie',
        //     'inicia',
        //     _('launch'),
        //     _('run'),
        //     'rode',
        //     'roda',
        //     _('execute'),
        //     'execute',
        //     'executa',
        // ];
        // const closeAppWords = [
        //     _('close'),
        //     'feche',
        //     'fecha',
        //     _('terminate'),
        //     'termine',
        //     'termina',
        //     'encerra',
        //     'encerre',
        //     _('exit'),
        //     'saie',
        //     'saia',
        //     _('kill'),
        //     'mate',
        //     'mata',
        // ];
        // Dividir o texto em palavras e pegar as primeiras 'maxWords'
        // const words = text.split(/\s+/).slice(0, maxWords);
        // for (const word of words) {
        //     if (openAppWords.includes(word)) {
        this.app.gemini.runCommand(
            `My boss asked me to do something in his computer. The computer's operating system is Linux Ubuntu. Interpret the following solicitation and respond with only one command line to do what he needs,so that I can run it on his computer's terminal and achieve the objective of the request. Consider that the computer have the application to run. Rules for responding: Respond only with command line to do what he needs. If the solicitation it is not possible to do in terminal respond only with word "false". Solicitation: ${solicitation}`,
        );
        // this.app.gemini.runCommand(
        //     `My boss asked me to open an application. The computer's operating system is Linux Ubuntu. Interpret the following solicitation and respond with only one command line so that I can run it on his computer's terminal and achieve the objective of the request. Consider that the computer have the application the command line to run. Rules for responding: Respond with only one command line. Solicitation: ${text}`,
        // );
        //     break;
        // } else if (closeAppWords.includes(word)) {
        //     this.close.software(text);
        // } else {
        //     this.app.log('Command not found');
        // }
        // }
    }
}
