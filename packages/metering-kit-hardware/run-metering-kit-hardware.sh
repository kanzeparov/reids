#!/bin/bash

[ -f /etc/default/onder-meter ] && source /etc/default/onder-meter || echo "ERROR: can't read default settings"

if [ -z "$CONFIGURATION_DIR" ]; then
    echo "ERROR: CONFIGURATION_DIR isn't set!"
    exit 1
else
    if [ -f "$CONFIGURATION_DIR/meters.yml" ]; then
        echo "INFO: $CONFIGURATION_DIR/meters.yml exist"
    else
        echo "ERROR: $CONFIGURATION_DIR/meters.yml isn't exist, create from default"
        cp -vpf "$SNAP/meters.yml" "$CONFIGURATION_DIR/"
    fi
fi

cd $SNAP/packages/metering-kit-hardware
exec node "dist/main.js"
