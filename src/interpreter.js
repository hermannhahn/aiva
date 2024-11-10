import GLib from 'gi://GLib';

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
        if (this._isCommand(question)) {
            this.app.log('Command detected.');
            this._commandInterpreter(question);
        } else if (this._isVoiceCommand(question)) {
            this.app.log('Voice command detected.');
            this.voiceCommandInterpreter(question);
        } else if (this._isReaderCommand(question)) {
            this.app.log('Reader command detected.');
            this._readerCommandInterpreter(question);
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

    _isReaderCommand(text) {
        const activationWords = [
            _('read'),
            'leia',
            _('speech'),
            'fale',
            'fala',
            _('tell me'),
            'diga',
        ];
        for (const activationWord of activationWords) {
            if (text.includes(activationWord)) {
                return true;
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
        let request = this.app.gemini.commandRequest(text);
        this.app.gemini.runCommand(request);
    }

    _readerCommandInterpreter(text) {
        let readNews = false;
        let readTopicNews = false;
        let activationTopic = '';
        text = text.toLowerCase();
        const words = text.split(/\s+/).slice(0, 10);

        const topicNewsActivationWords = [
            _('news in'),
            _('news in the'),
            _('news on'),
            _('news on the'),
            _('news of'),
            _('news about'),
            _('news about the'),
            _('news about on'),
            _('news about on the'),
            _('news about of'),
            _('main events in'),
            _('main events in the'),
            _('main events on'),
            _('main events on the'),
            _('main events of'),
            _('main events about'),
            _('main events about the'),
            _('main events about on'),
            _('main events about on the'),
            _('main events about of'),
            _('events in'),
            _('events in the'),
            _('events on'),
            _('events on the'),
            _('events of'),
            _('events about'),
            _('events about the'),
            _('events about on'),
            _('events about on the'),
            _('events about of'),
            _('main news in'),
            _('main news in the'),
            _('main news on'),
            _('main news on the'),
            _('main news of'),
            _('main news about'),
            _('main news about the'),
            _('main news about on'),
            _('main news about on the'),
            _('main news about of'),
        ];

        const newsActivationWords = [
            _('news'),
            _('main events'),
            _('events'),
            _('main news'),
        ];

        for (const activationWord of topicNewsActivationWords) {
            if (text.includes(activationWord)) {
                activationTopic = activationWord;
                readNews = true;
                readTopicNews = true;
                break;
            }
        }
        if (readTopicNews) {
            // Get the 3 first words after activationWord
            const topic = text.split(activationTopic)[1].split(' ')[0];
            this.app.log('Searching for news for ' + topic + '...');
            this.app.topict.editResponse(_('Searching for news...'));
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
                this.app.utils.readNews(topic);
                return false; // Para garantir que o timeout execute apenas uma vez
            });
            return;
        }

        if (!readTopicNews) {
            for (const word of words) {
                for (const activationWord of newsActivationWords) {
                    if (word.includes(activationWord)) {
                        readNews = true;
                        break;
                    }
                }
            }
        }
        if (readNews) {
            this.app.log('Searching for news...');
            this.app.chat.editResponse(_('Searching for news...'));
            this.app.utils.readNews();
            return;
        }
        this.app.log('Sending question to API...');
        this.app.gemini.response(text);
    }
}
