# @webspecs/tui

Interactive terminal UI for webspecs — analyze how websites are interpreted by search engines, AI crawlers, screen readers, and content extractors.

> **Requires Bun runtime.** This package uses [OpenTUI](https://github.com/nicholasgasior/opentui) which depends on Bun-native APIs. It cannot run on Node.js.

## Requirements

- [Bun](https://bun.sh) ≥ 1.0.0

## Usage

Run without installing:

```bash
bunx @webspecs/tui [url]
```

Install globally:

```bash
bun install -g @webspecs/tui
webspecs-tui [url]
```

## Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

See [bun.sh](https://bun.sh) for platform-specific instructions.

## Options

```
webspecs-tui [options] [url]

Options:
  -c, --config <path>  Path to YAML config file
  -h, --help           Show this help message
  -v, --version        Show version number

Arguments:
  url                  URL to open on startup
```

## Node.js Alternative

If you need Node.js compatibility, use the CLI package instead:

```bash
npx @webspecs/cli [command] [url]
```

The CLI supports all analysis commands except the interactive TUI.

## Related Packages

- [`@webspecs/cli`](https://www.npmjs.com/package/@webspecs/cli) — Node.js compatible CLI
- [`@webspecs/core`](https://www.npmjs.com/package/@webspecs/core) — Core library for programmatic use
