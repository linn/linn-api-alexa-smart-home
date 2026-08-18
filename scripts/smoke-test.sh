#!/bin/bash
#
# Post-deploy smoke test: invoke the deployed function exactly as Alexa does and check what comes
# back is a well-formed Alexa event.
#
# It deliberately sends a bearer token that is NOT a JWT, and expects the function to answer
# INVALID_AUTHORIZATION_CREDENTIAL. That needs no credentials and touches no customer device, while
# still proving the whole path: the function exists at the ARN the skill is bound to, the runtime
# boots, the package has a working handler and its dependencies, the directive is routed, and the
# response is addressed back correctly.
#
# What it deliberately does NOT prove: that a real token reaches the Linn API and controls a device.
# That needs a linked account, so it stays a manual check.
set -e

# BASH_SOURCE rather than $0: identical while this is executed, and still correct if it is ever
# sourced - where $0 would be the caller's path and this cd would land somewhere else entirely.
cd "$(dirname "${BASH_SOURCE[0]}")"

[ -n "${ENVIRONMENT:-}" ] || { echo "ENVIRONMENT is not set" >&2; exit 1; }

if [ "$ENVIRONMENT" = "prod" ]; then STAGE=production; else STAGE=sys; fi
FUNCTION=linn-api-alexa-smart-home-$STAGE-alexaSmartHome

OUT=$(mktemp)
trap 'rm -f "$OUT"' EXIT

DIRECTIVE='{"directive":{"header":{"namespace":"Alexa.PowerController","name":"TurnOn","payloadVersion":"3","messageId":"smoke-test","correlationToken":"smoke-correlation"},"endpoint":{"endpointId":"smoke-test-device","scope":{"type":"BearerToken","token":"not-a-jwt"}},"payload":{}}}'

echo "Invoking $FUNCTION..."

# --cli-binary-format is required from AWS CLI v2 onwards; without it the payload is read as base64
# and the function receives nonsense that still produces an error response, which would let this test
# pass while proving nothing about routing.
# A Lambda that throws still returns HTTP 200 with FunctionError set, so the invoke result has to be
# inspected rather than trusted. --query asks the CLI for that field directly, which avoids needing
# jq on the build image.
FUNCTION_ERROR=$(aws lambda invoke \
  --function-name "$FUNCTION" \
  --cli-binary-format raw-in-base64-out \
  --payload "$DIRECTIVE" \
  --query 'FunctionError' \
  --output text \
  "$OUT")

if [ "$FUNCTION_ERROR" != "None" ] && [ -n "$FUNCTION_ERROR" ]; then
  echo "SMOKE FAILED: the function errored ($FUNCTION_ERROR)" >&2
  cat "$OUT" >&2
  exit 1
fi

echo "Response: $(cat "$OUT")"

# node is present because this is a Node project; jq is not guaranteed on the build image, and one
# undeclared tool dependency has already failed a deploy here.
check() {
  local path=$1 expected=$2
  local actual
  actual=$(node -e "const r=JSON.parse(require('fs').readFileSync('$OUT','utf8')); const v=$path; console.log(v===undefined?'<missing>':v)")
  if [ "$actual" != "$expected" ]; then
    echo "SMOKE FAILED: $path was '$actual', expected '$expected'" >&2
    exit 1
  fi
}

check 'r.event.header.namespace' 'Alexa'
check 'r.event.header.name' 'ErrorResponse'
check 'r.event.header.payloadVersion' '3'
# Echoed back from the directive - proves the response was built from OUR request rather than being a
# canned failure from somewhere in front of the function.
check 'r.event.header.correlationToken' 'smoke-correlation'
check 'r.event.endpoint.endpointId' 'smoke-test-device'
check 'r.event.payload.type' 'INVALID_AUTHORIZATION_CREDENTIAL'

echo "SMOKE PASSED: $FUNCTION is live and answering the Alexa contract"
