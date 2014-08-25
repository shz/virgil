#!/bin/sh

# Canonical dir
cd "$(dirname $0)/../"

# Args
debug=0

for var in "$@"
do
  if [ $var == '--debug' ]; then
    debug=1
  else
    echo ''
    echo "Unknown option $var"
    echo ''
  fi
done

# Colors
RESTORE='\033[0m'

RED='\033[00;31m'
GREEN='\033[00;32m'
YELLOW='\033[00;33m'
BLUE='\033[00;34m'
PURPLE='\033[00;35m'
CYAN='\033[00;36m'
LIGHTGRAY='\033[00;37m'

LRED='\033[01;31m'
LGREEN='\033[01;32m'
LYELLOW='\033[01;33m'
LBLUE='\033[01;34m'
LPURPLE='\033[01;35m'
LCYAN='\033[01;36m'
WHITE='\033[01;37m'

for file in $(find test/big -name \*.vgl); do
  printf "${YELLOW}$file${RESTORE}  =  "
  result=`bin/virgil-js -s $file 2>&1`
  if [ $? -ne 0 ]; then
    echo "${RED}FAIL${RESTORE}"
    # echo '--------------------------------------------------------'
    echo "$result"
    echo ''
    echo ''
  else
    echo "${GREEN}PASS${RESTORE}"

    if [ $debug -eq 1 ]; then
      echo "$result"
    fi
  fi
done
echo ''

