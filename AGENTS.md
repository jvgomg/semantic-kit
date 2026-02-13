# AGENTS.md

Instructions for agents working on semantic-kit.

## What is semantic-kit?

A developer toolkit for understanding how websites are interpreted by search engines, AI crawlers, screen readers, and content extraction tools.

Developers use it to answer questions like:

- "How does Google see my website?"
- "How do AI tools like Claude and ChatGPT see my website?"
- "How do screen readers interpret my markup?"

## Available Commands

| Command               | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `ai`                  | Show what AI crawlers extract (static HTML → Readability → markdown) |
| `reader`              | Show how browser reader modes see your page (Safari Reader, etc.)    |
| `google`              | Show how Googlebot sees your page (metadata, schema, structure)      |
| `social`              | Show how social platforms see your page (Open Graph, Twitter Cards)  |
| `screen-reader`       | Show how screen readers interpret your page (accessibility tree)     |
| `readability`         | Raw Readability extraction with full metrics (link density, etc.)    |
| `readability:js`      | Same as above, but after JavaScript execution                        |
| `readability:compare` | Compare static vs JS-rendered Readability extraction                 |
| `structure`           | Analyze page structure (landmarks, headings, links)                  |
| `structure:js`        | Same as above, but after JavaScript execution                        |
| `structure:compare`   | Compare static vs hydrated structure                                 |
| `schema`              | Inspect structured data (JSON-LD, Open Graph, etc.)                  |
| `schema:js`           | Same as above, but after JavaScript execution                        |
| `schema:compare`      | Compare static vs JS-rendered structured data                        |
| `a11y-tree`           | Show accessibility tree (static HTML, JS disabled)                   |
| `a11y-tree:js`        | Same as above, but after JavaScript execution                        |
| `a11y-tree:compare`   | Compare static vs hydrated accessibility tree                        |
| `validate:html`       | Validate HTML markup                                                 |
| `validate:schema`     | Validate structured data against platform requirements               |
| `validate:a11y`       | Run accessibility checks (WCAG via axe-core)                         |
| `fetch`               | Fetch and prettify HTML from a URL                                   |
| `tui`                 | Launch interactive terminal UI                                       |

Run `bun run dev <command> --help` for command options.

## Task-Specific Instructions

**Read the appropriate guide before starting work:**

| Task Type              | Instructions                                                              |
| ---------------------- | ------------------------------------------------------------------------- |
| Research documentation | [research/\_meta/AGENT_DIRECTIVES.md](research/_meta/AGENT_DIRECTIVES.md) |
| Code changes           | [AGENTS_CODE.md](AGENTS_CODE.md)                                          |
| Terminal UI            | [src/tui/AGENTS.md](src/tui/AGENTS.md)                                    |
| Test fixtures          | [test-server/README.md](test-server/README.md)                            |

## Project Structure

```
src/
  cli.ts              # CLI entrypoint
  commands/           # One file per command
  lib/                # Shared utilities
    tui-config/       # YAML config file support for TUI
  tui/                # Terminal UI (see src/tui/AGENTS.md)

integration-tests/    # Integration tests (bun:test)
  setup.ts            # Global setup (starts test server once)
  utils/
    cli.ts            # CLI runner with JSON parsing
    server.ts         # Test server lifecycle management
  ai/                 # Tests for `ai` command
  # Future: structure/, schema/, validate/

bunfig.toml           # Bun config (preloads integration-tests/setup.ts)

test-server/          # Local test server for fixtures
  server.ts           # Main entrypoint
  config.ts           # Mount configurations
  lib/                # Server utilities
  fixtures/           # HTML test fixtures
    good/             # Well-formed examples
    bad/              # Anti-pattern examples
    edge-cases/       # Boundary conditions
    responses/        # Custom response behaviors
  apps/               # Dynamic fixture apps (mounted via config.ts)
    nextjs-streaming/ # Next.js App Router for SSR testing

docs/                 # Command documentation (usage-focused)
  backlog/            # Research-driven change requests
research/             # Research documentation (findings, citations)
  entities/           # Company/product-specific (Google, Anthropic, etc.)
  topics/             # Cross-cutting topics (content extraction, etc.)
  _meta/              # Research contribution guides

CHANGELOG.md          # Tool version history
research/CHANGELOG.md # Research version history (separate)
```

## Quick Reference

```bash
# Run commands during development
bun run dev <command> [options]

# Type check
bun run typecheck

# Build
bun run build

# Start test server (serves fixtures on localhost:4000)
bun run test-server

# Test with fixtures
bun run dev ai http://localhost:4000/good/semantic-article.html

# Launch TUI with a YAML config file
bun run dev tui --config ./path/to/urls.yaml

# Integration tests (test server starts automatically via bunfig.toml preload)
bun run test:integration         # Run integration tests
```
