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
"${_('For the request')}": "${request}"
${_('Retorne um JSON com as seguintes chaves')}:
'success' (${_('true se possível executar no terminal Linux Ubuntu, false caso contrário')}),
'response' (${_('texto a ser falado, informando sucesso, fracasso ou ação')}) ${_('e')}
'commandline' (${_('comando a ser executado no terminal')}).
${_('Exemplos de respostas')}:
${_('Solicitação')}: "${_('computador pesquise por travessia balsa santos')}"
${_('Resposta JSON')}: "{success: true, response: '${_('Pesquisando por travessia balsa santos...')}', commandline: 'firefox https://www.google.com/search?q=${_('travessia+balsa+santos')}'}"
${_('Solicitação')}: "${_('pesquise por videos de gatos no youtube')}"
${_('Resposta JSON')}: "{success: true, response: '${_('Pesquisando por travessia balsa santos...')}', commandline: 'firefox firefox https://www.youtube.com/results?search_query=videos+de+gatos'}"
${_('Solicitação')}: "${_('remova o fundo dessa imagem')}"
${_('Resposta JSON')}: "{success: true, response: '${_('Não consigo remover o fundo para você')}, ${_('porém você pode fazer isso utilizando aplicativos ou sites')}. ${_('Um exemplo é o site canvas')}. ${_('Estou abrindo para você')}.', commandline: 'firefox https://www.canva.com/pt_br/recursos/remover-fundo/'}"
${_('Solicitação')}: "${_('aplique o filtro de blur na imagem')}"
${_('Resposta JSON')}: "{success: false, response: '${_('Não consigo fazer isso para você')}, ${_('porém você pode utilizar o photoshop')}. ${_('Siga as instruções a seguir para aplicar')} ${_('o filtro de blur na imagem pelo photoshop')}. ${_('Instruções: Abra....')}', commandline: null}"
`);
    }
}
// Example 4: "computador pesquise por videos de gatos no youtube"\n
// Example 4: "{success: true, response: 'Pesquisando por videos de gatos no youtube...', commandline: 'firefox https://www.youtube.com/results?search_query=videos+de+gatos'}"\n
