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

[ $# -eq 2 ] || { echo "usage: emit-lambda-sbom.sh <commit-sha> <package-dir>" >&2; exit 2; }
COMMIT_SHA="$1"

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

# linn-api-infrastructure build 1243. Pinned for the same reason every other repository pins it: which
# emitter produced a document is part of what that document can be trusted to say.
SBOM_TOOL_IMAGE=linn/sbom-tool:1243
SBOM_BUCKET=linn-api-infrastructure-$ENVIRONMENT-sbom-store

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

echo "Emitting SBOM for the Lambda deployment package..."

# The tree is copied INTO the emitter rather than bind-mounted, and the document copied back out. A
# -v source is resolved by the daemon against the HOST filesystem, so where a build runs inside a
# container the mount silently names a different, empty directory. docker cp behaves the same either
# way, which is why the estate uses one mechanism rather than two.
CONTAINER_ID=$(docker create \
	-e SBOM_COMMIT_SHA="$COMMIT_SHA" \
	-e SBOM_ARTEFACT_REF="alexa-smart-home" \
	-e SBOM_REPO="$SOURCE_REPO" \
	-e SBOM_ARTEFACT_CLASS=lambda \
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
