import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ClipboardIndicatorPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();
        const settingsUI = new AivaSettings(window._settings);
        const page = new Adw.PreferencesPage();
        page.add(settingsUI.generalSettings);
        // Set window size to 800x530
        window.set_default_size(800, 530);
        window.add(page);
    }
}

class AivaSettings {
    constructor(schema) {
        this.schema = schema;

        const defaultKey = this.schema.get_string('gemini-api-key');
        const defaultSpeechKey = this.schema.get_string('azure-speech-key');
        const defaultRegion = this.schema.get_string('azure-speech-region');
        const defaultLanguage = this.schema.get_string('azure-speech-language');
        const defaultVoice = this.schema.get_string('azure-speech-voice');
        const defaultAssistName = this.schema.get_string('assist-name');
        const defaultLog = this.schema.get_boolean('log-history');

        const _ = (text) => {
            return this.translations(text, defaultLanguage);
        };

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

        // Set Gemini default name if no name is setted
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
            label: '📍',
            halign: Gtk.Align.END,
        });
        const speechRegion = new Gtk.Entry({
            buffer: new Gtk.EntryBuffer(),
            halign: Gtk.Align.START,
            placeholder_text: _('e.g.: eastus, westus...'),
            width_chars: 20,
        });

        // AZURE LANGUAGE (ComboBoxText) to lang options
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

        // AZURE VOICE (ComboBoxText) to voice selection
        const voiceLabel = new Gtk.Label({
            label: _('Select Voice') + ':',
            halign: Gtk.Align.END,
        });
        const voiceIcon = new Gtk.Label({
            label: '🗣️',
            halign: Gtk.Align.END,
        });
        const voiceSelector = new Gtk.ComboBoxText();

        // Voice options
        const voiceOptions = {
            'en-US': [
                {
                    voice: 'en-US-AvaNeural',
                    label: 'Ava Neural',
                },
                {
                    voice: 'en-US-AndrewNeural',
                    label: 'Andrew Neural',
                },
                {
                    voice: 'en-US-EmmaNeural',
                    label: 'Emma Neural',
                },
                {
                    voice: 'en-US-BrianNeural',
                    label: 'Brian Neural',
                },
                {
                    voice: 'en-US-JennyNeural',
                    label: 'Jenny Neural',
                },
                {
                    voice: 'en-US-GuyNeural',
                    label: 'Guy Neural',
                },
                {
                    voice: 'en-US-AriaNeural',
                    label: 'Aria Neural',
                },
                {
                    voice: 'en-US-DavisNeural',
                    label: 'Davis Neural',
                },
                {
                    voice: 'en-US-JaneNeural',
                    label: 'Jane Neural',
                },
                {
                    voice: 'en-US-JasonNeural',
                    label: 'Jason Neural',
                },
                {
                    voice: 'en-US-SaraNeural',
                    label: 'Sara Neural',
                },
                {
                    voice: 'en-US-TonyNeural',
                    label: 'Tony Neural',
                },
                {
                    voice: 'en-US-NancyNeural',
                    label: 'Nancy Neural',
                },
                {
                    voice: 'en-US-AmberNeural',
                    label: 'Amber Neural',
                },
                {
                    voice: 'en-US-AnaNeural',
                    label: 'Ana Neural',
                },
                {
                    voice: 'en-US-AshleyNeural',
                    label: 'Ashley Neural',
                },
                {
                    voice: 'en-US-BrandonNeural',
                    label: 'Brandon Neural',
                },
                {
                    voice: 'en-US-ChristopherNeural',
                    label: 'Christopher Neural',
                },
                {
                    voice: 'en-US-CoraNeural',
                    label: 'Cora Neural',
                },
                {
                    voice: 'en-US-ElizabethNeural',
                    label: 'Elizabeth Neural',
                },
                {
                    voice: 'en-US-EricNeural',
                    label: 'Eric Neural',
                },
                {
                    voice: 'en-US-JacobNeural',
                    label: 'Jacob Neural',
                },
                {
                    voice: 'en-US-JennyMultilingualNeural',
                    label: 'Jenny Multilingual Neural (4x)',
                },
                {
                    voice: 'en-US-MichelleNeural',
                    label: 'Michelle Neural',
                },
                {
                    voice: 'en-US-MonicaNeural',
                    label: 'Monica Neural',
                },
                {
                    voice: 'en-US-RogerNeural',
                    label: 'Roger Neural',
                },
                {
                    voice: 'en-US-RyanMultilingualNeural',
                    label: 'Ryan Multilingual Neural (4x)',
                },
                {
                    voice: 'en-US-SteffanNeural',
                    label: 'Steffan Neural',
                },
                {
                    voice: 'en-US-AdamMultilingualNeural',
                    label: 'Adam Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-AIGenerate1Neural',
                    label: 'AIGenerate 1 Neural (1x)',
                },
                {
                    voice: 'en-US-AIGenerate2Neural',
                    label: 'AIGenerate 2 Neural (1x)',
                },
                {
                    voice: 'en-US-AlloyTurboMultilingualNeural',
                    label: 'Alloy Turbo Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-AmandaMultilingualNeural',
                    label: 'Amanda Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-BlueNeural',
                    label: 'Blue Neural (1)',
                },
                {
                    voice: 'en-US-BrandonMultilingualNeural',
                    label: 'Brandon Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-ChristopherMultilingualNeural',
                    label: 'Christopher Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-CoraMultilingualNeural',
                    label: 'Cora Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-DavisMultilingualNeural',
                    label: 'Davis Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-DerekMultilingualNeural',
                    label: 'Derek Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-DustinMultilingualNeural',
                    label: 'Dustin Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-EvelynMultilingualNeural',
                    label: 'Evelyn Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-KaiNeural',
                    label: 'Kai Neural (1x)',
                },
                {
                    voice: 'en-US-LewisMultilingualNeural',
                    label: 'Lewis Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-LolaMultilingualNeural',
                    label: 'Lola Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-LunaNeural',
                    label: 'Luna Neural (1x)',
                },
                {
                    voice: 'en-US-NancyMultilingualNeural',
                    label: 'Nancy Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-NovaTurboMultilingualNeural',
                    label: 'Nova Turbo Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-PhoebeMultilingualNeural',
                    label: 'Phoebe Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-SamuelMultilingualNeural',
                    label: 'Samuel Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-SerenaMultilingualNeural',
                    label: 'Serena Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-SteffanMultilingualNeural',
                    label: 'Steffan Multilingual Neural (1.4x)',
                },
                {
                    voice: 'en-US-AvaMultilingualNeural',
                    label: 'Ava Multilingual Neural (4x)',
                },
                {
                    voice: 'en-US-AndrewMultilingualNeural',
                    label: 'Andrew Multilingual Neural (4x)',
                },
                {
                    voice: 'en-US-EmmaMultilingualNeural',
                    label: 'Emma Multilingual Neural (4x)',
                },
                {
                    voice: 'en-US-BrianMultilingualNeural',
                    label: 'Brian Multilingual Neural (4x)',
                },
                {
                    voice: 'en-US-AlloyMultilingualNeural',
                    label: 'Alloy Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-EchoMultilingualNeural',
                    label: 'Echo Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-FableMultilingualNeural',
                    label: 'Fable Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-OnyxMultilingualNeural',
                    label: 'Onyx Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-NovaMultilingualNeural',
                    label: 'Nova Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-ShimmerMultilingualNeural',
                    label: 'Shimmer Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-AlloyMultilingualNeuralHD',
                    label: 'Alloy Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-EchoMultilingualNeuralHD',
                    label: 'Echo Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-FableMultilingualNeuralHD',
                    label: 'Fable Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-OnyxMultilingualNeuralHD',
                    label: 'Onyx Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-NovaMultilingualNeuralHD',
                    label: 'Nova Multilingual Neural HD (5x)',
                },
                {
                    voice: 'en-US-ShimmerMultilingualNeuralHD',
                    label: 'Shimmer Multilingual Neural HD (5x)',
                },
            ],
            'pt-BR': [
                {
                    voice: 'pt-BR-FranciscaNeural',
                    label: 'Francisca Neural',
                },
                {
                    voice: 'pt-BR-AntonioNeural',
                    label: 'Antonio Neural',
                },
                {
                    voice: 'pt-BR-BrendaNeural',
                    label: 'Brenda Neural',
                },
                {
                    voice: 'pt-BR-DonatoNeural',
                    label: 'Donato Neural',
                },
                {
                    voice: 'pt-BR-ElzaNeural',
                    label: 'Elza Neural',
                },
                {
                    voice: 'pt-BR-FabioNeural',
                    label: 'Fabio Neural',
                },
                {
                    voice: 'pt-BR-GiovannaNeural',
                    label: 'Giovanna Neural',
                },
                {
                    voice: 'pt-BR-HumbertoNeural',
                    label: 'Humberto Neural',
                },
                {
                    voice: 'pt-BR-JulioNeural',
                    label: 'Julio Neural',
                },
                {
                    voice: 'pt-BR-LeilaNeural',
                    label: 'Leila Neural',
                },
                {
                    voice: 'pt-BR-LeticiaNeural',
                    label: 'Leticia Neural',
                },
                {
                    voice: 'pt-BR-ManuelaNeural',
                    label: 'Manuela Neural',
                },
                {
                    voice: 'pt-BR-NicolauNeural',
                    label: 'Nicolau Neural',
                },
                {
                    voice: 'pt-BR-ThalitaNeural',
                    label: 'Thalita Neural',
                },
                {
                    voice: 'pt-BR-ValerioNeural',
                    label: 'Valerio Neural',
                },
                {
                    voice: 'pt-BR-YaraNeural',
                    label: 'Yara Neural',
                },
                {
                    voice: 'pt-BR-MacerioMultilingualNeural',
                    label: 'Macerio Multilingual Neural (1.4x)',
                },
                {
                    voice: 'pt-BR-ThalitaMultilingualNeural',
                    label: 'Thalita Multilingual Neural (1.4x)',
                },
            ],
            'es-ES': [
                {
                    voice: 'es-ES-ElviraNeural',
                    label: 'Elvira Neural',
                },
                {
                    voice: 'es-ES-AlvaroNeural',
                    label: 'Alvaro Neural',
                },
                {
                    voice: 'es-ES-AbrilNeural',
                    label: 'Abril Neural',
                },
                {
                    voice: 'es-ES-ArnauNeural',
                    label: 'Arnau Neural',
                },
                {
                    voice: 'es-ES-DarioNeural',
                    label: 'Dario Neural',
                },
                {
                    voice: 'es-ES-EliasNeural',
                    label: 'Elias Neural',
                },
                {
                    voice: 'es-ES-EstrellaNeural',
                    label: 'Estrella Neural',
                },
                {
                    voice: 'es-ES-IreneNeural',
                    label: 'Irene Neural',
                },
                {
                    voice: 'es-ES-LaiaNeural',
                    label: 'Laia Neural',
                },
                {
                    voice: 'es-ES-LiaNeural',
                    label: 'Lia Neural',
                },
                {
                    voice: 'es-ES-NilNeural',
                    label: 'Nil Neural',
                },
                {
                    voice: 'es-ES-SaulNeural',
                    label: 'Saul Neural',
                },
                {
                    voice: 'es-ES-TeoNeural',
                    label: 'Teo Neural',
                },
                {
                    voice: 'es-ES-TrianaNeural',
                    label: 'Triana Neural',
                },
                {
                    voice: 'es-ES-VeraNeural',
                    label: 'Vera Neural',
                },
                {
                    voice: 'es-ES-XimenaNeural',
                    label: 'Ximena Neural',
                },
                {
                    voice: 'es-ES-ArabellaMultilingualNeural',
                    label: 'Arabella Multilingue Neural (1.4x)',
                },
                {
                    voice: 'es-ES-IsidoraMultilingualNeural',
                    label: 'Isidora Multilingue Neural (1.4x)',
                },
                {
                    voice: 'es-ES-TristanMultilingualNeural',
                    label: 'Tristan Multilingue Neural (1.4x)',
                },
                {
                    voice: 'es-ES-XimenaMultilingualNeural',
                    label: 'Ximena Multilingue Neural (1.4x)',
                },
            ],
            'fr-FR': [
                {
                    voice: 'fr-FR-DeniseNeural',
                    label: 'Denise Neural',
                },
                {
                    voice: 'fr-FR-HenriNeural',
                    label: 'Henri Neural',
                },
                {
                    voice: 'fr-FR-AlainNeural',
                    label: 'Alain Neural',
                },
                {
                    voice: 'fr-FR-BrigitteNeural',
                    label: 'Brigitte Neural',
                },
                {
                    voice: 'fr-FR-CelesteNeural',
                    label: 'Celeste Neural',
                },
                {
                    voice: 'fr-FR-ClaudeNeural',
                    label: 'Claude Neural',
                },
                {
                    voice: 'fr-FR-CoralieNeural',
                    label: 'Coralie Neural',
                },
                {
                    voice: 'fr-FR-EloiseNeural',
                    label: 'Eloise Neural',
                },
                {
                    voice: 'fr-FR-JacquelineNeural',
                    label: 'Jacqueline Neural',
                },
                {
                    voice: 'fr-FR-JeromeNeural',
                    label: 'Jerome Neural',
                },
                {
                    voice: 'fr-FR-JosephineNeural',
                    label: 'Josephine Neural',
                },
                {
                    voice: 'fr-FR-MauriceNeural',
                    label: 'Maurice Neural',
                },
                {
                    voice: 'fr-FR-RemyMultilingualNeural',
                    label: 'Remy Multilingue Neural (4x)',
                },
                {
                    voice: 'fr-FR-VivienneMultilingualNeural',
                    label: 'Vivienne Multilingue Neural (4x)',
                },
                {
                    voice: 'fr-FR-YvesNeural',
                    label: 'Yves Neural',
                },
                {
                    voice: 'fr-FR-YvetteNeural',
                    label: 'Yvette Neural',
                },
                {
                    voice: 'fr-FR-LucienMultilingualNeural',
                    label: 'Lucien Multilingue Neural (1.4x)',
                },
            ],
        };

        // Update voice
        const updateVoices = (language) => {
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
            updateVoices(selectedLanguage);
        });
        updateVoices(defaultLanguage);

        // AIVA Name
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

        // HISTORY LOG
        const histroyIcon = new Gtk.Label({
            label: '📜',
            halign: Gtk.Align.END,
        });
        const historyButton = new Gtk.CheckButton({
            label: _('Remember talk history'),
            halign: Gtk.Align.START,
        });

        const blankLine = new Gtk.Label({
            label: ' ',
            halign: Gtk.Align.END,
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

            // Save assistant name
            this.schema.set_string(
                'assist-name',
                assistName.get_buffer().get_text(),
            );

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
        this.generalSettingsPage.attach(histroyIcon, 1, 6, 1, 1);
        this.generalSettingsPage.attach(historyButton, 2, 6, 1, 1);
        this.generalSettingsPage.attach(blankLine, 0, 7, 4, 1);
        this.generalSettingsPage.attach(save, 0, 8, 4, 1);
        this.generalSettingsPage.attach(statusLabel, 0, 9, 4, 1);
    }

    translations(text, lang) {
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
}
