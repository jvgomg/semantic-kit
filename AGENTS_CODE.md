# Code Development Guide

Instructions for agents making code changes to semantic-kit.

## Skills

Load these skills when performing specific workflows:

| Skill | When to Use |
|-------|-------------|
| `research-update-after-implementation` | After implementing a research-backed backlog task |

Skills are located in `.agents/skills/`.

---

## Adding a New Command

1. Create command file in `src/commands/<name>.ts`
2. Add command to CLI in `src/cli.ts`
3. Export from `src/index.ts` if needed programmatically
4. Run `bun run typecheck` to verify

## Adding Command Documentation

Command docs live in `docs/commands/` and focus on **usage**, not research.

Structure:
1. What it does (one paragraph)
2. Usage examples
3. Options table
4. **Behavior table** — links to research that drives the command's behavior
5. Output explanation
6. Advanced usage / programmatic access

Example behavior table:

```markdown
## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Extracts main content | Matches AI crawler behavior | [[readability]] |
| Ignores JavaScript | AI crawlers don't render JS | [[ai-crawler-behavior]] |
```

## After Making Changes

1. Run `bun run typecheck`
2. Test command: `bun run dev <command> [options]`
3. Add entry to CHANGELOG.md
4. Bump version in `package.json` if releasing

---

## Implementing Backlog Tasks

### Before Starting

1. Read the backlog task thoroughly (use `task_view`)
2. Check the `references` field for linked research pages
3. Read linked research to understand the context
4. Verify the proposed approach still makes sense

### While Implementing

1. Follow the implementation approach in the task description
2. Refer to linked research for behavior expectations
3. Ask questions if the approach needs clarification

### After Implementing

**For research-backed tasks** (labeled `research-backed`):

1. **Load the `research-update-after-implementation` skill** for the complete workflow
2. This covers:
   - Adding `toolCoverage` to research page frontmatter
   - Adding inline callout if appropriate
   - Writing CHANGELOG entry with research reference
   - Marking task as Done

**For non-research tasks:**

1. Add CHANGELOG entry
2. Mark task as Done via `task_edit`

---

## Testing Commands

```bash
# During development (uses tsx, no build needed)
bun run dev <command> [options]

# After building
bun run build
bun run semantic-kit <command> [options]
```

## Test Server

A local test server serves HTML fixtures for testing commands.

```bash
# Start the test server
bun run test-server

# Test commands against fixtures
bun run dev structure http://localhost:4000/good/semantic-article.html
bun run dev validate:a11y http://localhost:4000/bad/div-soup.html
```

### Fixture Organization

```
test-server/fixtures/
  good/           # Well-formed semantic HTML examples
  bad/            # Anti-pattern examples
  edge-cases/     # Boundary conditions
  responses/      # Custom response behaviors
```

Full documentation: [test-server/README.md](test-server/README.md)

---

## File Structure

```
src/
  cli.ts              # CLI entrypoint, command definitions
  index.ts            # Package exports
  commands/           # One file per command
  lib/                # Shared utilities
```

## Code Style

- Use TypeScript
- Prefer async/await over callbacks
- Commands should support `--format json` for machine-readable output
- Keep command files focused — extract shared logic to `lib/`

## Dependencies

- **Playwright** is a peer dependency (optional, for JS-rendering commands)
- Lazy-load heavy dependencies — don't load Playwright for static-only commands
- Prefer existing dependencies over adding new ones
