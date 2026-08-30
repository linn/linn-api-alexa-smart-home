# shellcheck shell=bash
# shellcheck disable=SC2034
# Sourced, not executed. What this repository produces, declared once for the build, the push and the
# SBOM step. Rationale: linn-api-development docs/subsystems/sbom-pipeline.md


SOURCE_REPO=linn-api-alexa-smart-home

# Inside the CRA cloud SBOM boundary. No default anywhere in the chain: the emitter accepts
# exactly true or false, so omitting it reddens the build rather than filing a document that
# claims the wrong scope.
SBOM_CRA_SCOPE=true
