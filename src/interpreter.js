import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

export class Interpreter {
    constructor(app) {
        this.app = app;
        this.app.log('Interpreter loaded.');
        this.pids = [];
    }

    proccess(question) {
        this.app.ui.searchEntry.clutter_text.reactive = false;
        this.app.log('Question: ' + question);
        this.app.log('Processing question...');
        this.app.chat.addResponse('...');
        const isLocalVoiceCommand = this._isLocalVoiceCommand(question);
        if (this._isCommand(question)) {
            this.app.log('Command detected.');
            this._commandInterpreter(question);
        } else if (isLocalVoiceCommand.success) {
            this.app.log('Local Voice command detected.');
            this.localVoiceCommandInterpreter(isLocalVoiceCommand.command);
        } else if (this._isVoiceCommand(question)) {
            this.app.log('Voice command detected.');
            this.voiceCommandInterpreter(question);
        } else {
            this.app.log('Sending question to API...');
            this.app.gemini.response(question);
        }
        this.app.ui.searchEntry.clutter_text.reactive = true;
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

        // Check if the first four words is "computer", ignore special characters, ignore ",", ".", ":", "?", "!" etc..
        const words = text.split(/\s+/).slice(0, 4);
        for (const word of words) {
            for (const activationWord of activationWords) {
                if (word.includes(activationWord)) {
                    return true;
                }
            }
        }
        return false;
    }

    _isLocalVoiceCommand(text) {
        text = text.toLowerCase();
        const readCommands = [
            _('read this text'),
            _('read the text'),
            _('read the clipboard'),
            _('read copied text'),
            _('read clipboard text'),
            _('read this clipboard'),
            _('read text in memory'),
            _('read memorised text'),
            _('read for me'),
            _('read this for me'),
            _('read text for me'),
            _('read this please'),
            _('you can read now'),
        ];
        let result = {success: false, word: ''};
        for (const command of readCommands) {
            if (text.includes(command)) {
                result.success = true;
                result.command = 'readClipboard';
                return result;
            }
        }
        return result;
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
        let request = this.app.gemini.commandRequest(text);
        this.app.gemini.runCommand(request);
    }

    async localVoiceCommandInterpreter(command) {
        if (command === 'readClipboard') {
            try {
                this.app.chat.editResponse(_('Starting reading...'));
                await this.app.utils.getClipboardText();
            } catch (error) {
                this.app.logError(
                    'Erro ao obter texto da área de transferência:',
                    error,
                );
            }
        }
    }
}
