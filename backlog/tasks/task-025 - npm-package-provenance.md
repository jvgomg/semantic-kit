---
id: TASK-025
title: npm package provenance
status: To Do
assignee: []
created_date: '2026-02-15 21:42'
labels:
  - npm
  - security
  - ci
milestone: v1.0 release
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add cryptographic provenance to npm publishes for supply chain security.

## About Provenance
- npm provenance links published packages to their source repo and build
- Proves the package was built from the claimed source code
- Requires publishing from GitHub Actions (not local)
- Displays a "Provenance" badge on npmjs.com

## Requirements
1. Set up GitHub Actions workflow for publishing
2. Configure npm publish with `--provenance` flag
3. Verify provenance appears on npm package page

## References
- https://docs.npmjs.com/generating-provenance-statements
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 GitHub Actions workflow for npm publishing
- [ ] #2 Provenance badge visible on npmjs.com package page
<!-- AC:END -->
