import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Interpreter {
    constructor(app) {
        this.app = app;
        this.app.log('Interpreter loaded.');
        this.pids = [];
    }

    proccess(question) {
        this.app.ui.searchEntry.clutter_text.reactive = false;
        this.app.log('Processing question...');
        this.app.log('Question: ' + question);
        this.app.chat.addResponse('...');
        if (this._isCommand(question)) {
            this._commandInterpreter(question);
        } else if (this._isVoiceCommand(question)) {
            this.voiceCommandInterpreter(question);
        } else {
            this.app.gemini.response(question);
        }
        this.app.ui.searchEntry.clutter_text.reactive = true;
    }

    _isCommand(text) {
        if (text.startsWith('/')) {
            this.app.log('Command detected.');
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

        // Check if the first four words is "computer", ignore special characters, ignore ",", ".", ":", "?", "!" etc..
        const words = text.split(/\s+/).slice(0, 4);
        for (const word of words) {
            for (const activationWord of activationWords) {
                if (word.includes(activationWord)) {
                    this.app.log('Voice command detected.');
                    return true;
                }
            }
        }
        return false;
    }

    _commandInterpreter(text) {
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

    voiceCommandInterpreter(text) {
        let request = text.toLowerCase();
        this.app.gemini.runCommand(`
"${_('For the request')}": "${request}"
${_('Return a JSON with the following keys')}:
'success' (${_('true if it can be executed')} ${_('on a Linux Ubuntu terminal')}, ${_('false otherwise')}),
'response' (${_('text to be spoken, informing success, failure or action')}) ${_('e')}
'commandline' (${_('command to be executed in the terminal')}).
${_('Rules for commandline value')}: ${_('Do not use sudo')}, ${_('assume any application is already installed')}.
${_('Examples of responses')}:
${_('Request')}: "${_('computer search for santos ferry crossing')}"
${_('JSON Response')}: "{success: true, response: '${_('Searching for santos ferry crossing...')}', commandline: 'firefox https://www.google.com/search?q=${_('ferry+crossing+santos')}'}"
${_('Request')}: "${_('search for cat videos on youtube')}"
${_('JSON Response')}: "{success: true, response: '${_('Searching for cat videos on youtube...')}', commandline: 'firefox firefox https://www.youtube.com/results?search_query=${_('cat')}'}"
${_('Request')}: "${_('remove the background of this image')}"
${_('JSON Response')}: "{success: true, response: '${_("I can't remove the background for you")}, ${_('but you can do it using apps or websites.')}. ${_('One example is the canvas website.')}. ${_("I'm opening it for you.")}.', commandline: 'firefox https://www.canva.com/pt_br/recursos/remover-fundo/'}"
${_('Request')}: "${_('apply the blur filter to the image')}"
${_('JSON Response')}: "{success: false, response: '${_("I can't do that for you")}, ${_('but you can use photoshop.')}. ${_('Follow the instructions below to apply')} ${_('the blur filter to the image using photoshop')}. ${_('Instructions: Open...')}', commandline: null}"
`);
    }
}
