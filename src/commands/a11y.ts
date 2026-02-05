import {
  analyzeAriaSnapshot,
  formatAriaSnapshot,
} from '../lib/aria-snapshot.js'
import {
  fetchAccessibilitySnapshot,
  PlaywrightNotInstalledError,
} from '../lib/playwright.js'
import type { A11yResult } from '../lib/results.js'
import {
  requireUrl,
  validateFormat,
  validateTimeout,
} from '../lib/validation.js'

// ============================================================================
// Types
// ============================================================================

type OutputFormat = 'full' | 'json'

interface A11yOptions {
  format?: OutputFormat
  timeout?: string
}

// ============================================================================
// Main Command
// ============================================================================

const VALID_FORMATS: OutputFormat[] = ['full', 'json']

export async function a11yView(
  target: string,
  options: A11yOptions,
): Promise<void> {
  requireUrl(target, 'a11y', 'Uses browser with JavaScript disabled.')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS)

  try {
    const { snapshot, timedOut } = await fetchAccessibilitySnapshot(target, {
      javaScriptEnabled: false,
      timeoutMs,
    })

    // Build the result
    const { nodes, counts } = analyzeAriaSnapshot(snapshot)
    const result: A11yResult = {
      url: target,
      snapshot,
      parsed: nodes,
      counts,
      timedOut,
    }

    // JSON output
    if (format === 'json') {
      console.log(JSON.stringify(result, null, 2))
      return
    }

    // Default: formatted view
    console.log(
      formatAriaSnapshot(result.snapshot, result.url, {
        title: 'Accessibility Tree (Static)',
        timedOut: result.timedOut,
      }),
    )
  } catch (error) {
    if (error instanceof PlaywrightNotInstalledError) {
      console.error(
        `Error: The 'a11y' command requires Playwright.\n\n${error.getInstallInstructions()}`,
      )
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
