export class Open {
    constructor(app) {
        this.app = app;
    }

    app(text) {
        const softwareName = this._getSoftwareName(text);
        if (softwareName) {
            this._runSoftware(softwareName);
        } else {
            this.app.log('Software not found');
        }
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
            case _('google'):
                this.app.utils.executeCommand('google-chrome');
                break;
            case _('chrome'):
                this.app.utils.executeCommand('google-chrome');
                break;
            case _('firefox'):
                this.app.utils.executeCommand('firefox');
                break;
            case _('youtube'):
                this.app.utils.executeCommand('firefox youtube.com');
                break;
            case _('vscode'):
                this.app.utils.executeCommand('code');
                break;
            case _('code editor'):
                this.app.utils.executeCommand('code');
                break;
            case _('gmail'):
                this.app.utils.executeCommand('google-chrome gmail.com');
                break;
            case _('outlook'):
                this.app.utils.executeCommand('google-chrome outlook.com');
                break;
            case _('maps'):
                this.app.utils.executeCommand('google-chrome maps.google.com');
                break;
            case _('calculator'):
                this.app.utils.executeCommand('google-chrome calculator.com');
                break;
            case _('calendar'):
                this.app.utils.executeCommand(
                    'google-chrome calendar.google.com',
                );
                break;
            case _('notepad'):
                this.app.utils.executeCommand('google-chrome notepad.com');
                break;
            case _('snap store'):
                this.app.utils.executeCommand('google-chrome snap.shop');
                break;
            case _('extensions manager'):
                this.app.utils.executeCommand(
                    'google-chrome extensions.gnome.org',
                );
                break;
            case _('settings'):
                this.app.openSettings();
                break;
            case _('emulator'):
                this.app.utils.executeCommand(
                    'google-chrome emulator.google.com',
                );
                break;
            case _('terminal'):
                this.app.utils.executeCommand('gnome-terminal');
                break;
            default:
                this.app.log('Software not found');
                break;
        }
    }
}
