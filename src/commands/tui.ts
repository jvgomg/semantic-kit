import { loadTuiConfig, formatConfigError, type TuiConfig } from '../lib/tui-config/index.js'

/**
 * Options for the TUI command.
 */
export interface TuiCommandOptions {
  /** Path to YAML config file */
  config?: string
}

export async function tuiCommand(
  url: string | undefined,
  options: TuiCommandOptions,
): Promise<void> {
  // Validate mutual exclusivity: URL arg XOR --config
  if (url && options.config) {
    console.error('Error: Cannot specify both a URL argument and --config option.')
    console.error('Use either: semantic-kit tui <url>')
    console.error('       or: semantic-kit tui --config <path>')
    process.exit(1)
  }

  // Load config if provided
  let configData: { path: string; config: TuiConfig } | undefined
  if (options.config) {
    const result = await loadTuiConfig(options.config)
    if (result.type === 'error') {
      console.error(formatConfigError(result))
      process.exit(1)
    }
    configData = { path: result.path, config: result.config }
  }

  // Dynamic import to avoid loading React/OpenTUI for non-TUI commands
  const { startTui } = await import('../tui/index.js')
  await startTui({ initialUrl: url, configData })
}
