/**
 * TUI CLI Entry Point
 *
 * Parses CLI arguments and launches the TUI.
 */

// Bun runtime check - must be before any Bun-specific code
if (typeof Bun === 'undefined') {
  process.stderr.write(`
┌─────────────────────────────────────────────────────────┐
│  @webspecs/tui requires the Bun runtime                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Install Bun:                                           │
│    curl -fsSL https://bun.sh/install | bash             │
│                                                         │
│  Then run:                                              │
│    bunx @webspecs/tui [url]                             │
│                                                         │
│  For Node.js, use the CLI instead:                      │
│    npx @webspecs/cli [command] [url]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
`)
  process.exit(1)
}

import { parseArgs } from 'util'
import { loadTuiConfig, formatConfigError } from './lib/tui-config/index.js'
import { startTui } from './start.js'
import { VERSION } from './lib/version.js'

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    config: { type: 'string', short: 'c' },
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
  },
  allowPositionals: true,
})

if (values.version) {
  console.log(VERSION)
  process.exit(0)
}

if (values.help) {
  console.log(`webspecs-tui v${VERSION}

Usage: webspecs-tui [options] [url]

Options:
  -c, --config <path>  Path to YAML config file
  -h, --help           Show this help message
  -v, --version        Show version number

Arguments:
  url                  URL to open on startup
`)
  process.exit(0)
}

const initialUrl = positionals[0]
let configData: { path: string; config: import('./lib/tui-config/index.js').TuiConfig } | undefined

if (values.config) {
  const result = await loadTuiConfig(values.config)
  if (result.type === 'error') {
    console.error(formatConfigError(result))
    process.exit(1)
  }
  configData = { path: values.config, config: result.config }
}

await startTui({ initialUrl, configData })
