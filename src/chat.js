import GLib from 'gi://GLib';
import Soup from 'gi://Soup';
import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

/**
 * @description manage chat
 * @param {object} app
 * @example
 * instance:
 * const chat = new Chat(app);
 *
 * public function
 * init() - initialize chat
 * add() - add text to the chat
 * addQuestion(text, speech) - add question to the chat
 * editQuestion(text, speech) - edit last question
 * addResponse(text, speech) - add response to the chat
 * editResponse(text, speech) - edit last response
 */
export class Chat {
    constructor(app) {
        this.app = app;
        this.history = [];
        this.app.log('Chat loaded.');
    }

    /**
     * @description initialize chat
     */
    init() {
        this.app.log('Initializing chat...');
        this.isOpen = false;

        // load history file
        try {
            let url = 'http://ip-api.com/json/{query}?fields=581663';
            let _httpSession = new Soup.Session();
            let message = Soup.Message.new('GET', url);
            _httpSession.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (_httpSession, result) => {
                    let bytes = _httpSession.send_and_read_finish(result);
                    let decoder = new TextDecoder('utf-8');
                    let response = decoder.decode(bytes.get_data());
                    const res = JSON.parse(response);
                    const status = res.status;
                    if (status !== 'success') {
                        this.logError('Error getting location: ' + res.message);
                        return;
                    }
                    const ip = res.query;
                    const errorMessage = res.message;
                    const country = res.country;
                    const countryCode = res.countryCode;
                    const region = res.region;
                    const regionName = res.regionName;
                    const city = res.city;
                    const district = res.district;
                    console.log('IP: ' + ip);
                    console.log('Status: ' + status);
                    console.log('Message: ' + errorMessage);
                    console.log('Country: ' + country);
                    console.log('Country Code: ' + countryCode);
                    console.log('Region: ' + region);
                    console.log('Region Name: ' + regionName);
                    console.log('City: ' + city);
                    console.log('District: ' + district);
                    this.app.userSettings.LOCATION = country;
                    this.app.userSettings.IP = ip;
                    this.app.userSettings.COUNTRY = country;
                    this.app.userSettings.COUNTRY_CODE = countryCode;
                    this.app.userSettings.REGION = region;
                    this.app.userSettings.REGION_NAME = regionName;
                    this.app.userSettings.CITY = city;
                    this.app.userSettings.DISTRICT = district;
                    this.app.extension.settings.set_string(
                        'location',
                        `${city}, ${regionName}, ${country}`,
                    );
                    this.history = this.app.database.getHistory();
                    if (!this.history.length || this.history.length < 1) {
                        this.app.database.addToHistory(
                            this.app.gemini.getTuneString('user'),
                            this.app.gemini.getTuneString('model'),
                        );
                    }
                },
            );
        } catch (error) {
            this.logError('Error getting location: ' + error);
        }
        this.app.log('Chat initialized.');
    }

    /**
     * @description add text to the chat
     * @param {string} text - text to add
     * @param {boolean} [speech=true] - speech text
     */
    add(text, speech = true) {
        let chat = this.app.ui.chat.add();
        this.app.ui.chat.box.addMenuItem(chat);
        chat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${text}`,
        );
        this.app.ui.chat.responseChat = chat;
        if (speech) {
            this.app.azure.tts(text);
        }
        this.scrollToBottom();
    }

    /**
     * @description add question to the chat
     * @param {string} text - text to add
     * @param {boolean} [speech=true] - speech text
     */
    addQuestion(text, speech = false) {
        if (!this.isOpen) {
            this.app.ui.chat.addItems();
            this.isOpen = true;
        }
        const inputChat = this.app.ui.chat.question();
        this.app.ui.chat.box.addMenuItem(inputChat);
        text = this.app.utils.questionFormat(text);
        inputChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.USERNAME}:</b> ${text}`,
        );
        this.app.ui.chat.inputChat = inputChat;

        if (speech) {
            this.app.azure.tts(text);
        }
        this.scrollToBottom();
    }

    /**
     * @description edit last question
     * @param {string} text - new text for the question
     * @param {boolean} [speech=true] - speech text
     */
    editQuestion(text, speech = false) {
        let formatedText = this.app.utils.questionFormat(text);
        this.app.ui.chat.inputChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.USERNAME}:</b> ${formatedText}`,
        );
        let response = this.app.utils.extractCodeAndTTS(text);
        if (speech) {
            this.app.azure.tts(response.tts);
        }
        if (response.code) {
            this.app.utils.copyToClipboard(response.code);
            this.app.log('Code copied to clipboard.');
        }
        this.scrollToBottom();
    }

    /**
     * @description add response to the chat
     * @param {string} text - text to add
     * @param {boolean} [speech=true] - speech text
     */
    addResponse(text, speech = false) {
        let responseChat = this.app.ui.chat.response();
        let copyButton = this.app.ui.chat.copy();
        this.app.ui.chat.box.addMenuItem(responseChat);
        this.app.ui.chat.box.addMenuItem(copyButton);
        this.app.ui.chat.box.addMenuItem(this.app.ui.chat.newSeparator);
        const formatedText = this.app.utils.responseFormat(text);
        responseChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${formatedText}`,
        );
        copyButton.connect('activate', (_self) => {
            this.app.utils.copySelectedText(
                this.app.ui.chat.inputChat,
                responseChat,
                copyButton,
            );
        });
        this.app.ui.chat.responseChat = responseChat;

        let response = this.app.utils.extractCodeAndTTS(text);
        if (speech) {
            this.app.azure.tts(response.tts);
        }
        if (response.code) {
            this.app.utils.copyToClipboard(response.code);
            this.app.log('Code copied to clipboard.');
        }
        this.scrollToBottom();
    }

    /**
     * @description edit last response
     * @param {string} text - new text for the response
     * @param {boolean} [speech=true] - speech text
     */
    editResponse(text, speech = true) {
        const formatedText = this.app.utils.responseFormat(text);
        this.app.ui.chat.responseChat.label.clutter_text.set_markup(
            `<b>${this.app.userSettings.ASSIST_NAME}:</b> ${formatedText}`,
        );
        let response = this.app.utils.extractCodeAndTTS(text);
        if (speech) {
            this.app.azure.tts(response.tts);
        } else {
            this.app.ui.chat.resetStatusIcon();
        }
        if (response.code) {
            this.app.utils.copyToClipboard(response.code);
            this.app.log('Code copied to clipboard.');
        }
        this.scrollToBottom();
    }

    scrollToBottom() {
        // Força uma nova disposição do layout
        this.app.ui.chat.responseChat.queue_relayout();

        // Conecta ao sinal que notifica quando o layout estiver pronto
        this.app.ui.chat.responseChat.connect('notify::height', (_self) => {
            // Aguardar o ajuste da rolagem após o próximo loop do evento
            GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
                let vscrollBar = this.app.ui.chat.container.get_vscroll_bar();
                let adjustment = vscrollBar.get_adjustment();

                // Define o valor superior e garante a rolagem até o final
                adjustment.set_value(adjustment.upper - adjustment.page_size);

                return GLib.SOURCE_REMOVE; // Remove o callback após execução
            });
        });
    }
}
