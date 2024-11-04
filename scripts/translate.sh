#!/bin/bash -e

# ==============================================================================
# This script create translations
# ==============================================================================

###########################
# Main script starts here #
###########################

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

rm -rf po/messages.pot

echo "All done."

# Exit script
exit 0
