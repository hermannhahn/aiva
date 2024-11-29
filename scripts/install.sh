#!/bin/bash -e

# ==============================================================================
# This script install dependencies and the extension.
# ==============================================================================

echo "Downloading extension..."
git clone https://github.com/hermannhahn/aiva.git
cd gemini-gnome-extension
echo "Extension cloned."
echo "Installing dependencies..."
sudo apt update
sudo apt install curl -y
sudo apt install python3 -y
sudo apt install notify-send -y
sudo apt install sox -y
sudo apt install gettext -y
sudo apt install mediainfo -y
sudo apt install sqlite3 -y
npm install
echo "Dependencies installed."
echo "Installing extension..."
npm run build:install
echo "Extension installed."
echo "Active AIVA extension: https://extensions.gnome.org/local/"
exit 0
