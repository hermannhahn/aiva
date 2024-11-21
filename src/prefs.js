import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ClipboardIndicatorPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // get schema
        window._settings = this.getSettings();
        // create settings ui
        const settingsUI = new AivaSettings(window._settings);
        const page = new Adw.PreferencesPage();
        page.add(settingsUI.generalSettings);
        window.set_default_size(800, 530);
        window.add(page);
    }
}

/**
 * @description Show and edit preferences.
 * @param {object} schema
 */
class AivaSettings {
    constructor(schema) {
        this.schema = schema;

        // Get default values
        const defaultKey = this.schema.get_string('gemini-api-key');
        const defaultSpeechKey = this.schema.get_string('azure-speech-key');
        const defaultRegion = this.schema.get_string('azure-speech-region');
        const defaultLanguage = this.schema.get_string('azure-speech-language');
        const defaultVoice = this.schema.get_string('azure-speech-voice');
        const defaultAssistName = this.schema.get_string('assist-name');
        const defaultLog = this.schema.get_boolean('log-history');
        const defaultUserName = this.schema.get_string('user-name');

        // Local translator
        const _ = (text) => {
            return this.translate(text, defaultLanguage);
        };

        // Page settings
        this.generalSettings = new Adw.PreferencesGroup({
            title: '⚙ ' + _('SETTINGS'),
        });
        this.generalSettingsPage = new Gtk.Grid({
            margin_top: 10,
            margin_bottom: 10,
            margin_start: 10,
            margin_end: 10,
            row_spacing: 10,
            column_spacing: 14,
            column_homogeneous: false,
            row_homogeneous: false,
        });

        // Set AIVA default name if no name is setted
        if (
            defaultAssistName === '' ||
            defaultAssistName === null ||
            defaultAssistName === undefined
        ) {
            console.log(
                '[AIVA] No name setted, setting default name: Aiva, before: ' +
                    defaultAssistName,
            );
            this.schema.set_string('assist-name', 'Aiva');
        }

        // GEMINI API KEY
        const apiKeyLabel = new Gtk.Label({
            label: _('Gemini API Key') + ':',
            halign: Gtk.Align.END,
            css_classes: ['label'],
        });
        const apiKeyIcon = new Gtk.Label({
            label: '🔑',
            halign: Gtk.Align.END,
        });
        const apiKey = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer(),
            halign: Gtk.Align.CENTER,
            placeholder_text: _('Insert your Gemini API key here'),
            width_chars: 40,
        });
        const howToApiKey = new Gtk.LinkButton({
            label: '❓',
            tooltip_text: _('How to get API key?'),
            uri: 'https://console.cloud.google.com/apis/credentials',
            halign: Gtk.Align.START,
            css_classes: ['link-button'],
        });
        const howToApiKeyLabel = howToApiKey.get_child();
        howToApiKeyLabel.set_property('underlined', false);

        // AZURE API KEY
        const speechKeyLabel = new Gtk.Label({
            label: _('Azure Speech API Key') + ':',
            halign: Gtk.Align.END,
            css_classes: ['label'],
        });
        const speechKeyIcon = new Gtk.Label({
            label: '🔑',
            halign: Gtk.Align.END,
        });
        const speechKey = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer(),
            halign: Gtk.Align.CENTER,
            placeholder_text: _('Insert your Azure Speech API key here'),
            width_chars: 40,
        });
        const howToSpeechKey = new Gtk.LinkButton({
            label: '❓',
            tooltip_text: _('How to get API key?'),
            uri: 'https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/get-started-speech-to-text',
            halign: Gtk.Align.START,
            css_classes: ['link-button'],
        });
        const howToSpeechKeyLabel = howToSpeechKey.get_child();
        howToSpeechKeyLabel.set_property('underlined', false);

        // AZURE REGION
        const speechRegionLabel = new Gtk.Label({
            label: _('Azure Speech Region') + ':',
            halign: Gtk.Align.END,
            css_classes: ['label'],
        });
        const speechRegionIcon = new Gtk.Label({
            label: '🗺',
            halign: Gtk.Align.END,
        });
        const speechRegion = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer(),
            halign: Gtk.Align.START,
            placeholder_text: _('e.g.: eastus, westus...'),
            width_chars: 20,
        });

        // AZURE LANGUAGE
        const sysLanguageLabel = new Gtk.Label({
            label: _('Select Language') + ':',
            halign: Gtk.Align.END,
            css_classes: ['label'],
        });
        const sysLanguageIcon = new Gtk.Label({
            label: '🌎',
            halign: Gtk.Align.END,
        });
        const languageSelector = new Gtk.ComboBoxText();
        languageSelector.append('en-US', '🇺🇲 ' + _('English'));
        languageSelector.append('fr-FR', '🇫🇷 ' + _('French'));
        languageSelector.append('de-DE', '🇩🇪 ' + _('German'));
        languageSelector.append('it-IT', '🇮🇹 ' + _('Italian'));
        languageSelector.append('pt-BR', '🇧🇷 ' + _('Portuguese (Brazil)'));
        languageSelector.append('es-ES', '🇪🇸 ' + _('Spanish'));

        // AZURE VOICE
        const voiceLabel = new Gtk.Label({
            label: _('Select Voice') + ':',
            halign: Gtk.Align.END,
        });
        const voiceIcon = new Gtk.Label({
            label: '🗣️',
            halign: Gtk.Align.END,
        });
        const voiceSelector = new Gtk.ComboBoxText();

        // Load voices
        const loadJsonFile = (filename) => {
            let contents;
            const datadir = Gio.File.new_for_path(
                Gio.get_user_data_dir(),
            ).get_path();
            filename = Gio.File.new_for_path(
                datadir + '/' + filename,
            ).get_path();
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

        const voiceOptionsJson = loadJsonFile('voiceOptions.json');
        const voiceOptions = JSON.parse(voiceOptionsJson);

        // Update voice
        const updateVoice = (language) => {
            voiceSelector.remove_all();
            if (voiceOptions[language]) {
                voiceOptions[language].forEach((option) => {
                    voiceSelector.append(option.voice, option.label);
                    if (option.voice === defaultVoice) {
                        voiceSelector.set_active_id(option.voice);
                    }
                });
            }
        };

        // Update on change
        languageSelector.connect('changed', () => {
            const selectedLanguage = languageSelector.get_active_id();
            updateVoice(selectedLanguage);
        });
        updateVoice(defaultLanguage);

        // AIVA NAME
        const assistNameLabel = new Gtk.Label({
            label: _('Assistant Name') + ':',
            halign: Gtk.Align.END,
        });
        const assistNameIcon = new Gtk.Label({
            label: '🤖',
            halign: Gtk.Align.END,
        });
        const assistName = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer(),
            placeholder_text: 'Give your assistant a name',
        });

        // USER NAME
        const userNameLabel = new Gtk.Label({
            label: _('User Name') + ':',
            halign: Gtk.Align.END,
        });
        const userNameIcon = new Gtk.Label({
            label: '👤',
            halign: Gtk.Align.END,
        });
        const userName = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer(),
            placeholder_text: 'Your name or nickname',
        });

        // HISTORY LOG
        const histroyIcon = new Gtk.Label({
            label: '📜',
            halign: Gtk.Align.END,
        });
        const historyButton = new Gtk.CheckButton({
            label: _('Remember talk history'),
            halign: Gtk.Align.START,
        });

        // SAVE BUTTON
        const save = new Gtk.Button({
            label: _('Save') + '  💾',
            halign: Gtk.Align.END,
        });
        const statusLabel = new Gtk.Label({
            label: '',
            useMarkup: true,
            halign: Gtk.Align.END,
        });

        // Set default
        apiKey.set_text(defaultKey);
        speechKey.set_text(defaultSpeechKey);
        speechRegion.set_text(defaultRegion);
        voiceSelector.set_active_id(defaultVoice);
        languageSelector.set_active_id(defaultLanguage);
        assistName.set_text(defaultAssistName);
        userName.set_text(defaultUserName);
        historyButton.set_active(defaultLog);

        // Actions
        save.connect('clicked', () => {
            this.schema.set_string(
                'gemini-api-key',
                apiKey.get_buffer().get_text(),
            );
            this.schema.set_string(
                'azure-speech-key',
                speechKey.get_buffer().get_text(),
            );
            this.schema.set_string(
                'azure-speech-region',
                speechRegion.get_buffer().get_text(),
            );

            // Save selected language
            const selectedLanguage = languageSelector.get_active_id();
            this.schema.set_string('azure-speech-language', selectedLanguage);

            // Save selected voice
            const selectedVoice = voiceSelector.get_active_id();
            this.schema.set_string('azure-speech-voice', selectedVoice);

            // Save history log
            this.schema.set_boolean('log-history', historyButton.get_active());

            // Set assistant name
            this.schema.set_string(
                'assist-name',
                assistName.get_buffer().get_text(),
            );

            // Set user name
            this.schema.set_string(
                'user-name',
                userName.get_buffer().get_text(),
            );

            // test, send dbus request
            this._sendRequest('testing');

            statusLabel.set_markup(_('Your preferences have been saved'));
        });

        // Add to grid
        this.generalSettingsPage.attach(apiKeyLabel, 0, 0, 1, 1);
        this.generalSettingsPage.attach(apiKeyIcon, 1, 0, 1, 1);
        this.generalSettingsPage.attach(apiKey, 2, 0, 1, 1);
        this.generalSettingsPage.attach(howToApiKey, 3, 0, 1, 1);
        this.generalSettingsPage.attach(speechKeyLabel, 0, 1, 1, 1);
        this.generalSettingsPage.attach(speechKeyIcon, 1, 1, 1, 1);
        this.generalSettingsPage.attach(speechKey, 2, 1, 1, 1);
        this.generalSettingsPage.attach(howToSpeechKey, 3, 1, 1, 1);
        this.generalSettingsPage.attach(speechRegionLabel, 0, 2, 1, 1);
        this.generalSettingsPage.attach(speechRegionIcon, 1, 2, 1, 1);
        this.generalSettingsPage.attach(speechRegion, 2, 2, 1, 1);
        this.generalSettingsPage.attach(sysLanguageLabel, 0, 3, 1, 1);
        this.generalSettingsPage.attach(sysLanguageIcon, 1, 3, 1, 1);
        this.generalSettingsPage.attach(languageSelector, 2, 3, 1, 1);
        this.generalSettingsPage.attach(voiceLabel, 0, 4, 1, 1);
        this.generalSettingsPage.attach(voiceIcon, 1, 4, 1, 1);
        this.generalSettingsPage.attach(voiceSelector, 2, 4, 1, 1);
        this.generalSettingsPage.attach(assistNameLabel, 0, 5, 1, 1);
        this.generalSettingsPage.attach(assistNameIcon, 1, 5, 1, 1);
        this.generalSettingsPage.attach(assistName, 2, 5, 1, 1);
        this.generalSettingsPage.attach(userNameLabel, 0, 6, 1, 1);
        this.generalSettingsPage.attach(userNameIcon, 1, 6, 1, 1);
        this.generalSettingsPage.attach(userName, 2, 6, 1, 1);
        this.generalSettingsPage.attach(histroyIcon, 1, 7, 1, 1);
        this.generalSettingsPage.attach(historyButton, 2, 7, 1, 1);
        this.generalSettingsPage.attach(save, 0, 8, 3, 1);
        this.generalSettingsPage.attach(statusLabel, 0, 9, 3, 1);

        this.generalSettings.add(this.generalSettingsPage);
    }

    _sendRequest(request) {
        const connection = Gio.DBus.session;
        console.log('Sending transparency request...');
        // Certifique-se de enviar o valor como string
        request = request.toString();

        connection.call(
            'org.gnome.shell.extensions.aiva', // Nome do bus
            '/org/gnome/shell/extensions/aiva', // Caminho do objeto
            'org.gnome.shell.extensions.aiva', // Interface
            'SetTransparency', // Método
            new GLib.Variant('(s)', [request]), // Argumento como string
            GLib.VariantType.new('(s)'), // Tipo de retorno esperado
            Gio.DBusCallFlags.NONE,
            -1, // Timeout padrão
            null, // Cancellable (não usado aqui)
            (conn, result) => {
                try {
                    conn.call_finish(result);
                    log('Request sent successfully');
                } catch (error) {
                    logError(error, 'Failed to send request');
                }
            },
        );
    }

    translate(text, lang) {
        if (lang === 'pt-BR') {
            if (text === 'Settings:') {
                return 'Preferências:';
            }
            if (text === 'Gemini API Key') {
                return 'Chave da API Gemini';
            }
            if (text === 'How to get API key?') {
                return 'Como obter a chave API?';
            }
            if (text === 'Azure Speech API Key') {
                return 'Chave da API Speech Azure';
            }
            if (text === 'Azure Speech Region') {
                return 'Região da API Speech Azure';
            }
            if (text === 'e.g.: eastus, westus...') {
                return 'Exemplo: eastus, westus...';
            }
            if (text === 'Select Language') {
                return 'Selecione a língua';
            }
            if (text === 'Select Voice') {
                return 'Selecione a voz';
            }
            if (text === 'Assistant Name') {
                return 'Nome do assistente';
            }
            if (text === 'Remember talk history') {
                return 'Lembrar conversas';
            }
            if (text === 'Save') {
                return 'Salvar';
            }
            if (text === 'Your preferences have been saved') {
                return 'Suas preferências foram salvas';
            }
        }
        if (lang === 'es') {
            if (text === 'Settings:') {
                return 'Preferencias:';
            }
            if (text === 'Gemini API Key') {
                return 'Clave de API Gemini';
            }
            if (text === 'How to get API key?') {
                return '¿Cómo obtener la clave de API?';
            }
            if (text === 'Azure Speech API Key') {
                return 'Clave de API de voz de Azure';
            }
            if (text === 'How to get API key?') {
                return '¿Cómo obtener la clave de API?';
            }
            if (text === 'Azure Speech Region') {
                return 'Región de la API de voz de Azure';
            }
            if (text === 'e.g.: eastus, westus...') {
                return 'p. ej.: eastus, westus, ...';
            }
            if (text === 'Select Language') {
                return 'Seleccionar idioma';
            }
            if (text === 'Select Voice') {
                return 'Seleccionar voz';
            }
            if (text === 'Assistant Name') {
                return 'Nombre del asistente';
            }
            if (text === 'Remember talk history') {
                return 'Recordar historial de conversaciones';
            }
            if (text === 'Save') {
                return 'Guardar';
            }
            if (text === 'Your preferences have been saved') {
                return 'Sus preferencias se han guardado';
            }
        }
        if (lang === 'fr') {
            if (text === 'Settings:') {
                return 'Paramètres:';
            }
            if (text === 'Gemini API Key') {
                return 'Clé API Gemini';
            }
            if (text === 'How to get API key?') {
                return 'Comment obtenir une clé API ?';
            }
            if (text === 'Azure Speech API Key') {
                return 'Clé API Azure Speech';
            }
            if (text === 'How to get API key?') {
                return 'Comment obtenir une clé API ?';
            }
            if (text === 'Azure Speech Region') {
                return 'Région de l’API Azure Speech';
            }
            if (text === 'e.g.: eastus, westus...') {
                return 'p. ex. : estus, ouestus, etc.';
            }
            if (text === 'Select Language') {
                return 'Sélectionner la langue';
            }
            if (text === 'Select Voice') {
                return 'Sélectionner la voix';
            }
            if (text === 'Assistant Name') {
                return 'Nom de l’assistant';
            }
            if (text === 'Remember talk history') {
                return 'Se souvenir de l’historique des conversations';
            }
            if (text === 'Save') {
                return 'Enregistrer';
            }
            if (text === 'Your preferences have been saved') {
                return 'Vos préférences ont été enregistrées';
            }
        }
        if (lang === 'de-DE') {
            if (text === 'Settings:') {
                return 'Einstellungen:';
            }
            if (text === 'Gemini API Key') {
                return 'Gemini-API-Schlüssel';
            }
            if (text === 'How to get API key?') {
                return 'Wie API-Schlüssel erhalten?';
            }
            if (text === 'Azure Speech API Key') {
                return 'Azure Speech-API-Schlüssel';
            }
            if (text === 'How to get API key?') {
                return 'Wie API-Schlüssel erhalten?';
            }
            if (text === 'Azure Speech Region') {
                return 'Azure Speech-API-Region';
            }
            if (text === 'e.g.: eastus, westus...') {
                return 'z. B.: eastus, westus, ...';
            }
            if (text === 'Select Language') {
                return 'Sprache auswählen';
            }
            if (text === 'Select Voice') {
                return 'Stimme auswählen';
            }
            if (text === 'Assistant Name') {
                return 'Name des Assistenten';
            }
            if (text === 'Remember talk history') {
                return 'Konversationsverlauf speichern';
            }
            if (text === 'Save') {
                return 'Speichern';
            }
            if (text === 'Your preferences have been saved') {
                return 'Ihre Einstellungen wurden gespeichert';
            }
        }

        return text;
    }
}
