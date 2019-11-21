#!/usr/bin/env bash
set -e

echo "Entrypoint started"

# Check if Yarn is installed
yarn_path=$(which yarn)
if [ ! -f ${yarn_path} ]; then echo "Yarn is not installed" && exit 1; fi

# Check if Yarn wasn't replaced already
if [[ ! -f /usr/local/bin/yarn-origin ]]; then
  mv ${yarn_path} /usr/local/bin/yarn-origin
  ln -s $(pwd)/bin/yarn.sh ${yarn_path}
fi

# Check if sync_node_modules is not globally executable
if [[ ! -f /usr/local/bin/snm ]]; then
  ln -s $(pwd)/bin/sync_node_modules.sh /usr/local/bin/snm
fi

# Sync node_modules if folder does not exist
if [[ ! -d /app/node_modules ]]; then
  snm
fi

# Sync node_modules if empty (if timestamps are different)
if [[ -d /app/node_modules && $(ls /app/node_modules) == "" ]]; then
  snm
fi

echo "Entrypoint finished"

exec "$@"
