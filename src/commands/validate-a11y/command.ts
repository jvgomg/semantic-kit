import { validateFormat, validateTimeout, requireUrl } from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { buildJsonResult, formatA11yValidationOutput } from './formatters.js'
import { runAxeAnalysis, parseLevel } from './runner.js'
import { VALID_FORMATS, type RenderOptions, type ValidateA11yOptions } from './types.js'

/**
 * Validate a11y command - validates accessibility against WCAG guidelines.
 */
export async function validateA11yCommand(
  url: string,
  options: ValidateA11yOptions,
): Promise<void> {
  requireUrl(url, 'validate:a11y')

  const format = validateFormat(options.format, VALID_FORMATS)
  const level = parseLevel(options.level)
  const timeoutMs = validateTimeout(options.timeout)
  const ignoreIncomplete = options.ignoreIncomplete ?? false
  const mode = resolveOutputMode(options)

  const renderOptions: RenderOptions = { format, url, level, ignoreIncomplete }

  const result = await runCommand({
    mode,
    format,
    commandName: 'validate:a11y',
    target: url,
    fetch: () => runAxeAnalysis(url, level, timeoutMs),
    render: (r) => formatA11yValidationOutput(r, renderOptions, mode),
    json: (r) => buildJsonResult(r, url, level, ignoreIncomplete),
    spinnerMessage: 'Validating...',
    completionMessage: `A11y validation for ${url}`,
  })

  // Exit logic after output
  const hasViolations = result.results.violations.length > 0
  const hasIncomplete = result.results.incomplete.length > 0
  if (hasViolations || (hasIncomplete && !ignoreIncomplete)) {
    process.exit(1)
  }
}
