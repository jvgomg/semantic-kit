# Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

## For Agents

**Use the `changesets-workflow` skill** for comprehensive guidance on creating changesets, versioning, and publishing.

Quick reference:
```bash
# Create a changeset after making code changes
node .agents/skills/changesets-workflow/scripts/create-changeset.js \
  "@webspecs/cli:patch" \
  "Brief summary" \
  "Optional detailed description\n\nResearch: [[page-id]], research-vX.Y.Z"
```

## For Humans

### Quick Start

```bash
# 1. Create a changeset (interactive)
bunx changeset

# 2. Version packages (updates package.json and CHANGELOGs)
bunx changeset version

# 3. Build and test
bun run build
bun run test

# 4. Publish to npm
bunx changeset publish

# 5. Push with tags
git push --follow-tags
```

### Documentation

- **Skill**: `.agents/skills/changesets-workflow/SKILL.md` - Complete workflows
- **Semver Guide**: `.agents/skills/changesets-workflow/references/semver-guide.md`
- **Configuration**: `.agents/skills/changesets-workflow/references/config.md`
- **Release Process**: `docs/RELEASING.md` (to be created)

## Configuration

This monorepo uses **independent versioning**:
- `@webspecs/core`, `@webspecs/cli`, and `@webspecs/tui` version independently
- Packages can release at different cadences
- Changesets handles dependency ordering automatically

See `.changeset/config.json` for current configuration.
