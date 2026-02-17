/**
 * Validate A11y View - Shows WCAG accessibility validation results.
 */
import type { WcagLevel } from '@webspecs/core'
import { runAxeAnalysis, PlaywrightNotInstalledError } from '@webspecs/core'
import {
  ValidateA11yViewContent,
  type TuiA11yResult,
} from './components/ValidateA11yViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

// Default configuration for TUI usage
const DEFAULT_LEVEL: WcagLevel = 'aa'
const DEFAULT_TIMEOUT_MS = 30000

/**
 * Fetch a11y validation results with TUI-specific configuration.
 * Wraps runAxeAnalysis with default values and error handling.
 */
async function fetchA11yValidation(url: string): Promise<TuiA11yResult> {
  try {
    const analysis = await runAxeAnalysis(
      url,
      DEFAULT_LEVEL,
      DEFAULT_TIMEOUT_MS,
    )
    return {
      analysis,
      level: DEFAULT_LEVEL,
      timeoutMs: DEFAULT_TIMEOUT_MS,
    }
  } catch (error) {
    if (error instanceof PlaywrightNotInstalledError) {
      // Re-throw with user-friendly message
      throw new Error(
        `Playwright is required for accessibility validation.\n\n${error.getInstallInstructions()}`,
      )
    }
    throw error
  }
}

export const validateA11yView: ViewDefinition<TuiA11yResult> = {
  id: 'validate-a11y',
  label: 'A11y Validate',
  description:
    'Runs WCAG accessibility checks using axe-core. Requires Playwright.',
  category: 'tool',
  fetch: fetchA11yValidation,
  Component: ValidateA11yViewContent,
}

// Self-register
registerView(validateA11yView)
