#!/bin/sh

# Canonical dir
cd "$(dirname $0)/../"

node_modules/.bin/browserify -s virgil -r './lib/browser/fs_shim.js:fs' -t brfs ./lib | node_modules/.bin/esmangle >./browser.js
