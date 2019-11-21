#!/bin/sh
# find . -type l -exec /path/tos/script {} +

set -e
for link; do
    test -h "$link" || continue

    dir=$(dirname "$link")
    reltarget=$(readlink "$link")
    case $reltarget in
        /*) abstarget=$reltarget;;
        *)  abstarget=$dir/$reltarget;;
    esac

    rm -f "$link"
    cp -af "$abstarget" "$link" || {
        # on failure, restore the symlink
        rm -rf "$link"
        ln -sf "$reltarget" "$link"
    }
done
