#!/bin/sh

cd "$(dirname $0)"
./test-integration.sh
./test-module.sh
./test-unit.sh
