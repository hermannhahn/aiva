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
        let request = text.toLowerCase();
        this.app.gemini.runCommand(`
Please, folow the instructions below.\n
Objective: Fulfill the request using a command line to be executed in the linux ubuntu terminal.\n
Request: ${request}\n
Response type: json\n
How to response examples: \n
Request example 1: "computador pesquise por travessia balsa santos"\n
Response example 1: "{success: true, response: 'Pesquisando por travessia balsa santos...', commandline: 'firefox https://www.google.com/search?q=travessia+balsa+santos'}"\n
Request example 2: "computador, remova o fundo dessa imagem"\n
Response example 2: "{success: true, response: 'Não consigo remover o fundo para você, porém você pode fazer isso utilizando aplicativos ou sites. Um exemplo é o site canvas. Estou abrindo para você.', commandline: 'firefox https://www.canva.com/pt_br/recursos/remover-fundo/'}"\n
Request example 3: "computador, aplique o filtro de blur na imagem"\n
Response example 3: "{success: false, response: 'Não consigo fazer isso para você, porém você pode utilizar o photoshop. Siga as instruções a seguir para aplicar o filtro de blur na imagem pelo photoshop. Instruções: Abra....', commandline: null}"\n
Request example 4: "computador pesquise por videos de gatos no youtube"\n
Response example 4: "{success: true, response: 'Pesquisando por videos de gatos no youtube...', commandline: 'firefox https://www.youtube.com/results?search_query=videos+de+gatos'}"\n
`);
    }
}
