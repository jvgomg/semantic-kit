# Releasing Packages

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing packages to npm.

## For Agents

**Use the `changesets-workflow` skill** for comprehensive guidance.

The skill provides:
- Complete workflows for creating changesets, versioning, and publishing
- Semver guide for determining version bumps
- Research integration guidance
- Non-interactive script for changeset creation

Quick reference:
```bash
# After making code changes, create a changeset
node .agents/skills/changesets-workflow/scripts/create-changeset.js \
  "@webspecs/cli:patch,@webspecs/core:patch" \
  "Brief summary of changes" \
  "Optional detailed description\n\nResearch: [[page-id]], research-vX.Y.Z"
```

## For Maintainers

### Prerequisites

- npm account with publish access to `@webspecs` scope
- Logged in via `npm login`
- All tests passing
- All changes committed

### Release Process

```bash
# 1. Version packages (updates package.json and CHANGELOGs)
bunx changeset version

# 2. Review the version changes
git diff

# 3. Build all packages
bun run build

# 4. Run all tests
bun run test

# 5. Commit version changes
git add .
git commit -m "chore: release packages"

# 6. Publish to npm (publishes in dependency order)
bunx changeset publish

# 7. Push with tags
git push --follow-tags

# 8. Create GitHub release (manual for now)
gh release create v0.1.0 \
  --title "v0.1.0" \
  --notes-file RELEASE_NOTES.md \
  --latest
```

### Creating GitHub Releases

1. Combine relevant CHANGELOG sections from all packages
2. Create release notes highlighting key changes
3. Attach binaries (if applicable)
4. Tag with the version number

**Future**: This will be automated via GitHub Actions (see TASK-043)

## Versioning Strategy

This monorepo uses **independent versioning**:

- `@webspecs/core`, `@webspecs/cli`, and `@webspecs/tui` version independently
- Packages can release at different cadences
- No need to publish all packages together
- Changesets handles dependency updates automatically

### When Packages Must Release Together

Changesets automatically detects when packages need to release together:

- If `@webspecs/cli` depends on `@webspecs/core`
- And `@webspecs/core` gets a new version
- Then `@webspecs/cli` gets a patch bump to update its dependency

## Integration with Research

Tool releases reference research versions to create traceability.

### Workflow

1. **Research is updated** → Added to `research/CHANGELOG.md` under "Unreleased"
2. **Research is released** → Moved to `research-vX.Y.Z` section (when ready to cite)
3. **Implementation starts** → Code changes made based on research
4. **Changeset created** → References the research version:
   ```markdown
   Add Remix streaming detection

   Research: [[streaming-ssr]], research-v0.5.0
   ```
5. **Tool released** → Changeset becomes CHANGELOG entry
6. **Research updated** → `toolCoverage` added to research page frontmatter

### Research CHANGELOG

The research changelog (`research/CHANGELOG.md`) is **independent** from tool changelogs:

- Research can be released without tool changes
- Research informs future tool work
- Tool changes cite specific research versions

See `research/_meta/README.md` for research documentation workflow.

## Troubleshooting

### "No changesets present"

You need to create at least one changeset before versioning:
```bash
bunx changeset
# or for agents:
node .agents/skills/changesets-workflow/scripts/create-changeset.js ...
```

### "Not logged in to npm"

Run `npm login` and authenticate with your npm account.

### "Failed to publish"

Check:
- Are you logged in? (`npm whoami`)
- Do you have publish access to `@webspecs` scope?
- Did the build succeed? (`bun run build`)
- Are tests passing? (`bun run test`)

## References

- **Changesets documentation**: https://github.com/changesets/changesets
- **Skill**: `.agents/skills/changesets-workflow/SKILL.md`
- **Configuration**: `.changeset/config.json`
- **Research workflow**: `research/_meta/README.md`
