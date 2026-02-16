---
id: TASK-043
title: Automate releases with GitHub Actions
status: To Do
assignee: []
created_date: '2026-02-16 21:04'
labels:
  - ci
  - automation
  - npm
milestone: v1.0 release
dependencies:
  - TASK-027.05
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up automated publishing workflow using GitHub Actions and Changesets.

## Current State

Releases are done locally:
1. Manual `bunx changeset version`
2. Manual `bun run build && bun run test`
3. Manual `bunx changeset publish`
4. Manual GitHub release creation with binaries

This works but is manual and error-prone.

## Goal

Automate the release process with GitHub Actions:
- Detect changesets in PRs
- Create "Version Packages" PR automatically
- On merge to main, publish to npm
- Create GitHub release with combined changelog
- Build and attach platform binaries

## Requirements

1. Use `changesets/action` for release automation
2. Build cross-platform binaries (darwin-arm64, darwin-x64, linux-x64)
3. Attach binaries to GitHub releases
4. Support npm provenance (see TASK-025)
5. Only publish when changesets exist

## References

- Changesets GitHub Action: https://github.com/changesets/action
- Example workflow: https://github.com/changesets/action#with-publishing

## Questions

- Should we require manual approval before publish?
- Should we publish pre-releases for beta testing?

## Dependencies

- TASK-027.05 (local release workflow must work first)
- TASK-025 (npm provenance configuration)
<!-- SECTION:DESCRIPTION:END -->
