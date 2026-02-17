---
id: TASK-047
title: Add CONTRIBUTING.md
status: To Do
assignee: []
created_date: '2026-02-17 12:56'
labels:
  - docs
milestone: npm release
dependencies: []
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create a CONTRIBUTING.md file at the repo root to guide external contributors.

Decide on and document:
- Whether PRs are welcome (and for what — bug fixes, new commands, etc.)
- How to set up the development environment
- How to run tests before submitting a PR
- Code style and formatting requirements (ESLint, Prettier)
- How the monorepo is structured and which packages to be aware of
- How to create a changeset when making a user-facing change (link to changesets workflow)

The Development section in the root README already covers setup, build, and testing commands — CONTRIBUTING.md can reference or expand on that, and the root README can then link to CONTRIBUTING.md instead of repeating the content.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 CONTRIBUTING.md exists at repo root
- [ ] #2 Contribution policy is clearly stated (what kinds of contributions are welcome)
- [ ] #3 Development setup instructions are present
- [ ] #4 Changesets workflow is mentioned for user-facing changes
<!-- AC:END -->
