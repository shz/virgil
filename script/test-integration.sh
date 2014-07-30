#!/bin/sh

# Canonical dir
cd "$(dirname $0)/../"

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

echo ''
for file in $(find test/integration -name \*.js); do
  printf "${YELLOW}$file${RESTORE}  =  "
  result=`bin/vzs-js $file 2>&1`
  if [ $? -ne 0 ]; then
    echo "${RED}FAIL${RESTORE}"
    # echo '--------------------------------------------------------'
    echo "$result"
    echo ''
    echo ''
  else
    echo "${GREEN}PASS${RESTORE}"
    echo "$result"
  fi
done
echo ''

