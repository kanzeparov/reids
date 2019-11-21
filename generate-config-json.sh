#!/usr/bin/env bash
set -e

# Arguments validation

if [ $# -eq 0 ]; then echo "Arguments are not given"; exit 1; fi

if [ $# -ne 2 ]; then
  echo "Wrong args passed"
  echo "Example: sh ./create-config-json.sh CONFIG_TMPL_FILE_PATH DEST_CONFIG_DIR_PATH"
  exit 1
fi

# Arguments values validation

tmpl_path=$1
dest_path=$2
file_path="$dest_path/config.json"

if [ ! -f $tmpl_path ]; then
  echo "Config template not found in '$tmpl_path'"
  exit 1
fi

if [ ! -d $dest_path ]; then
  mkdir -p $dest_path
  echo "Created config file dir: '$dest_path'"
fi

if [ ! -f $file_path ]; then
  cp $tmpl_path $file_path
  chmod +w $file_path
  echo "Created blank config file: '$file_path'"
fi

# Helper functions declaration

replace_file_contents() {
  sed -i "s#$1#$2#g" $file_path
}

# Main logic

env | while IFS='=' read k v; do
  replace_file_contents "\$$k" "$v"
done

echo "Generated config file: '$file_path'"
