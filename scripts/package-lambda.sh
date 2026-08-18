#!/bin/bash
#
# Build the deployment package and upload it. The key carries the build number so that a stack update
# always points at a distinct object - CloudFormation only replaces function code when the S3 key it
# is given changes, so a fixed key would deploy the first build for ever.
set -e

# BASH_SOURCE, not $0: deploy.sh SOURCES this file - it needs CODE_KEY below - and under source $0 is
# still the CALLER's path. BASH_SOURCE[0] is this file either way, so this works sourced or executed.
#
# The caller's working directory is saved and restored, because being sourced means every cd here
# happens in the CALLER's shell. deploy.sh runs from scripts/ and addresses its templates relatively,
# so leaving it at the repository root sends the next command looking outside the repository
# altogether. Anything that runs in someone else's shell has to put it back.
_package_lambda_caller_pwd="$PWD"
cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../

# Checked up front rather than discovered part-way through: an absent tool here fails after the build
# has already run, with a bare "command not found" and a half-made package on disk.
command -v zip >/dev/null || { echo "zip is not installed - cannot build the deployment package" >&2; exit 1; }
command -v unzip >/dev/null || { echo "unzip is not installed - cannot verify the deployment package" >&2; exit 1; }

[ -n "${RESOURCES_BUCKET:-}" ] || { echo "RESOURCES_BUCKET is not set" >&2; exit 1; }
[ -n "${COMMIT_SHA:-}" ] || { echo "COMMIT_SHA is not set - the SBOM step cannot name the source it documents" >&2; exit 1; }
[ -n "${TRAVIS_BUILD_NUMBER:-}" ] || { echo "TRAVIS_BUILD_NUMBER is not set" >&2; exit 1; }
# Set by deploy.sh, which sources this file, so it is in scope without being exported. Checked here
# rather than left to the SBOM step: unset, the function name loses its stage and the document is keyed
# under a function that is not deployed - which no build failure would ever reveal.
[ -n "${STAGE:-}" ] || { echo "STAGE is not set - the SBOM step cannot name the function this package deploys as" >&2; exit 1; }

rm -rf dist package
npm run build

# Production dependencies only, installed fresh into the package rather than copied from the build
# tree, so nothing a test needed can reach the deployed function. --ignore-scripts because a
# deployment package must not run arbitrary install hooks.
mkdir -p package
cp package.json package-lock.json package/
cp -R dist package/dist
( cd package && npm ci --omit=dev --ignore-scripts )
# BEFORE the manifests are removed, because that is the only moment the tree is both complete and
# describable: the install has run, and syft catalogues JavaScript from the lockfile - which the zip
# deliberately does not carry. Run this after the removal and the scan finds nothing.
./scripts/emit-lambda-sbom.sh "$COMMIT_SHA" package "$STAGE"

rm -f package/package.json package/package-lock.json

( cd package && zip -r -q ../alexa-smart-home.zip . )

# Fails loudly rather than uploading an empty archive: a zip of nothing uploads and deploys perfectly
# and the function then 500s on every directive.
[ -s alexa-smart-home.zip ] || { echo "deployment package is empty" >&2; exit 1; }
# ANCHORED. Unanchored, "dist/Handler.js" also matches dist/Handler.js.map - so a future rootDir change
# nesting the output at dist/src/Handler.js would leave this guard green while the Handler: path in
# aws/application.yml pointed at nothing, and only the post-deploy smoke test would notice.
unzip -l alexa-smart-home.zip | grep -qE '(^| )dist/Handler\.js$' || { echo "deployment package has no handler at dist/Handler.js" >&2; exit 1; }

export CODE_KEY=alexa-smart-home-${TRAVIS_BUILD_NUMBER}.zip
aws s3 cp alexa-smart-home.zip "s3://$RESOURCES_BUCKET/$CODE_KEY"

echo "Uploaded $CODE_KEY to $RESOURCES_BUCKET"

# Only on the success path: every guard above exits, and under `source` that ends the caller too, so
# there is no path that returns to deploy.sh without passing through here.
cd "$_package_lambda_caller_pwd"
unset _package_lambda_caller_pwd
