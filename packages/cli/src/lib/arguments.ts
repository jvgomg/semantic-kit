// ============================================================================
// CLI Argument Utilities
// ============================================================================

/**
 * Output format types used across commands.
 * - `full`: Detailed output with all information
 * - `brief`: Minimal output (used by some commands)
 * - `compact`: Summary/grouped output
 * - `json`: JSON output for scripting
 */
export type OutputFormat = 'full' | 'brief' | 'compact' | 'json'

/**
 * Validate and parse the --format option.
 *
 * @param format - The format value from CLI options
 * @param allowedFormats - Array of formats this command supports
 * @returns The validated format, or exits with error if invalid
 */
export function validateFormat<T extends OutputFormat>(
  format: string | undefined,
  allowedFormats: readonly T[],
  defaultFormat: T = 'full' as T,
): T {
  const value = format ?? defaultFormat

  if (!allowedFormats.includes(value as T)) {
    console.error(
      `Error: Invalid --format value: "${format}". Must be one of: ${allowedFormats.join(', ')}`,
    )
    process.exit(1)
  }

  return value as T
}

/**
 * Validate and parse the --timeout option.
 *
 * @param timeout - The timeout value from CLI options (string or undefined)
 * @param defaultMs - Default timeout in milliseconds (default: 5000)
 * @returns The validated timeout in milliseconds, or exits with error if invalid
 */
export function validateTimeout(
  timeout: string | undefined,
  defaultMs: number = 5000,
): number {
  if (timeout === undefined) {
    return defaultMs
  }

  const timeoutMs = parseInt(timeout, 10)

  if (isNaN(timeoutMs) || timeoutMs <= 0) {
    console.error('Error: --timeout must be a positive number in milliseconds.')
    process.exit(1)
  }

  return timeoutMs
}

/**
 * Validate that a target is a URL (starts with http:// or https://).
 * Exits with error if not a valid URL.
 *
 * @param target - The target to validate
 * @param commandName - The command name for error messages
 * @param reason - Optional reason why URL is required (replaces default message)
 */
export function requireUrl(
  target: string,
  commandName: string,
  reason?: string,
): void {
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    console.error(
      `Error: The ${commandName} command requires a URL (starting with http:// or https://).`,
    )
    console.error(
      reason ?? 'Local file analysis is not supported for this command.',
    )
    process.exit(1)
  }
}

/**
 * Check if a target is a URL.
 *
 * @param target - The target to check
 * @returns true if the target is a URL
 */
export function isUrl(target: string): boolean {
  return target.startsWith('http://') || target.startsWith('https://')
}
