export class Open {
    constructor(app) {
        this.app = app;
    }

    _getSoftwareName(text) {
        // Get software name
        const softwareOptions = [
            _('google'),
            _('chrome'),
            _('firefox'),
            _('vscode'),
            _('code editor'),
            _('youtube'),
            _('gmail'),
            _('outlook'),
            _('maps'),
            _('calculator'),
            _('calendar'),
            _('notepad'),
            _('snap store'),
            _('extensions manager'),
            _('settings'),
            _('emulator'),
            _('terminal'),
        ];

        // Check if software name is in softwareOptions
        const maxWords = 10;
        const words = text.split(/\s+/).slice(0, maxWords);
        const softwareName = words.find((word) =>
            softwareOptions.includes(word),
        );
        return softwareName;
    }

    _runSoftware(software) {
        switch (software) {
            case 'google':
                this.app.utils.executeCommand('google-chrome');
                break;
            case 'chrome':
                this.app.utils.executeCommand('google-chrome');
                break;
            case 'firefox':
                this.app.utils.executeCommand('firefox');
                break;
            case 'youtube':
                this.app.utils.executeCommand('firefox youtube.com');
                break;
            case 'vscode':
                this.app.utils.executeCommand('code');
                break;
            case 'code editor':
                this.app.utils.executeCommand('code');
                break;
            case 'gmail':
                this.app.utils.executeCommand('google-chrome gmail.com');
                break;
            case 'outlook':
                this.app.utils.executeCommand('google-chrome outlook.com');
                break;
            case 'maps':
                this.app.utils.executeCommand('google-chrome maps.google.com');
                break;
            case 'calculator':
                this.app.utils.executeCommand('google-chrome calculator.com');
                break;
            case 'calendar':
                this.app.utils.executeCommand(
                    'google-chrome calendar.google.com',
                );
                break;
            case 'notepad':
                this.app.utils.executeCommand('google-chrome notepad.com');
                break;
            case 'snap store':
                this.app.utils.executeCommand('google-chrome snap.shop');
                break;
            case 'extensions manager':
                this.app.utils.executeCommand(
                    'google-chrome extensions.gnome.org',
                );
                break;
            case 'settings':
                this.app.openSettings();
                break;
            case 'emulator':
                this.app.utils.executeCommand(
                    'google-chrome emulator.google.com',
                );
                break;
            case 'terminal':
                this.app.utils.executeCommand('gnome-terminal');
                break;
            default:
                this.app.log('Software not found');
                break;
        }
    }
}
