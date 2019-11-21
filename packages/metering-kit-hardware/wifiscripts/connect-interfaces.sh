#!/bin/bash

echo "This is helper script and it shoud be called by user directly!"
echo "Connecting interfaces for onder-meter"

snap connect onder-meter:network-manager :network-manager
snap connect onder-meter:network-control :network-control
snap connect onder-meter:network-setup-control :network-setup-control
snap connect onder-meter:raw-usb :raw-usb
