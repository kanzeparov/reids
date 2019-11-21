#!/usr/bin/env bash

sh /app/generate-config-json.sh $CONFIG_TPL_PATH /etc

exec "$@"
