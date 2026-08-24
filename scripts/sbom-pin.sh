# shellcheck shell=bash
# shellcheck disable=SC2034
#
# No shebang: this file is sourced, never executed, and a shebang would invite someone to run it. The
# disable above covers "appears unused" - the value is consumed by the scripts that source it, which the
# linter cannot see from here.
#
# THE EMITTER PIN, AND THE ONLY PLACE IT IS STATED IN THIS REPOSITORY.
#
# Which emitter produced a document is part of what that document can be trusted to say, so this is a
# committed fact rather than whatever the registry happens to serve today - there is no :latest to drift
# onto.
#
# It lives here rather than in the emitter because several repositories run MORE THAN ONE emitter - a
# service emitter, a Lambda emitter, a site emitter - and each used to carry its own copy of the tag. Two
# copies of one fact is a re-pin that updates one of them, and that failure is silent in the worst way:
# both documents are well-formed, both claim to describe this repository's artefacts, and they were
# produced by different generators.
#
# It is NOT in artefacts.sh, which states what the repository PRODUCES and whose own header records that
# it is deliberately free of anything about how the artefacts are built - no build image, no tag. A pin is
# exactly that, so it gets its own file rather than being pushed into one that says it does not belong.
#
# BUMPING IT IS AN ESTATE-WIDE EDIT, NOT A LOCAL ONE. Every emitting repository carries a copy of this
# file, and scripts/check-sbom-emitter-drift.sh (in linn-api-development) reports the tag each one holds.
# A repository left behind keeps producing documents from an older generator while every build stays
# green.
#
# WHAT THE TAG HAS TO SATISFY. These are lower bounds, gathered from the per-emitter copies this file
# replaced - each stated one of them and none stated all three, so a re-pin reading any single copy only
# ever knew part of the bar. They apply to every repository, because any repository can grow a second
# emitter:
#   - IMAGE documents: no constraint beyond the class being supported.
#   - LAMBDA documents need the build that introduced the Lambda identity contract - a document keyed by
#     deployed function name, with a declared managed runtime. Earlier tags derive one key per
#     REPOSITORY, so a repository with several Lambdas would have them all overwrite each other and one
#     would survive, silently, as the document for all of them.
#   - SITE documents need a build that REDUCES the document to what the bundle actually contains.
#     Earlier tags accept class=site but catalogue the whole lockfile, which for a browser bundle is the
#     entire dev and prod graph rather than the shipped surface.
# Lowering the tag is therefore never a local decision, whatever this repository happens to emit today.
#
# The build number is deliberately not restated in prose anywhere. It used to be, in the emitter, naming
# the build that first trimmed per-file locations - and three re-pins later the sentence still named that
# build while the assignment had moved on. A re-pin edits the assignment; nothing makes it read the
# paragraph above. The line below is the single statement of which build this is.
SBOM_TOOL_IMAGE=linn/sbom-tool:1304
