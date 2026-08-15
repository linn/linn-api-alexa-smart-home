#!/bin/bash
#
# Deploys the skill backend. Two stacks: the bucket that holds deployment packages, and the function
# itself.
#
# The application stack name is NOT derived from $ENVIRONMENT for prod. The Alexa skill is bound to
# the function's ARN, and the existing production function is owned by the CloudFormation stack the
# Serverless Framework created. Deploying into that same stack, with the same logical id and function
# name, updates the function in place and leaves the ARN - and therefore the skill - untouched.
set -e

cd "${0%/*}" # ensure cwd is script dir

[ -n "${ENVIRONMENT:-}" ] || { echo "ENVIRONMENT is not set" >&2; exit 1; }

if [ "$ENVIRONMENT" = "prod" ]; then
  STAGE=production
  LINN_API_ROOT=https://api.linn.co.uk
else
  STAGE=sys
  LINN_API_ROOT=https://beta-api.linn.co.uk
fi

# The stack Serverless created, which already owns the production function.
APPLICATION_STACK=linn-api-alexa-smart-home-$STAGE

aws cloudformation deploy \
  --stack-name=linn-api-alexa-smart-home-persistence-$ENVIRONMENT \
  --template-file=../aws/persistence.yml \
  --no-fail-on-empty-changeset \
  --parameter-overrides environment=$ENVIRONMENT \
  --tags CIT=UI Project=linn-api-alexa-smart-home Environment=$ENVIRONMENT

# Read with --query rather than piped through jq: jq is one more tool that has to be present on the
# build image, and the CLI can select the output itself.
#
# Assigned separately from the export so that a failing describe-stacks aborts here. Exported in one
# step it would succeed with an empty value, and the upload would then write to a bucket-less path.
RESOURCES_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name linn-api-alexa-smart-home-persistence-$ENVIRONMENT \
  --query 'Stacks[0].Outputs[?OutputKey==`ResourcesBucketName`].OutputValue' \
  --output text)
[ -n "$RESOURCES_BUCKET" ] || { echo "could not resolve the resources bucket" >&2; exit 1; }
export RESOURCES_BUCKET

source ./package-lambda.sh

aws cloudformation deploy \
  --stack-name=$APPLICATION_STACK \
  --template-file=../aws/application.yml \
  --no-fail-on-empty-changeset \
  --parameter-overrides \
    environment=$ENVIRONMENT \
    stage=$STAGE \
    codeBucket=$RESOURCES_BUCKET \
    codeKey=$CODE_KEY \
    linnApiRoot=$LINN_API_ROOT \
  --capabilities=CAPABILITY_IAM \
  --tags CIT=UI Project=linn-api-alexa-smart-home Environment=$ENVIRONMENT

echo "Deployed to $ENVIRONMENT"
./smoke-test.sh
