#!/bin/sh

cd "$(dirname $0)"
./test-integration.sh
./test-module.sh
./test-big.sh
./test-unit.sh
