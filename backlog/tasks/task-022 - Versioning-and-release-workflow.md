---
id: TASK-022
title: Versioning and release workflow
status: To Do
assignee: []
created_date: '2026-02-15 21:37'
updated_date: '2026-02-16 16:04'
labels:
  - npm
  - workflow
milestone: npm release
dependencies:
  - TASK-027
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Establish versioning strategy and release workflow for the @webspecs monorepo.

**Note:** This task now covers multi-package publishing. See TASK-027.05 for detailed build/release workflow.

## Versioning Strategy

### Lockstep Versioning (Chosen)
All three packages share the same version number:
- `@webspecs/core@0.1.0`
- `@webspecs/cli@0.1.0`
- `@webspecs/tui@0.1.0`

**Rationale:**
- Simpler to communicate ("use webspecs 0.1.0")
- Avoids compatibility confusion
- All packages released together

### Version Progression
- `0.1.0-beta.x` - First feature-complete beta
- `0.1.0` - First stable minor
- `1.0.0` - Stable public release

## npm Tags
- `latest` - stable releases
- `beta` - pre-release versions
- Each package gets the same tag simultaneously

## Release Workflow

### Manual Release (Initial)
1. Update version in all package.json files
2. Update CHANGELOG.md
3. Build all packages: `bun run build`
4. Test: `bun run test`
5. Publish in order:
   ```bash
   cd packages/core && npm publish
   cd packages/cli && npm publish
   cd packages/tui && npm publish
   ```
6. Git tag: `git tag v0.1.0`
7. Create GitHub release with binaries

### Future: Automated Release
- GitHub Actions on tag push
- Matrix build for cross-platform binaries
- Automated changelog from conventional commits

## GitHub Releases
Each release includes:
- Changelog for all packages
- Binary downloads for CLI and TUI
- Links to npm packages

## Questions Resolved
- ✅ Lockstep versioning (not independent)
- ✅ Manual releases initially, automate later
- ✅ GitHub releases in addition to npm
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Version strategy documented
- [ ] #2 Release script or checklist exists
- [ ] #3 Can publish beta versions with --tag beta
- [ ] #4 Git tags created for releases
- [ ] #5 Release checklist includes testing packaged tarball before publish
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Update: Monorepo Context

This task is closely related to TASK-027.05 (Multi-package build and release workflow). The detailed implementation is in that sub-task.

This task focuses on the versioning strategy and release checklist, while TASK-027.05 covers the technical implementation.
<!-- SECTION:NOTES:END -->
