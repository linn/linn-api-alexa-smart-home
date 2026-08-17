#!/bin/bash
#
# Emit a CycloneDX SBOM for the Lambda deployment package this repository publishes, and upload it to
# the environment's artefact store.
#
# Usage: emit-lambda-sbom.sh <commit-sha> <package-dir>
#
# THE FIRST lambda-CLASS CONSUMER IN THE ESTATE. Every other repository documents a container image,
# scanned as an image. A Lambda has no registry identity to key on, so its document is keyed by
# repository and commit, and the scan target is the directory the zip is made from.
#
# WHEN IT MUST RUN, AND WHY THAT IS NOT NEGOTIABLE. package-lambda.sh installs production dependencies
# into the package directory and then DELETES package.json and package-lock.json before zipping, so
# the shipped artefact carries none. syft catalogues JavaScript from the lockfile and never from
# node_modules - so run after that removal and the scan finds nothing at all, and the emitter refuses
# a document with no components. This therefore runs between the install and the removal, on the tree
# as it is at that moment: production dependencies only, exactly what ships.
#
# That ordering is the whole correctness argument, which is why the caller passes the directory rather
# than this script guessing at one - a wrong directory should be a usage error here, not a document
# describing something else.
set -e

[ $# -eq 3 ] || { echo "usage: emit-lambda-sbom.sh <commit-sha> <package-dir> <stage>" >&2; exit 2; }
COMMIT_SHA="$1"
# The deployed stack's stage, which is NOT $ENVIRONMENT: prod deploys as `production`, because the
# Alexa skill is bound to the ARN Serverless generated and the function name carries the stage.
# Passed in rather than re-derived, so the name this document is keyed by and the name deploy.sh
# actually deploys come from one decision.
STAGE="$3"

# Resolved to an absolute path HERE, against the caller's working directory, because the cd below
# moves us. package-lambda.sh runs from the repository root and passes a relative `package`; resolved
# after the cd that becomes scripts/package, which does not exist - and the failure then reads as
# "the package was never built" when it was built exactly where it should be.
PACKAGE_DIR="$(cd "$2" 2>/dev/null && pwd -P)" \
  || { echo "package directory '$2' does not exist relative to $PWD - the package must be built before it can be documented" >&2; exit 2; }

# BASH_SOURCE rather than $0: this may be sourced, and under source $0 is the caller's path.
cd "$(dirname "${BASH_SOURCE[0]}")"

[ -n "${ENVIRONMENT:-}" ] || { echo "ENVIRONMENT is not set - cannot choose an SBOM store" >&2; exit 1; }
[ -n "${CI_BUILD_ENV:-}" ] || { echo "CI_BUILD_ENV is not set - cannot record what built the artefact" >&2; exit 1; }

# shellcheck source=./artefacts.sh
. ./artefacts.sh

# The first linn-api-infrastructure build carrying the Lambda identity contract: a document keyed by
# the DEPLOYED FUNCTION NAME rather than by repository alone. That segment is what the deployment
# cross-check joins on, so a document emitted by an earlier tag is filed where nothing looks for it and
# the function reads as undocumented however complete the document is.
SBOM_TOOL_IMAGE=linn/sbom-tool:1304
SBOM_BUCKET=linn-api-infrastructure-$ENVIRONMENT-sbom-store

# Read from the template rather than restated here. A name written down twice is a name that can
# disagree with itself, and the failure is silent in the direction that matters: the document is
# well-formed, the upload succeeds, and only the coverage join notices - long after the build is green.
#
# One of each is required rather than assumed. `grep` on a template that stopped declaring a name
# yields an empty string, which would key the document at a path with an empty segment; a second
# function would need its own document rather than quietly getting the first match's.
TEMPLATE=../aws/application.yml
# `!Sub` excludes the invoke permission's `FunctionName: !GetAtt`, which names an ARN and not a
# function. `[$]` rather than a bare `$`, which is not reliably literal in a basic regular expression.
FUNCTION_NAME=$(grep -oE 'FunctionName: !Sub [A-Za-z0-9._${}-]+' "$TEMPLATE" \
	| sed 's/FunctionName: !Sub //; s/[$]{stage}/'"$STAGE"'/')
RUNTIME=$(grep -oE 'Runtime: [A-Za-z0-9.]+' "$TEMPLATE" | sed 's/Runtime: //')

[ "$(printf '%s' "$FUNCTION_NAME" | grep -c .)" -eq 1 ] \
	|| { echo "expected exactly one 'FunctionName: !Sub' in $TEMPLATE, found: '$FUNCTION_NAME'" >&2; exit 1; }
[ "$(printf '%s' "$RUNTIME" | grep -c .)" -eq 1 ] \
	|| { echo "expected exactly one 'Runtime:' in $TEMPLATE, found: '$RUNTIME'" >&2; exit 1; }
# The stage must have been substituted. An unset STAGE leaves the literal `${stage}` in the name, which
# the emitter rejects as a lambda ref - but rejects for its punctuation, naming neither this template
# nor the missing variable.
case "$FUNCTION_NAME" in
	*'${stage}'*) echo "STAGE was not substituted into '$FUNCTION_NAME' - stage argument was empty" >&2; exit 1 ;;
esac

# Both checked explicitly, because their absence does not look like an ordering fault: the scan simply
# catalogues nothing, and the emitter then refuses an empty document with a message about components
# rather than about when this ran.
[ -f "$PACKAGE_DIR/package-lock.json" ] || { echo "no lockfile in '$PACKAGE_DIR' - this must run BEFORE package-lambda.sh removes the manifests, or syft catalogues nothing" >&2; exit 1; }
[ -d "$PACKAGE_DIR/node_modules" ] || { echo "no node_modules in '$PACKAGE_DIR' - the production install must run first" >&2; exit 1; }

WORK_DIR=$(mktemp -d)
CONTAINER_ID=""

cleanup() {
	[ -n "$CONTAINER_ID" ] && docker rm -f "$CONTAINER_ID" >/dev/null 2>&1
	rm -rf "$WORK_DIR"
	return 0
}
trap cleanup EXIT

DOC="$WORK_DIR/alexa-smart-home.cdx.json"

echo "Emitting SBOM for $FUNCTION_NAME ($RUNTIME)..."

# The tree is copied INTO the emitter rather than bind-mounted, and the document copied back out. A
# -v source is resolved by the daemon against the HOST filesystem, so where a build runs inside a
# container the mount silently names a different, empty directory. docker cp behaves the same either
# way, which is why the estate uses one mechanism rather than two.
#
# SBOM_EXPECT_NO_DEPENDENCIES is false because this function ships jwt-decode: an empty catalogue here
# would be a scan that went wrong, not an artefact with nothing to declare, and the emitter refuses it.
CONTAINER_ID=$(docker create \
	-e SBOM_COMMIT_SHA="$COMMIT_SHA" \
	-e SBOM_ARTEFACT_REF="$FUNCTION_NAME" \
	-e SBOM_REPO="$SOURCE_REPO" \
	-e SBOM_ARTEFACT_CLASS=lambda \
	-e SBOM_RUNTIME="$RUNTIME" \
	-e SBOM_EXPECT_NO_DEPENDENCIES=false \
	-e SBOM_CRA_SCOPE="$SBOM_CRA_SCOPE" \
	-e SBOM_BUILDER_IMAGE="$CI_BUILD_ENV" \
	"$SBOM_TOOL_IMAGE" emit-sbom.sh "dir:/scan" /tmp/sbom.cdx.json)

docker cp "$PACKAGE_DIR/." "$CONTAINER_ID:/scan"

# docker start --attach proxies the container's exit status, so a refusal fails this script rather
# than yielding an empty key that the upload below would treat as a bucket prefix.
STORE_KEY=$(docker start --attach "$CONTAINER_ID")

docker cp "$CONTAINER_ID:/tmp/sbom.cdx.json" "$DOC"

[ -s "$DOC" ] || { echo "the emitter produced no document" >&2; exit 1; }
[ -n "$STORE_KEY" ] || { echo "the emitter returned no store key - refusing to upload to a bucket root" >&2; exit 1; }

aws s3 cp "$DOC" "s3://$SBOM_BUCKET/$STORE_KEY"

echo "Emitted SBOM for the deployment package to s3://$SBOM_BUCKET/$STORE_KEY"
