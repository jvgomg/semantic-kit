# Changesets Configuration Reference

Configuration options for changesets in this monorepo.

## Current Configuration

This monorepo uses **independent versioning** with the following configuration:

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

## Key Configuration Options

### Independent Versioning

**Current setup**: Packages version independently (not in lockstep).

- `@webspecs/core` can be at v1.2.0
- `@webspecs/cli` can be at v1.5.3
- `@webspecs/tui` can be at v0.8.1

This is the default when `fixed` and `linked` are empty arrays.

### Fixed Versioning (Not Used)

To make all packages always have the same version:

```json
{
  "fixed": [["@webspecs/core", "@webspecs/cli", "@webspecs/tui"]]
}
```

**Not recommended for this project** because:
- Core is a library (slower changes)
- CLI is a tool (faster changes)
- TUI is Bun-only (different release cadence)

### Linked Versioning (Not Used)

To make packages version together when one changes:

```json
{
  "linked": [["@webspecs/cli", "@webspecs/tui"]]
}
```

This ensures if CLI gets a minor bump, TUI also gets a minor bump.

**Not used** because packages should version independently based on their actual changes.

### Access

```json
{
  "access": "public"
}
```

Packages are published publicly to npm. Options:
- `"public"`: Available to everyone
- `"restricted"`: Only for org members (requires paid npm org)

### Update Internal Dependencies

```json
{
  "updateInternalDependencies": "patch"
}
```

When `@webspecs/core` is bumped, `@webspecs/cli` and `@webspecs/tui` dependencies on core are updated.

Options:
- `"patch"`: Always use `^` range (recommended)
- `"minor"`: Use `~` range
- `"major"`: Pin to exact version

### Changelog

```json
{
  "changelog": "@changesets/cli/changelog"
}
```

Uses the default changelog generator. Can be customized with a custom changelog function.

### Commit

```json
{
  "commit": false
}
```

Changesets does NOT automatically commit after running `changeset version`.

Options:
- `false`: Manual commits (current)
- `true`: Auto-commit with default message
- `["commit message"]`: Auto-commit with custom message

### Base Branch

```json
{
  "baseBranch": "main"
}
```

Default branch for the repository. Used by changesets when determining what's changed.

### Ignore

```json
{
  "ignore": []
}
```

Packages to ignore during versioning. Useful for:
- Example packages
- Test fixtures
- Internal tools

For this monorepo, test servers are not published, so they could be ignored:

```json
{
  "ignore": ["@webspecs/test-server", "@webspecs/test-server-nextjs"]
}
```

## Initialization

To initialize changesets in a new repository:

```bash
npx @changesets/cli init
```

This creates:
- `.changeset/` directory
- `.changeset/config.json` with default configuration
- `.changeset/README.md` with usage instructions

## Configuration Location

Configuration file: `.changeset/config.json`

Must be in the root of the monorepo, not in individual packages.
