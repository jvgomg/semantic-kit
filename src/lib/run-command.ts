/**
 * Command runner with spinner support and error handling.
 *
 * Provides a unified way to run CLI commands with:
 * - TTY mode: spinner animation while fetching
 * - Plain mode: direct output
 * - JSON mode: clean output without splash/spinner
 * - Centralized error handling
 * - Splash display and timing support
 */

import type { Issue } from './cli-formatting/index.js'
import { createJsonEnvelope } from './json-envelope.js'
import { type OutputMode } from './output-mode.js'
import type { OutputFormat } from './validation.js'
import { VERSION } from './version.js'

// ============================================================================
// Helpers
// ============================================================================

/**
 * Display the tool name and version.
 */
function displaySplash(): void {
  console.log(`semantic-kit v${VERSION}`)
  console.log('')
}

/**
 * Format a duration in milliseconds as a human-readable string.
 */
function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`
}

// ============================================================================
// Spinner
// ============================================================================

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const FRAME_INTERVAL = 80

/**
 * Run an async operation with a spinner, then output the result.
 * Returns the fetch result for post-output logic (e.g., exit codes).
 */
async function runWithSpinner<T>(options: {
  fetch: () => Promise<T>
  render: (result: T) => string
  spinnerMessage: string
  completionMessage: string
}): Promise<T> {
  const { fetch, render, spinnerMessage, completionMessage } = options

  let frameIndex = 0
  let intervalId: ReturnType<typeof setInterval> | null = null

  const startSpinner = () => {
    process.stdout.write(`${FRAMES[0]} ${spinnerMessage}`)
    intervalId = setInterval(() => {
      frameIndex = (frameIndex + 1) % FRAMES.length
      process.stdout.write(`\r${FRAMES[frameIndex]} ${spinnerMessage}`)
    }, FRAME_INTERVAL)
  }

  const stopSpinner = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    process.stdout.write('\r\x1b[K')
  }

  try {
    displaySplash()
    startSpinner()
    const startTime = performance.now()
    const result = await fetch()
    const duration = performance.now() - startTime
    stopSpinner()
    console.log(`${completionMessage}. Took ${formatDuration(duration)}.`)
    console.log('')
    console.log(render(result))
    return result
  } catch (error) {
    stopSpinner()
    throw error
  }
}

// ============================================================================
// Command Runner
// ============================================================================

/**
 * Result from the json callback, containing the data and any issues.
 * The result type R can differ from the fetch result type T when
 * internal data (like axeResult) needs to be stripped for JSON output.
 */
export interface JsonResult<R = unknown> {
  result: R
  issues: Issue[]
}

export interface RunCommandOptions<T> {
  /** Async function to fetch data */
  fetch: () => Promise<T>
  /** Output mode */
  mode: OutputMode
  /** Output format */
  format: OutputFormat
  /** Command name for JSON envelope (e.g., 'ai', 'structure') */
  commandName: string
  /** Target URL or file path */
  target: string
  /** Message to show during spinner (e.g., "Fetching...") */
  spinnerMessage?: string
  /** Message to show after completion (e.g., "AI bot analysis for https://example.com") */
  completionMessage?: string
  /** Function to render result as terminal output (for full/compact/brief formats) */
  render: (result: T) => string
  /** Function to build JSON output data (for json format) */
  json: (result: T) => JsonResult
}

/**
 * Run a command with appropriate output handling based on mode and format.
 * Returns the fetch result for post-output logic (e.g., exit codes).
 *
 * For JSON format: No splash, no spinner, just fetch and output JSON envelope with timing.
 * For terminal formats (full/compact):
 * - TTY mode: shows splash, spinner while fetching, completion message with timing, then outputs result.
 * - Plain mode: shows splash, completion message with timing, then outputs result.
 */
export async function runCommand<T>(options: RunCommandOptions<T>): Promise<T> {
  const {
    fetch,
    render,
    json,
    mode,
    format,
    commandName,
    target,
    spinnerMessage,
    completionMessage,
  } = options

  // JSON format: clean output path
  if (format === 'json') {
    const startTime = performance.now()
    const fetchResult = await fetch()
    const duration = performance.now() - startTime
    const { result, issues } = json(fetchResult)
    const envelope = createJsonEnvelope({
      commandName,
      target,
      durationMs: duration,
      result,
      issues,
    })
    console.log(JSON.stringify(envelope, null, 2))
    return fetchResult
  }

  // Terminal formats (full/compact)
  const resolvedSpinnerMessage = spinnerMessage ?? 'Loading...'
  const resolvedCompletionMessage = completionMessage ?? 'Done'

  if (mode === 'tty') {
    return runWithSpinner({
      fetch,
      render,
      spinnerMessage: resolvedSpinnerMessage,
      completionMessage: resolvedCompletionMessage,
    })
  }

  // Plain mode
  displaySplash()
  const startTime = performance.now()
  const result = await fetch()
  const duration = performance.now() - startTime
  console.log(`${resolvedCompletionMessage}. Took ${formatDuration(duration)}.`)
  console.log('')
  console.log(render(result))
  return result
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Handle errors from command actions.
 * Logs error message and exits with code 1.
 */
export function handleCommandError(error: unknown): never {
  // Check for PlaywrightNotInstalledError by duck typing
  if (
    error instanceof Error &&
    'getInstallInstructions' in error &&
    typeof error.getInstallInstructions === 'function'
  ) {
    console.error(
      `Error: This command requires Playwright.\n\n${error.getInstallInstructions()}`,
    )
  } else if (error instanceof Error) {
    console.error(`Error: ${error.message}`)
  } else {
    console.error('An unknown error occurred')
  }
  process.exit(1)
}
