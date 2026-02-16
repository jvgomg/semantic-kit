/**
 * Output mode detection for CLI commands.
 *
 * Determines whether to use TTY mode (with spinners) or plain mode (direct output).
 */

export type OutputMode = 'tty' | 'plain'

export interface OutputModeOptions {
  plain?: boolean
  ci?: boolean
  format?: string
}

/**
 * Resolve the output mode based on options and environment.
 *
 * Detection priority (highest to lowest):
 * 1. --plain or --ci flag → plain mode
 * 2. --format=json → plain mode (machine output shouldn't have spinners)
 * 3. CI environment variable → plain mode
 * 4. stdout.isTTY === false → plain mode
 * 5. Otherwise → tty mode
 */
export function resolveOutputMode(options: OutputModeOptions): OutputMode {
  // Explicit flags take priority
  if (options.plain || options.ci) return 'plain'

  // JSON format implies machine consumption
  if (options.format === 'json') return 'plain'

  // CI environment
  if (process.env['CI']) return 'plain'

  // Not a TTY (piped output)
  if (!process.stdout.isTTY) return 'plain'

  return 'tty'
}
