#!/bin/bash
set -e

# BASH_SOURCE rather than $0: identical while this is executed, and still correct if it is ever
# sourced - where $0 would be the caller's path and this cd would land somewhere else entirely.
cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../

npm ci --ignore-scripts

# The region the skill's Lambda lives in, stated here because serverless.yml used to state it and
# nothing else does now. It was a `region:` key in that file, so the AWS CLI never needed it from the
# environment - which is why the first CloudFormation deploy failed with NoRegion despite the
# credentials being present. Committed rather than inherited: which account and region this function
# is in is part of the skill binding, not a property of whoever runs the build.
export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-eu-west-1}

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
