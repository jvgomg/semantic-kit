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

```
src/
  cli.ts              # CLI entrypoint
  commands/           # One file per command
  lib/                # Shared utilities
  tui/                # Terminal UI

directives/           # Agent instructions
  code.md             # Code development guide
  tui.md              # TUI development guide

research/             # Research documentation
  entities/           # Company-specific (Google, Anthropic, etc.)
  topics/             # Cross-cutting topics
  _meta/              # Research guides and logs

test-server/          # HTML fixtures for testing
integration-tests/    # Integration tests
```

## Quick Reference

```bash
# Run commands during development
bun run dev <command> [options]

# Type check
bun run typecheck

# Build
bun run build

# Start test server
bun run test-server

# Integration tests
bun run test:integration
```
