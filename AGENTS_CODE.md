# Code Development Guide

Instructions for agents making code changes to semantic-kit.

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
4. **Behavior table** - links to research that drives the command's behavior
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
2. Test command: `bun run semantic-kit:dev <command>`
3. Update ROADMAP.md status tables if applicable
4. Add entry to CHANGELOG.md
5. Bump version in `package.json` and `src/cli.ts` if releasing

## Implementing Backlog Requests

Research-driven change requests live in `docs/backlog/`. When implementing one:

### Before Starting

1. Read the backlog file thoroughly
2. Read the linked research pages to understand the context
3. Verify the proposed approach still makes sense

### While Implementing

1. Follow the implementation approach outlined in the backlog file
2. Refer to linked research for behavior expectations
3. Ask questions if the approach needs clarification

### After Implementing

1. Update the backlog file:
   - Set `toolVersion` to the implementing version (e.g., `v0.0.17`)
   - Set `status` to `completed`

2. Add CHANGELOG entry with research reference:
   ```markdown
   ### Added
   - Remix streaming detection in `ai` command
     - Research: [[streaming-ssr]], research-v0.1.0
   ```

3. Update the research page (see `research/_meta/RESEARCH_GUIDE.md` for full format):

   **Frontmatter** (required) - add to `toolCoverage` array:
   ```yaml
   toolCoverage:
     - finding: "Remix streaming detection"
       command: ai
       since: v0.0.17
   ```

   **Inline callout** (editorial) - add/update if appropriate for readers:
   ```markdown
   > **Tool support:** The `ai` command detects Remix streaming since v0.0.17.
   ```

   Add callouts for new features. Skip for incremental improvements or bug fixes.

4. Move the backlog file to `docs/backlog/_completed/` or delete it

### Backlog Documentation

- Template: `docs/backlog/TEMPLATE.md`
- Process: `docs/backlog/README.md`
- Research cross-referencing: `research/_meta/RESEARCH_GUIDE.md`

## Testing Commands

```bash
# During development (uses tsx, no build needed)
bun run semantic-kit:dev <command> [options]

# After building
bun run build
bun run semantic-kit <command> [options]
```

## Test Server

A local test server serves HTML fixtures for testing commands without external dependencies.

```bash
# Start the test server
bun run test-server

# Start with verbose logging
bun run test-server:verbose

# Test commands against fixtures
bun run semantic-kit:dev structure http://localhost:4000/good/semantic-article.html
bun run semantic-kit:dev validate:a11y http://localhost:4000/bad/div-soup.html
```

### Fixture Organization

```
test-server/fixtures/
  good/           # Well-formed semantic HTML examples
  bad/            # Anti-pattern examples (div soup, missing landmarks)
  edge-cases/     # Boundary conditions (empty content, huge pages)
  responses/      # Custom response behaviors (delays, redirects, errors)
```

### Adding Test Fixtures

1. Create an HTML file in the appropriate category folder
2. Optionally add a `.meta.json` sidecar for response configuration:
   ```json
   {
     "delay": 3000,
     "status": 200,
     "description": "Tests timeout handling",
     "testCases": ["ai", "structure"]
   }
   ```
3. The fixture appears on the index page at `http://localhost:4000/`

### Query Parameter Overrides

Test response behaviors without creating meta files:
- `?delay=5000` — Response delay in ms
- `?status=500` — HTTP status code
- `?redirect=/other.html` — Force redirect

Full documentation: [test-server/README.md](test-server/README.md)

## File Structure

```
src/
  cli.ts              # CLI entrypoint, command definitions
  index.ts            # Package exports
  commands/           # One file per command
  lib/                # Shared utilities
    structure.ts      # Structure analysis and comparison
    formatting.ts     # Output formatting helpers
    playwright.ts     # Browser rendering utilities
    fetch.ts          # HTTP/file fetching
    turndown.ts       # HTML to markdown conversion
    words.ts          # Word counting
    index.ts          # Library exports
```

## Code Style

- Use TypeScript
- Prefer async/await over callbacks
- Commands should support `--format json` for machine-readable output
- Keep command files focused - extract shared logic to `lib/`

## Dependencies

- **Playwright** is a peer dependency (optional, for JS-rendering commands)
- Lazy-load heavy dependencies - don't load Playwright for static-only commands
- Prefer existing dependencies over adding new ones
