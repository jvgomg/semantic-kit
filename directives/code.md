# Code Development Guide

Instructions for agents making code changes to semantic-kit.

## Skills

Load these skills when performing specific workflows:

| Skill | When to Use |
|-------|-------------|
| `finalize-research-task` | After implementing a research-backed backlog task |

Skills are located in `.agents/skills/`.

---

## Adding a New Command

1. Create command file in `packages/cli/src/commands/<name>.ts`
2. Add command to CLI in `packages/cli/src/cli.ts`
3. Export from `packages/core/src/index.ts` if adding new extractors/analyzers
4. Run `bun run typecheck` to verify all packages
5. Run `bun run build` to ensure everything compiles

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

1. **Type check**: `bun run typecheck` (checks all packages)
2. **Test command**: `bun run dev <command> [options]`
3. **Lint**: `bun run lint` (lints all packages)
4. **Format**: `bun run pretty` (formats all packages)
5. **Build**: `bun run build` (builds all packages)
6. **Add CHANGELOG entry**: Update `research/CHANGELOG.md`
7. **Bump versions**: Update version in relevant `packages/*/package.json` if releasing

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

1. **Load the `finalize-research-task` skill** for the complete workflow
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
# During development (no build needed, runs directly from source)
bun run dev <command> [options]

# With auto-rebuild on file changes
bun run dev:watch

# After building (uses compiled dist/)
bun run build
bun run start <command> [options]

# Run integration tests
bun run test:integration

# Run integration tests with watch mode
bun run test:integration:watch
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

Full documentation: [test-server/README.md](../test-server/README.md)

---

## File Structure

This is a monorepo using Bun workspaces and Turborepo:

```
packages/
  core/
    src/
      index.ts        # Core package exports (analyzers, extractors, validators)
    build.ts          # Bun build script
  cli/
    src/
      cli.ts          # CLI entrypoint, command definitions
      commands/       # One file per command
      lib/            # CLI-specific utilities
    build.ts          # Bun build script
  tui/
    src/
      index.tsx       # TUI entrypoint
    build.ts          # Bun build script
  integration-tests/  # Integration test suite
  test-server/        # HTML fixture server
```

### Package Dependencies

- `@webspecs/core` - Foundation package with all core logic
- `@webspecs/cli` - Depends on `core`
- `@webspecs/tui` - Depends on both `core` and `cli`
- `@webspecs/integration-tests` - Depends on `core` and `cli`

When making changes:
- Core changes require rebuilding CLI and TUI
- CLI changes require rebuilding TUI
- Turborepo handles this automatically via task dependencies

## Code Style

- Use TypeScript
- Prefer async/await over callbacks
- Commands should support `--format json` for machine-readable output
- Keep command files focused — extract shared logic to `lib/`

## Dependencies

- **Playwright** is a peer dependency (optional, for JS-rendering commands)
- Lazy-load heavy dependencies — don't load Playwright for static-only commands
- Prefer existing dependencies over adding new ones

---

## Build-Time Target Switching

This project supports dual build targets:
- **npm build** (`bun run build`): Targets Node.js, uses `node:fs` APIs
- **binary build** (`bun run build:global`): Targets Bun, uses optimized `Bun.file()`/`Bun.write()` APIs

### How it works

Build scripts inject `__TARGET_BUN__` as a compile-time constant:
- `build.ts`: `__TARGET_BUN__: 'false'` (Node.js compatible)
- `build-global.ts`: `__TARGET_BUN__: 'true'` (Bun optimized)

### Using the pattern

For runtime-specific APIs, use conditional checks in `src/lib/fs.ts`:

```typescript
declare const __TARGET_BUN__: boolean

export async function readTextFile(path: string): Promise<string> {
  if (__TARGET_BUN__) {
    return Bun.file(path).text()
  }
  return readFile(path, 'utf-8')
}
```

The bundler eliminates dead code branches, so:
- npm package contains zero `Bun.*` references
- Binary contains zero `node:fs` imports for file operations

### Available functions in `src/lib/fs.ts`

| Function | Description |
|----------|-------------|
| `fileExists(path)` | Check if a file exists |
| `readTextFile(path)` | Read a file as text |
| `readJsonFile<T>(path)` | Read and parse a JSON file |
| `writeTextFile(path, content)` | Write text content to a file |
| `mkdir` | Re-exported from `node:fs/promises` |
