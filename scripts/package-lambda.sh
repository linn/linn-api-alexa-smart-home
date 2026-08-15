#!/bin/bash
#
# Build the deployment package and upload it. The key carries the build number so that a stack update
# always points at a distinct object - CloudFormation only replaces function code when the S3 key it
# is given changes, so a fixed key would deploy the first build for ever.
set -e

cd "${0%/*}" # ensure cwd is script dir
cd ../

[ -n "${RESOURCES_BUCKET:-}" ] || { echo "RESOURCES_BUCKET is not set" >&2; exit 1; }
[ -n "${TRAVIS_BUILD_NUMBER:-}" ] || { echo "TRAVIS_BUILD_NUMBER is not set" >&2; exit 1; }

rm -rf dist package
npm run build

# Production dependencies only, installed fresh into the package rather than copied from the build
# tree, so nothing a test needed can reach the deployed function. --ignore-scripts because a
# deployment package must not run arbitrary install hooks.
mkdir -p package
cp package.json package-lock.json package/
cp -R dist package/dist
( cd package && npm ci --omit=dev --ignore-scripts )
rm -f package/package.json package/package-lock.json

( cd package && zip -r -q ../alexa-smart-home.zip . )

# Fails loudly rather than uploading an empty archive: a zip of nothing uploads and deploys perfectly
# and the function then 500s on every directive.
[ -s alexa-smart-home.zip ] || { echo "deployment package is empty" >&2; exit 1; }
unzip -l alexa-smart-home.zip | grep -q "dist/Handler.js" || { echo "deployment package has no handler" >&2; exit 1; }

export CODE_KEY=alexa-smart-home-${TRAVIS_BUILD_NUMBER}.zip
aws s3 cp alexa-smart-home.zip "s3://$RESOURCES_BUCKET/$CODE_KEY"

echo "Uploaded $CODE_KEY to $RESOURCES_BUCKET"
