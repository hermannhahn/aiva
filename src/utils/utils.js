import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import Pango from 'gi://Pango';
import PangoCairo from 'gi://PangoCairo';
import Cairo from 'gi://cairo';
import Soup from 'gi://Soup';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import {convertMD} from './md2pango.js';

/**
 * @description app utilities
 * @example
 *
 * public function
 * questionFormat(text) - return formatted string
 * responseFormat(text) - return formatted string
 * scrollToBottom() - roll scroll to bottom
 * addToHistory(question, response) - add to history
 * loadHistoryFile() - return history array
 * gnomeNotify(text, type) - send gnome notification
 * removeNotificationByTitle(title) - remove gnome notification
 * copySelectedText(responseChat, copyButton) - copy full or selected text
 * randomPhraseToShowOnScreen() - return random prhase to long responses
 * randomPhraseToWaitResponse() - return random phrase to wait for response
 * encodeFileToBase64(path) - convert file to base64
 * extractCodeAndTTS(text, lang) - return text to speech and code example
 * executeCommand(cmd) - run terminal cmd
 * removeWavFiles() - remove temporary wav files
 * curl(url) - return curl response
 *
 * private function
 * _insertLineBreaks(text, maxWidth, font) - insert line breaks
 * _createHistoryFile() - create history file
 * _saveHistory() - save history file
 */
export class Utils {
    constructor(app) {
        this.app = app;
        this._pangoConvert = convertMD;
        this.app.log('Utils loaded.');
    }

    /**
     *
     * @param {*} text
     * @returns
     *
     * @description // Format input chat
     */
    questionFormat(text) {
        text = this._pangoConvert(text);
        // text = this._insertLineBreaks(text);
        text = text
            .replace(/&/g, '\u0026')
            .replace(/</g, '\u003c')
            .replace(/>/g, '\u003e')
            .replace(/"/g, '\u0022')
            .replace(/'/g, '\u0027')
            .replace(/`/g, '\u0060')
            .replace(/:/g, '\u003a')
            .replace(/;/g, '\u003b');
        // text = text
        //     .replace(/&/g, '&amp;')
        //     .replace(/</g, '&lt;')
        //     .replace(/>/g, '&gt;')
        //     .replace(/"/g, '&quot;')
        //     .replace(/'/g, '&apos;')
        //     .replace(/`/g, '&#96;')
        //     .replace(/:/g, '&#58;')
        //     .replace(/;/g, '&#59;');
        return text;
    }

    responseFormat(text) {
        text = this._pangoConvert(text);
        // text = this._insertLineBreaks(text);
        return text;
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

    addToHistory(userQuestion, aiResponse) {
        if (this.app.userSettings.RECURSIVE_TALK) {
            this.app.chat.history.push({
                role: 'user',
                parts: [
                    {
                        text: userQuestion,
                    },
                ],
            });
            this.app.chat.history.push({
                role: 'model',
                parts: [
                    {
                        text: aiResponse,
                    },
                ],
            });
            this._saveHistory();
        }
    }

    // Load history file
    loadHistoryFile() {
        let chatHistory = [];
        // Reset chatHistory if RECURSIVE_TALK is disabled
        if (this.app.userSettings.RECURSIVE_TALK === false) {
            this.app.log(
                `History reset to empty array: ${this.app.userSettings.HISTORY_FILE}`,
            );
            return chatHistory;
        }

        if (
            GLib.file_test(
                this.app.userSettings.HISTORY_FILE,
                GLib.FileTest.IS_REGULAR,
            )
        ) {
            try {
                let file = Gio.File.new_for_path(
                    this.app.userSettings.HISTORY_FILE,
                );
                let [, contents] = file.load_contents(null);

                // Decodifica contents de Uint8Array para string
                let decodedContents = new TextDecoder().decode(contents);

                // Parse JSON
                chatHistory = JSON.parse(decodedContents);
                this.app.log(
                    `History loaded from: ${this.app.userSettings.HISTORY_FILE}`,
                );

                return chatHistory;
            } catch (e) {
                logError(
                    e,
                    `Failed to load history: ${this.app.userSettings.HISTORY_FILE}`,
                );
                return [];
            }
        } else {
            return this._createHistoryFile();
        }
    }

    gnomeNotify(text, type = 'normal') {
        const command =
            'notify-send --urgency=' +
            type +
            ' -a "AI Voice Assistant" ' +
            text;
        this.executeCommand(command);
    }

    copyToClipboard(text) {
        this.app.extension.clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
    }

    copySelectedText(responseChat, copyButton) {
        let selectedText = responseChat.label.clutter_text.get_selection();
        if (selectedText) {
            this.app.extension.clipboard.set_text(
                St.ClipboardType.CLIPBOARD,
                // Get text selection
                selectedText,
            );
            // Create label
            if (copyButton) {
                copyButton.label.clutter_text.set_markup(
                    _('[ Selected Copied ]'),
                );
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
                    copyButton.label.clutter_text.set_markup('');
                    return false; // Para garantir que o timeout execute apenas uma vez
                });
            }
        } else {
            this.app.extension.clipboard.set_text(
                St.ClipboardType.CLIPBOARD,
                // Get text selection
                responseChat.label.text,
            );
            if (copyButton) {
                copyButton.label.clutter_text.set_markup(_('[ Copied ]'));
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
                    copyButton.label.clutter_text.set_markup('');
                    return false; // Para garantir que o timeout execute apenas uma vez
                });
            }
            this.app.log(`Texto copiado: ${responseChat.label.text}`);
        }
    }

    fetchRSS(url) {
        return new Promise((resolve, reject) => {
            let session = new Soup.Session();
            let message = Soup.Message.new('GET', url);

            // Envia a requisição de forma assíncrona e lê a resposta
            session.send_and_read_async(
                message,
                GLib.PRIORITY_DEFAULT,
                null,
                (session, res) => {
                    try {
                        let responseBytes = session.send_and_read_finish(res);
                        let responseText = new TextDecoder('utf-8').decode(
                            responseBytes.get_data(),
                        );

                        // Extrai as 10 primeiras notícias usando regex
                        let newsItems = [];
                        let itemRegex = /<item>(.*?)<\/item>/g;
                        let match;

                        while (
                            (match = itemRegex.exec(responseText)) !== null &&
                            newsItems.length < 10
                        ) {
                            let itemContent = match[1];

                            let titleMatch = /<title>(.*?)<\/title>/.exec(
                                itemContent,
                            );
                            let title = titleMatch ? titleMatch[1] : 'No title';

                            newsItems.push(title);
                        }
                        resolve(newsItems);
                    } catch (error) {
                        reject(
                            new Error(
                                `Failed to complete request: ${error.message}`,
                            ),
                        );
                    }
                },
            );
        });
    }

    // Exemplo de uso da função
    async readNews(topic = undefined) {
        try {
            let url = '';
            const lang = this.app.userSettings.AZURE_SPEECH_LANGUAGE;
            const countryLang = lang.split('-')[1];
            if (topic !== undefined) {
                url = `https://news.google.com/rss/search?q=${topic}&hl=${lang}&gl=${countryLang}&ceid=${countryLang}`;
                this.app.chat.editResponse(_('Of course, searching...'));
            } else {
                url = `https://news.google.com/rss?hl=${lang}&gl=${countryLang}&ceid=${countryLang}`;
                this.app.chat.editResponse(_('Sure, searching...'));
            }
            const fetchNews = await this.fetchRSS(url);
            const stringNews = JSON.stringify(fetchNews, null, 2);
            const preFormattedNews = stringNews
                .replace(/",/g, '\n')
                .replace(/"/g, '')
                .replace(/\[/g, '')
                .replace(/\]/g, '');

            const news = this.swapNewspaperAndNews(preFormattedNews);
            this.app.chat.editResponse(
                `${_('Here are the main news')}:\n\n` + news,
            );
        } catch (error) {
            this.app.log(`Error fetching news: ${error}`);
            this.app.chat.editResponse(
                _("Sorry, I'm having connection trouble. Please try again."),
            );
        }
    }

    swapNewspaperAndNews(newsString) {
        const newsArray = newsString.split('\n');
        for (let i = 0; i < newsArray.length; i++) {
            const [news, newspaper] = newsArray[i].split(' - ');
            if (news !== undefined && newspaper !== undefined) {
                newsArray[i] = `<b>${newspaper}</b>:${news}`;
            }
        }
        return newsArray.join('\n');
    }

    removeNotificationByTitle(title) {
        // Obtenha todas as notificações ativas
        // eslint-disable-next-line no-unused-vars
        let [stdout, stderr, status] =
            GLib.spawn_command_line_async('notify-send -l');
        let notifications = stdout.toString().split('\n');

        // Pesquise a notificação com o título fornecido
        for (let i = 0; i < notifications.length; i++) {
            let notification = notifications[i];
            if (notification.includes(title)) {
                // Obtenha o ID da notificação
                let notificationId = notification.split('\t')[0];
                // Remova a notificação
                GLib.spawn_command_line_async(
                    'notify-send -c ' + notificationId,
                );
                break;
            }
        }
    }

    randomPhraseToShowOnScreen() {
        const phrases = [
            _('I will show it on screen.'),
            _('Displaying now.'),
            _('Here it is on screen.'),
            _('Showing on screen.'),
            _('On the screen now.'),
        ];

        const randomPhrase =
            phrases[Math.floor(Math.random() * phrases.length)];
        return randomPhrase;
    }

    randomPhraseToWaitResponse() {
        const phrases = [
            _('Thinking...'),
            _('Let me see...'),
            _('Just a moment...'),
            _('Hmm, let me think about that...'),
            _('Give me a second...'),
            _('Let me check...'),
            _('Working on it...'),
            _('Hold on a sec...'),
            _('One moment, please...'),
            _('Let me figure this out...'),
            _("I'll get back to you in a sec..."),
            _('Just thinking this through...'),
            _("Let's see what I can find..."),
            _('Give me a moment to process this...'),
            _('Let me look into that...'),
            _("I'm on it..."),
            _("I'll need a moment for that..."),
            _('Let me dig deeper...'),
            _("I'm thinking it over..."),
            _('Give me a moment to sort this out...'),
        ];

        const randomPhrase =
            phrases[Math.floor(Math.random() * phrases.length)];
        return randomPhrase;
    }

    // Função para converter arquivo de áudio em base64
    encodeFileToBase64(filePath) {
        try {
            const file = Gio.File.new_for_path(filePath);
            const [, contents] = file.load_contents(null);
            return GLib.base64_encode(contents);
        } catch (error) {
            this.app.log('Erro ao ler o arquivo: ' + error);
            return null;
        }
    }

    readClipboardText() {
        return new Promise((resolve, reject) => {
            this.app.extension.clipboard.get_text(
                St.ClipboardType.CLIPBOARD,
                (clipboard, result) => {
                    if (result) {
                        let clipboardText = result;
                        this.app.log('Clipboard: ' + clipboardText);
                        this.app.azure.tts(
                            clipboardText + '\n ' + _('Leitura finalizada!'),
                        );
                        resolve(clipboardText);
                    } else {
                        this.app.log(_('Failed to get text from clipboard'));
                        this.app.chat.editResponse(
                            _('Failed to get text from clipboard'),
                        );
                        reject(new Error('Failed to get text from clipboard'));
                    }
                },
            );
        });
    }

    /**
     *
     * @param {string} text
     * @returns {object} { code, tts }
     */
    extractCodeAndTTS(text) {
        const getTTS = (tts) => {
            tts = text.split('*').join('');
            tts = tts
                .replace(/&/g, '')
                .replace(/</g, '')
                .replace(/>/g, '')
                .replace(/`{3}/g, '')
                .replace(/<code>/g, '') // Remove open <code> tags
                .replace(/<\/code>/g, '') // Remove tags close </code> tags
                .replace(/\[red\](.*?)\[\/red\]/g, '')
                .replace(/\[green\](.*?)\[\/green\]/g, '')
                .replace(/\[yellow\](.*?)\[\/yellow\]/g, '')
                .replace(/\[cyan\](.*?)\[\/cyan\]/g, '')
                .replace(/\[white\](.*?)\[\/white\]/g, '')
                .replace(/\[black\](.*?)\[\/black\]/g, '')
                .replace(/\[gray\](.*?)\[\/gray\]/g, '')
                .replace(/\[brown\](.*?)\[\/brown\]/g, '')
                .replace(/\[blue\](.*?)\[\/blue\]/g, '')
                .replace(/\[(.*?)\]\((.*?)\)/g, '') // Remove links from tts
                .replace(/https?:\/\/[^\s"]*/g, '');

            return tts;
        };

        // If tts is more then 2000 characters, change tts text
        // if (tts.length > 2000) {
        //     tts = this.randomPhraseToShowOnScreen();
        // }

        // Search for code example
        const regex = /`{3}([\s\S]*?)`{3}/;
        const match = text.match(regex);

        if (match) {
            // If found more match, add to code result
            let code = match[1];
            let nextMatch = text.match(regex);
            while (nextMatch) {
                code += nextMatch[1];
                text = text.replace(nextMatch[0], '');
                nextMatch = text.match(regex);
            }
            this.app.log('code detected!');
            // remove code from tts
            let tts = text.replace(match[0], '');
            tts = getTTS(tts);

            return {code, tts};
        } else {
            // If not
            let tts = getTTS(text);
            this.app.log('code not detected!');
            return {code: null, tts};
        }
    }

    /**
     *
     * @param {*} cmd
     *
     * execute command
     */
    executeCommand(cmd) {
        const command = cmd;
        const process = GLib.spawn_async(
            null, // pasta de trabalho
            ['/bin/sh', '-c', command], // comando e argumentos
            null, // opções
            GLib.SpawnFlags.SEARCH_PATH, // flags
            null, // PID
        );

        if (process) {
            this.app.log(`Executing command: ${command}`);
        } else {
            this.app.log('Error executing command.');
        }
    }

    /**
     * remove all .wav files from /tmp folder
     */
    removeWavFiles() {
        this.app.log('Removing all .wav files from /tmp folder');
        const command = 'rm -rf /tmp/*gva*.wav';
        const process = GLib.spawn_async(
            null, // pasta de trabalho
            ['/bin/sh', '-c', command], // comando e argumentos
            null, // opções
            GLib.SpawnFlags.SEARCH_PATH, // flags
            null, // PID
        );

        if (process) {
            this.app.log('Wav files removed successfully.');
        } else {
            this.app.log('Error removing wav files.');
        }
    }

    curl(url) {
        // Get IP
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
                return res;
            },
        );
    }

    // insert line break at 730px, font Courier New, size 14px
    _insertLineBreaks(text, maxWidth = 700, font = 'Monospace 14') {
        // Cria uma superfície temporária e contexto Cairo para medir o texto
        const surface = new Cairo.ImageSurface(Cairo.Format.ARGB32, 0, 0);
        const cairoContext = new Cairo.Context(surface);

        // Obtém o contexto Pango a partir do contexto Cairo
        const layout = PangoCairo.create_layout(cairoContext);
        layout.set_font_description(Pango.FontDescription.from_string(font));

        let lines = [];
        let currentLine = '';

        for (let word of text.split(' ')) {
            // Adiciona a palavra à linha de teste
            let testLine = currentLine ? currentLine + ' ' + word : word;
            layout.set_text(testLine, -1);

            // Obtém o tamanho da linha em pixels
            let [, logical] = layout.get_pixel_extents();

            if (logical.width > maxWidth) {
                // Adiciona a linha atual à lista de linhas e inicia uma nova linha
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        // Adiciona a última linha
        lines.push(currentLine);

        return lines.join('\n');
    }

    _historyInitContent() {
        let initContent = [];
        initContent.push({
            role: 'user',
            parts: [
                {
                    text: this.app.gemini.getTuneString(),
                },
            ],
        });
        initContent.push({
            role: 'model',
            parts: [
                {
                    text:
                        _('Hi! I am') +
                        ' ' +
                        this.app.userSettings.ASSIST_NAME +
                        _(', your helpfull assistant.'),
                },
            ],
        });
        return initContent;
    }

    // Create history.json file if not exist
    _createHistoryFile() {
        if (
            !GLib.file_test(
                this.app.userSettings.HISTORY_FILE,
                GLib.FileTest.IS_REGULAR,
            )
        ) {
            try {
                let initialContent = JSON.stringify(
                    this._historyInitContent(),
                    null,
                    2,
                );
                GLib.file_set_contents(
                    this.app.userSettings.HISTORY_FILE,
                    initialContent,
                );
                this.app.log(
                    `History file created. : ${this.app.userSettings.HISTORY_FILE}`,
                );
                return this.loadHistoryFile();
            } catch (e) {
                logError(
                    e,
                    `Failed to create file: ${this.app.userSettings.HISTORY_FILE}`,
                );
                return [];
            }
        }
        return this.loadHistoryFile();
    }

    // Save to history file
    _saveHistory() {
        try {
            GLib.file_set_contents(
                this.app.userSettings.HISTORY_FILE,
                JSON.stringify(this.app.chat.history, null, 2),
            );
            this.app.log(
                `History saved in: ${this.app.userSettings.HISTORY_FILE}`,
            );
        } catch (e) {
            logError(
                e,
                `Failed to save history: ${this.app.userSettings.HISTORY_FILE}`,
            );
        }
    }

    findCategoryInArrays(string, commands) {
        for (const category in commands) {
            for (let i = 0; i < commands[category].length; i++) {
                if (string.includes(commands[category][i])) {
                    // remove category from string
                    string = string.replace(commands[category][i], '');
                    return {type: category, request: string};
                }
            }
        }
        return false;
    }

    loadJsonFile = (filename) => {
        let contents;
        const datadir = Gio.File.new_for_path(
            Gio.get_user_data_dir(),
        ).get_path();
        filename = Gio.File.new_for_path(datadir + '/' + filename).get_path();
        try {
            contents = Gio.File.new_for_path(filename)
                .load_contents(null)[1]
                .toString();
        } catch (e) {
            logError(e);
            return null;
        }

        return contents;
    };

    adjustColor(rgbString, mode = 'darken', factor = 0.8, alpha = 1.0) {
        // Split the RGB string into its component parts.
        const [r, g, b] = rgbString
            .split(',')
            .map((v) => parseInt(v.trim(), 10));

        // Adjust the brightness based on the mode.
        let adjustFactor = mode === 'lighten' ? 1 / factor : factor;

        const rAdjusted = Math.min(
            255,
            Math.max(0, Math.floor(r * adjustFactor)),
        );
        const gAdjusted = Math.min(
            255,
            Math.max(0, Math.floor(g * adjustFactor)),
        );
        const bAdjusted = Math.min(
            255,
            Math.max(0, Math.floor(b * adjustFactor)),
        );

        // Combine the adjusted components into an RGBA string.
        const rgbaString = `rgba(${rAdjusted}, ${gAdjusted}, ${bAdjusted}, ${alpha})`;

        return rgbaString;
    }
}
