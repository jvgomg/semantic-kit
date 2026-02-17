---
id: TASK-045
title: Publish to Homebrew for easy installation
status: To Do
assignee: []
created_date: '2026-02-16 22:12'
labels:
  - distribution
  - homebrew
  - dx
  - installation
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Enable users to install semantic-kit/webspecs via Homebrew with `brew install webspecs`, making it easily accessible to macOS and Linux users.

## Background

Currently users need to:
- Install Node.js or Bun
- Run `npm install -g @webspecs/cli` or download binaries manually

Homebrew distribution would provide:
- One-command installation (`brew install webspecs`)
- Automatic dependency management
- Easy updates via `brew upgrade`
- Better discoverability in the Homebrew ecosystem

## Implementation Options

### Option 1: Homebrew Core (Official)
- Submit formula to homebrew-core
- Requires stable releases, high quality standards
- Maximum discoverability
- More stringent review process

### Option 2: Custom Tap (Easier Start)
- Create `homebrew-webspecs` tap repository
- Users install via `brew tap jvgomg/webspecs && brew install webspecs`
- Full control over release process
- Can graduate to homebrew-core later

## Requirements

- Create Homebrew formula (Ruby DSL)
- Host compiled binaries for macOS (darwin-arm64, darwin-x64)
- Set up release process to update formula with each version
- Include Playwright as dependency or post-install step
- Documentation for installation and updating

## Related Work

- Binary build system (task-020) provides the macOS binaries needed
- GitHub Actions release workflow (task-043) could automate formula updates
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Homebrew formula created and tested on macOS
- [ ] #2 Formula installs webspecs CLI successfully
- [ ] #3 Playwright dependency handled correctly
- [ ] #4 Installation instructions added to README
- [ ] #5 Decide on homebrew-core vs custom tap approach
- [ ] #6 Release process documented for updating formula
<!-- AC:END -->
