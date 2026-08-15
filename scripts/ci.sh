#!/bin/bash
set -e

cd "${0%/*}" # ensure cwd is script dir
cd ../

npm ci --ignore-scripts

if [ "${TRAVIS_BRANCH}" = "master" ]; then
  if [ "${TRAVIS_PULL_REQUEST}" = "false" ]; then
    echo MASTER BUILD
    export ENVIRONMENT=prod
  else
    echo PR BUILD
    export ENVIRONMENT=sys
  fi
  npm run test:all
  ./scripts/deploy.sh
else
  echo BRANCH BUILD
  npm run test:all
fi
