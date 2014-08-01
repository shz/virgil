#!/bin/sh

cd "$(dirname $0)"
./test-integration.sh
./test-unit.sh
