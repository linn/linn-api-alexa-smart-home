# shellcheck shell=bash
# shellcheck disable=SC2034
#
# No shebang: this file is sourced, never executed, and a shebang would invite someone to run it.
# The disable above covers "appears unused" - every value here is consumed by the scripts that source
# it, which the linter cannot see from this file alone.
#
# What this repository produces, for the SBOM step - which is currently its only consumer. Declaring
# it here does not by itself close any drift, and it is worth being plain about that: the deployment
# package is built by package-lambda.sh, which does not read this file.
#
# Deliberately free of CI variables and of anything about HOW the artefact is built. Those belong to
# whatever drives the build and change when it does; this file states what the repository produces,
# which does not.

# This repository publishes NO container images. It publishes a Lambda deployment package, so there
# is no SERVICE_IMAGES map here and no image document - the artefact class is `lambda`, keyed by
# repository and commit, because a zip has no registry identity to key on.
SOURCE_REPO=linn-api-alexa-smart-home

# Whether what this repository produces is inside the CRA cloud SBOM boundary.
#
# TRUE. The skill is how a customer controls Linn devices by voice: it takes Alexa directives and
# turns them into calls against the Linn API, so removing it removes a function the product offers.
# Art. 3(2)'s test is whether absence prevents the product performing one of its functions, and this
# does. It is customer-facing and reachable from the internet by design, which is the opposite of the
# argument that puts build-image and infrastructure outside the boundary.
SBOM_CRA_SCOPE=true
