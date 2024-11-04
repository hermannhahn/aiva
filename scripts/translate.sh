#!/bin/bash -e

# ==============================================================================
# This script create or update the translations
# ==============================================================================

###########################
# Main script starts here #
###########################

$UPDATE=$1

# If UPDATE = 'update'
if [ "$UPDATE" = "update" ]; then
    # update translations
    # Create new translations
    xgettext -k_ -kN_ -o po/messages.pot *.js
    msgmerge -U po/de-DE/LC_MESSAGES/messages.po po/messages.pot
    msgmerge -U po/fr-FR/LC_MESSAGES/messages.po po/messages.pot
    msgmerge -U po/it-IT/LC_MESSAGES/messages.po po/messages.pot
    msgmerge -U po/es-ES/LC_MESSAGES/messages.po po/messages.pot
    msgmerge -U po/pt-BR/LC_MESSAGES/messages.po po/messages.pot

    # Compile translations
    msgfmt -o po/de-DE/LC_MESSAGES/messages.mo po/de-DE/LC_MESSAGES/messages.po
    msgfmt -o po/fr-FR/LC_MESSAGES/messages.mo po/fr-FR/LC_MESSAGES/messages.po
    msgfmt -o po/it-IT/LC_MESSAGES/messages.mo po/it-IT/LC_MESSAGES/messages.po
    msgfmt -o po/es-ES/LC_MESSAGES/messages.mo po/es-ES/LC_MESSAGES/messages.po
    msgfmt -o po/pt-BR/LC_MESSAGES/messages.mo po/pt-BR/LC_MESSAGES/messages.po

else
    # Remove old translations
    rm -rf po
    mkdir po
    mkdir po/en-US
    mkdir po/de-DE
    mkdir po/fr-FR
    mkdir po/it-IT
    mkdir po/es-ES
    mkdir po/pt-BR

    xgettext -k_ -kN_ -o po/messages.pot *.js

    msgfmt -o po/en-US/LC_MESSAGES/messages.mo po/messages.pot
    msgfmt -o po/de-DE/LC_MESSAGES/messages.mo po/messages.pot
    msgfmt -o po/fr-FR/LC_MESSAGES/messages.mo po/messages.pot
    msgfmt -o po/it-IT/LC_MESSAGES/messages.mo po/messages.pot
    msgfmt -o po/es-ES/LC_MESSAGES/messages.mo po/messages.pot
    msgfmt -o po/pt-BR/LC_MESSAGES/messages.mo po/messages.pot
fi


echo "All done."

# Exit script
exit 0
