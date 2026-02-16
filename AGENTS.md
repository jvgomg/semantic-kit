# AGENTS.md

Instructions for agents working on semantic-kit.

## What is semantic-kit?

A developer toolkit for understanding how websites are interpreted by search engines, AI crawlers, screen readers, and content extraction tools.

Developers use it to answer questions like:

- "How does Google see my website?"
- "How do AI tools like Claude and ChatGPT see my website?"
- "How do screen readers interpret my markup?"

## Directives

Load the appropriate guide based on your task:

| Task | Directive |
|------|-----------|
| Code changes | [directives/code.md](directives/code.md) |
| Terminal UI development | [directives/tui.md](directives/tui.md) |
| Research documentation | [research/_meta/README.md](research/_meta/README.md) |
| Test fixtures | [test-server/README.md](test-server/README.md) |

## Skills

Load skills for specialized workflows:

| Skill | When to Use |
|-------|-------------|
| `research-workflow` | Performing research tasks (verifying, updating, creating pages) |
| `research-backlog-task` | Creating backlog tasks from research findings |
| `finalize-research-task` | Completing research-backed implementation tasks (for developers) |
| `jotai-expert` | Working with Jotai state management in React |
| `opentui` | Working with the OpenTUI library |

Skills are located in `.agents/skills/`.

## Available Commands

| Command | Purpose |
|---------|---------|
| `ai` | Show what AI crawlers extract |
| `reader` | Show how browser reader modes see your page |
| `google` | Show how Googlebot sees your page |
| `social` | Show how social platforms see your page |
| `screen-reader` | Show how screen readers interpret your page |
| `readability` | Raw Readability extraction with metrics |
| `structure` | Analyze page structure (landmarks, headings, links) |
| `schema` | Inspect structured data (JSON-LD, Open Graph) |
| `a11y-tree` | Show accessibility tree |
| `validate:html` | Validate HTML markup |
| `validate:schema` | Validate structured data |
| `validate:a11y` | Run accessibility checks (WCAG via axe-core) |
| `fetch` | Fetch and prettify HTML from a URL |
| `tui` | Launch interactive terminal UI |

Commands support `:js` suffix for JavaScript-rendered content and `:compare` for static vs JS comparison.

Run `bun run dev <command> --help` for options.

## Project Structure

This is a monorepo using Bun workspaces and Turborepo for task orchestration.

```
packages/
  core/               # @webspecs/core - Core analyzers and extractors
    src/              # Source code
    build.ts          # Bun build script
  cli/                # @webspecs/cli - CLI tool
    src/
      cli.ts          # CLI entrypoint
      commands/       # One file per command
      lib/            # Shared utilities
    build.ts          # Bun build script
  tui/                # @webspecs/tui - Terminal UI (Bun-only)
    src/
      index.tsx       # TUI entrypoint
    build.ts          # Bun build script
  integration-tests/  # Integration test suite
  test-server/        # HTML fixture server
  test-server-nextjs/ # Next.js streaming fixture

directives/           # Agent instructions
  code.md             # Code development guide
  tui.md              # TUI development guide

research/             # Research documentation
  entities/           # Company-specific (Google, Anthropic, etc.)
  topics/             # Cross-cutting topics
  _meta/              # Research guides and logs

turbo.json            # Turborepo task configuration
```

## Build System

The project uses **Turborepo** for efficient task orchestration across packages:

- **Parallel execution**: Tasks run in parallel where dependencies allow
- **Smart caching**: Build outputs are cached; rebuilds are instant when unchanged
- **Task dependencies**: Core builds before CLI, which builds before TUI
- **Watch mode**: File watchers with automatic rebuilds for development

All build tasks use Bun's native bundler with TypeScript declaration generation.

## Quick Reference

### Development

```bash
# Run CLI commands during development (no build needed)
bun run dev <command> [options]

# Run CLI with auto-rebuild on file changes
bun run dev:watch

# Run TUI during development
bun run dev:tui

# Run TUI with auto-rebuild on file changes
bun run dev:watch:tui
```

### Building

```bash
# Build all packages (respects dependency order)
bun run build

# Type check all packages
bun run typecheck

# Clean build artifacts
bun run clean
```

### Code Quality

```bash
# Lint all packages
bun run lint

# Format code (Prettier)
bun run pretty

# Check formatting
bun run pretty:check
```

### Testing

```bash
# Run all tests (unit + integration)
bun run test

# Run unit tests only
bun run test:unit

# Run integration tests
bun run test:integration

# Run integration tests with watch mode
bun run test:integration:watch
```

### Test Servers

```bash
# Start HTML fixture server (localhost:4000)
bun run test-server

# Start with verbose logging
bun run test-server:verbose
```

### Package Management

```bash
# Validate workspace dependencies
bun run manypkg:check

# Fix workspace dependency issues
bun run manypkg:fix
```
