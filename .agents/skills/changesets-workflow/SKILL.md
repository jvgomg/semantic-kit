---
name: changesets-workflow
description: Comprehensive workflow for managing versioning, changelogs, and publishing in the semantic-kit monorepo using Changesets. Use this skill when creating changesets after code changes, determining version bump types (major/minor/patch), versioning packages, or publishing to npm. Covers research integration (referencing research versions in changesets), independent package versioning, and local publishing workflow. Trigger when asked to create a changeset, version packages, publish to npm, or when completing tasks that require changelog entries.
---

# Changesets Workflow

Authoritative guide for managing package versions, changelogs, and publishing in this monorepo using Changesets.

## Overview

This monorepo uses Changesets for versioning and publishing with:

- **Independent versioning**: Packages version independently (not lockstep)
- **Local publishing**: Manual npm publish workflow (CI/CD automation deferred)
- **Research integration**: Changesets reference research versions when applicable
- **Three packages**: `@webspecs/core`, `@webspecs/cli`, `@webspecs/tui`

## When to Create a Changeset

Create a changeset after implementing changes that affect published packages:

**Always create a changeset for**:
- New features
- Bug fixes
- Breaking changes
- API modifications
- Documentation improvements that warrant a release

**Never create a changeset for**:
- Internal refactors with no external impact (unless significant enough to document)
- Changes only to test servers or non-published packages
- README or comment-only changes (unless part of a larger change)
- Work in progress (create changeset when task is complete)

## Quick Start

### 1. Create a Changeset

After implementing changes, create a changeset using the script:

```bash
node .agents/skills/changesets-workflow/scripts/create-changeset.js \
  "@webspecs/core:minor" \
  "Add streaming SSR detection" \
  "Research: [[streaming-ssr]], research-v0.5.0\n\nImplements detection of streaming SSR patterns based on documented research."
```

**Format**:
- First argument: Comma-separated `package:bumpType` pairs
- Second argument: Short summary (changeset title)
- Third argument (optional): Additional details and research references

**Examples**:

```bash
# Single package, minor bump
node scripts/create-changeset.js \
  "@webspecs/core:minor" \
  "Add new analyzer for Open Graph validation"

# Multiple packages, different bump types
node scripts/create-changeset.js \
  "@webspecs/core:minor,@webspecs/cli:patch" \
  "Add readability analyzer" \
  "Core adds new analyzer, CLI exposes it via existing command structure"

# With research reference
node scripts/create-changeset.js \
  "@webspecs/cli:minor" \
  "Add social metadata command" \
  "Research: [[open-graph-validation]], research-v0.6.0\n\nImplements validation and preview extraction for Open Graph and Twitter Cards."

# Breaking change
node scripts/create-changeset.js \
  "@webspecs/core:major" \
  "Remove deprecated extractText function" \
  "BREAKING: Removed extractText(). Use getReadability() instead."
```

### 2. Determine Bump Type

Use the semver guide to determine bump type:

- **patch**: Bug fixes, docs, internal refactors
- **minor**: New features, backward-compatible changes
- **major**: Breaking changes, API changes

See [references/semver-guide.md](references/semver-guide.md) for detailed rules and examples.

### 3. Version Packages

When ready to release, consume changesets and update package versions:

```bash
# At monorepo root
npx @changesets/cli version
```

This will:
- Read all changeset files from `.changeset/`
- Update package.json versions
- Generate/update CHANGELOG.md files
- Delete consumed changeset files
- Update workspace dependencies

**Review changes before committing**:

```bash
git status
git diff
```

### 4. Publish Packages

After versioning, publish to npm:

```bash
# Build packages first
bun run build

# Test that everything works
bun run test

# Publish (this will also create git tags)
npx @changesets/cli publish

# Push commits and tags
git push
git push --tags
```

## Workflow Decision Tree

```
Do you have code changes?
├─ Yes → Are they in published packages (core/cli/tui)?
│        ├─ Yes → Create a changeset
│        └─ No → No changeset needed
└─ No → Are you ready to release?
         ├─ Yes → Run version, then publish
         └─ No → No action needed
```

## Creating Changesets

### Using the Script (Recommended for Agents)

The `create-changeset.js` script provides full control without interactive prompts:

```bash
node .agents/skills/changesets-workflow/scripts/create-changeset.js \
  "package1:type,package2:type" \
  "Summary" \
  "Optional details"
```

**Advantages**:
- Non-interactive (scriptable)
- Explicit control over all fields
- Works in any environment
- Clear, predictable output

### Using the CLI (Alternative)

The interactive CLI is available but less suitable for agents:

```bash
npx @changesets/cli add
```

This launches an interactive prompt. Not recommended for automated workflows.

### Manual Creation (Also Valid)

Changesets are just markdown files. You can create them directly:

```bash
# Create file: .changeset/your-changeset-name.md
---
"@webspecs/core": minor
"@webspecs/cli": patch
---

Summary of changes

Additional details here.
```

## Multiple Package Changes

When changes affect multiple packages, include all affected packages with appropriate bump types:

**Scenario: New feature in core, used by CLI**

```bash
node scripts/create-changeset.js \
  "@webspecs/core:minor,@webspecs/cli:patch" \
  "Add new readability analyzer" \
  "Core adds analyzer (new feature), CLI uses it (patch - no new CLI functionality)"
```

**Scenario: Breaking change in core**

```bash
node scripts/create-changeset.js \
  "@webspecs/core:major,@webspecs/cli:major,@webspecs/tui:major" \
  "Remove deprecated API" \
  "BREAKING: Removed extractText(). Use getReadability() instead. All packages updated to use new API."
```

**Rule of thumb**:
- If a package's public API changes: Include it
- If a package only uses the changes internally: Include it only if it required code changes
- If a package is unaffected: Don't include it

## Research Integration

When implementing features based on research, reference the research version in the changeset summary:

**Format**:

```
Summary line

Research: [[page-id]], research-vX.Y.Z

Additional details.
```

**Example**:

```bash
node scripts/create-changeset.js \
  "@webspecs/core:minor" \
  "Add streaming SSR detection" \
  "Research: [[streaming-ssr]], research-v0.5.0\n\nDetects streaming SSR patterns including progressive enhancement markers and chunked transfer encoding."
```

**Why reference research versions?**
- Creates traceability between implementation and research
- Allows verification that implementation matches research
- Documents which research informed the change
- Helps future maintainers understand decisions

**Research version format**: `research-vX.Y.Z` (from `/research/CHANGELOG.md`)

## Versioning and Publishing

### Version Workflow

1. **Ensure all changes have changesets**

```bash
# Check for uncommitted changesets
ls .changeset/*.md
```

2. **Run version command**

```bash
npx @changesets/cli version
```

This updates:
- `package.json` files (version field)
- `CHANGELOG.md` files (adds new entries)
- Workspace dependencies (updates `@webspecs/*` references)
- Deletes consumed changeset files

3. **Review and commit**

```bash
git status
git diff
git add .
git commit -m "Version packages"
```

### Publish Workflow

1. **Build all packages**

```bash
bun run build
```

2. **Run tests**

```bash
bun run test
```

3. **Publish to npm**

```bash
npx @changesets/cli publish
```

This will:
- Publish changed packages to npm
- Create git tags for each published version
- Update package access based on config (public)

4. **Push to remote**

```bash
git push
git push --tags
```

### Dependency Ordering

Changesets automatically handles dependency order:

1. `@webspecs/core` published first (no dependencies)
2. `@webspecs/cli` published second (depends on core)
3. `@webspecs/tui` published last (depends on core and cli)

No manual ordering needed.

## Configuration

This monorepo uses independent versioning. See [references/config.md](references/config.md) for:

- Configuration options explained
- Independent vs fixed vs linked versioning
- When to update configuration
- Available changesets settings

Current config (`.changeset/config.json`):

```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

## Common Scenarios

### After completing a task with code changes

```bash
# Determine which packages changed and bump type
# Create changeset
node scripts/create-changeset.js \
  "@webspecs/core:minor" \
  "Add new feature"

# Commit changeset with code changes
git add .changeset/*.md
git add packages/
git commit -m "feat: add new feature"
```

### Fixing a bug

```bash
node scripts/create-changeset.js \
  "@webspecs/core:patch" \
  "Fix validation error handling" \
  "Fixes edge case where null values caused crashes"
```

### Multiple related changes

Create separate changesets for logically distinct changes:

```bash
# Feature A
node scripts/create-changeset.js \
  "@webspecs/core:minor" \
  "Add feature A"

# Feature B
node scripts/create-changeset.js \
  "@webspecs/cli:minor" \
  "Add feature B"
```

Or combine if they're part of one logical change:

```bash
node scripts/create-changeset.js \
  "@webspecs/core:minor,@webspecs/cli:minor" \
  "Add features A and B" \
  "Both features are part of the same enhancement"
```

### Preparing a release

```bash
# 1. Ensure all changesets are created
ls .changeset/*.md

# 2. Version packages
npx @changesets/cli version

# 3. Review changes
git diff

# 4. Commit
git add .
git commit -m "Version packages"

# 5. Build and test
bun run build
bun run test

# 6. Publish
npx @changesets/cli publish

# 7. Push
git push
git push --tags
```

## Troubleshooting

### "No changesets present"

If `changeset version` reports no changesets:
- Check `.changeset/` directory for `*.md` files (excluding README.md and config.json)
- Ensure changeset files have proper frontmatter
- Verify packages in frontmatter match workspace packages

### Version not updating

If a package version doesn't update:
- Check if package is listed in the changeset frontmatter
- Verify bump type is valid (major/minor/patch)
- Check if package is in `ignore` list in config

### Publish fails

If publish fails:
- Ensure you're logged in to npm: `npm whoami`
- Check package name isn't taken: `npm view @webspecs/core`
- Verify build succeeded: Check `dist/` directories
- Check npm credentials and 2FA settings

### Wrong version bump

If the version bump is wrong:
- Delete the changeset: `rm .changeset/changeset-name.md`
- Create a new one with correct bump type
- If already versioned, manually edit package.json and CHANGELOG.md

## Resources

### Scripts

- **create-changeset.js**: Create changesets programmatically without interactive prompts

### References

- **semver-guide.md**: Detailed rules for determining version bump types (major/minor/patch)
- **config.md**: Changesets configuration options and explanations

## Best Practices

1. **Create changesets immediately after completing changes**
   - Don't wait until release time
   - Easier to write good summaries when changes are fresh

2. **Write clear, user-facing summaries**
   - Focus on what changed, not how
   - Good: "Add streaming SSR detection"
   - Bad: "Update parser.ts to handle chunked responses"

3. **Include research references when applicable**
   - Links implementation to research
   - Provides context for future maintainers

4. **One logical change per changeset**
   - Don't combine unrelated changes
   - Do combine related changes across packages

5. **Review CHANGELOG.md after versioning**
   - Ensure entries are clear and accurate
   - Edit if needed before publishing

6. **Test before publishing**
   - Run full test suite
   - Build all packages
   - Verify locally if possible

7. **Use semantic versioning correctly**
   - Breaking changes = major
   - New features = minor
   - Bug fixes = patch
   - When in doubt, consult semver-guide.md
