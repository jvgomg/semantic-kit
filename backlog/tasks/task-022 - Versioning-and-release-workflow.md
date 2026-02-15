---
id: TASK-022
title: Versioning and release workflow
status: To Do
assignee: []
created_date: '2026-02-15 21:37'
updated_date: '2026-02-15 21:43'
labels:
  - npm
  - workflow
milestone: npm release
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Establish versioning strategy and release workflow for npm publishing.

## Versioning Strategy
- Current: `0.0.17` (exploratory)
- Target progression:
  - `0.1.0-beta.x` - First feature-complete beta
  - `0.1.0` - First stable minor
  - `1.0.0-rc.x` - Release candidates
  - `1.0.0` - Stable public release

## npm Tags
- `latest` - stable releases only
- `beta` - pre-release versions (`npm publish --tag beta`)
- `next` - optional, for bleeding edge

## Release Workflow Needs
1. **Version bump script** - update package.json version
2. **Changelog management** - keep CHANGELOG.md updated
3. **Pre-publish checks** - typecheck, tests, build
4. **Test packaged result** - `npm pack` and install tarball in fresh project before publishing
5. **Publish command** - with appropriate tag
6. **Git tagging** - tag releases in git

## Pre-publish Testing
Before every publish:
```bash
npm pack                           # Create tarball
cd /tmp && mkdir test-pkg && cd test-pkg
npm init -y
npm install /path/to/semantic-kit-x.x.x.tgz
npx semantic-kit --help            # Verify CLI works
node -e "require('semantic-kit')"  # Verify imports work
```

## Questions
- Manual releases or CI/CD automation?
- Conventional commits for changelog generation?
- GitHub releases in addition to npm?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Version strategy documented
- [ ] #2 Release script or checklist exists
- [ ] #3 Can publish beta versions with --tag beta
- [ ] #4 Git tags created for releases
- [ ] #5 Release checklist includes testing packaged tarball before publish
<!-- AC:END -->
