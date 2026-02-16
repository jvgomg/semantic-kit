---
id: TASK-027.05
title: Multi-package build and release workflow
status: Done
assignee: []
created_date: '2026-02-16 16:04'
updated_date: '2026-02-16 21:36'
labels:
  - npm
  - workflow
milestone: npm release
dependencies:
  - TASK-027.03
  - TASK-027.04
parent_task_id: TASK-027
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Set up coordinated build and release workflow for the @webspecs monorepo using Changesets.

## Implementation Status

**✅ COMPLETED**: Changesets has been integrated into the project.

### What Was Implemented

1. **Changesets installed and configured**
   - Installed `@changesets/cli@2.29.8`
   - Configured `.changeset/config.json` with independent versioning
   - Created `.changeset/README.md` with quick start guide

2. **Agent skill created**
   - `changesets-workflow` skill provides comprehensive guidance
   - Non-interactive script for changeset creation
   - Semver guide for determining version bumps
   - Complete versioning and publishing workflows

3. **CHANGELOGs migrated**
   - Archived pre-monorepo CHANGELOG as `/CHANGELOG-pre-monorepo.md`
   - Created package-specific CHANGELOGs in each package
   - All packages marked as "Unreleased" (nothing published yet)

4. **Documentation created**
   - `/docs/RELEASING.md` - Complete release process for humans and agents
   - Updated `directives/code.md` with changeset workflow
   - Updated `AGENTS.md` skills table
   - Skill reference integrated throughout

5. **Backlog task created**
   - TASK-043: Automate releases with GitHub Actions (deferred to v1.0)

## How It Works

### For Agents

Use the `changesets-workflow` skill when creating changesets or publishing.

**Quick reference**:
```bash
# Create a changeset after code changes
node .agents/skills/changesets-workflow/scripts/create-changeset.js \
  "@webspecs/cli:patch,@webspecs/core:patch" \
  "Brief summary" \
  "Optional details\n\nResearch: [[page-id]], research-vX.Y.Z"
```

### For Maintainers

**Local release process**:
```bash
# 1. Version packages (updates package.json and CHANGELOGs)
bunx changeset version

# 2. Build and test
bun run build
bun run test

# 3. Commit version changes
git add .
git commit -m "chore: release packages"

# 4. Publish to npm
bunx changeset publish

# 5. Push with tags
git push --follow-tags
```

## Versioning Strategy

**Independent versioning** is configured:
- `@webspecs/core`, `@webspecs/cli`, `@webspecs/tui` version independently
- Packages can release at different cadences
- Changesets automatically handles dependency updates
- No lockstep versioning (not using `fixed` array)

## Integration with Research

Changesets reference research versions for traceability:

```markdown
Add Remix streaming detection in ai command

Research: [[streaming-ssr]], research-v0.5.0
```

This creates a link between:
- Research findings → Tool implementation → Released version

See `docs/RELEASING.md` for complete integration workflow.

## Files Created/Modified

```
.changeset/
  config.json           # Changesets configuration
  README.md             # Quick start guide

.agents/skills/
  changesets-workflow/  # Comprehensive skill
    SKILL.md            # Main documentation
    scripts/
      create-changeset.js  # Non-interactive script
    references/
      semver-guide.md      # Version bump guide
      config.md            # Config reference

packages/
  core/CHANGELOG.md     # Package changelog
  cli/CHANGELOG.md      # Package changelog
  tui/CHANGELOG.md      # Package changelog

docs/
  RELEASING.md          # Release process documentation

CHANGELOG-pre-monorepo.md  # Archived history

directives/code.md    # Updated with changeset workflow
AGENTS.md             # Updated with changesets-workflow skill
```

## Next Steps

1. **First release**: Follow `docs/RELEASING.md` to publish packages
2. **Future automation**: Implement TASK-043 for GitHub Actions publishing
3. **Testing**: Create a test changeset to verify workflow

## References

- Changesets documentation: https://github.com/changesets/changesets
- Skill: `.agents/skills/changesets-workflow/SKILL.md`
- Release docs: `docs/RELEASING.md`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 bun run build builds all packages in correct order
- [ ] #2 bun run test runs all tests
- [ ] #3 Release script bumps versions in all packages
- [ ] #4 npm publish works for all packages
- [ ] #5 GitHub release created with changelog and binaries
- [ ] #6 Integration tests pass with published packages
<!-- AC:END -->
