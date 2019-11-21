#!/usr/bin/env bash

# Yarn pre / post [action] hooks

echo 'Running yarn replacement'

function backup_modules() {
  mv node_modules/ node_modules_backup/
}

function restore_modules() {
  mv node_modules_backup/ node_modules/
}

if [[ $# -eq 0 ]]; then echo "Command not passed" && exit 0; fi

if [[ $1 =~ ^(add|remove|install)$ ]]; then
  backup_modules && ( (yarn-origin --modules-folder $NODE_PATH "$@" && restore_modules) || restore_modules) && snm
else
  yarn-origin $@
fi

exit $?
