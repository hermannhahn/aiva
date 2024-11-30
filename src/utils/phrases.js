export class Phrases {
    onScreen() {
        const phrases = [
            _('I will show it on screen.'),
            _('Displaying now.'),
            _('Here it is on screen.'),
            _('Showing on screen.'),
            _('On the screen now.'),
        ];
        return this.randomPhrase(phrases);
    }

    wait() {
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
        return this.randomPhrase(phrases);
    }

    randomPhrase(phrases) {
        const randomPhrase =
            phrases[Math.floor(Math.random() * phrases.length)];
        return randomPhrase;
    }
}
