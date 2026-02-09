import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand, handleCommandError } from '../../lib/run-command.js'
import {
  requireUrl,
  validateFormat,
  validateTimeout,
} from '../../lib/validation.js'
import { buildCompareIssues, formatA11yCompareOutput } from './formatters.js'
import { fetchA11yCompare } from './runner-compare.js'
import { VALID_FORMATS_COMPARE, type A11yCompareOptions } from './types.js'

/**
 * A11y:compare command - compares accessibility tree differences between static and hydrated page.
 */
export async function a11yCompareCommand(
  target: string,
  options: A11yCompareOptions,
): Promise<void> {
  requireUrl(target, 'a11y:compare')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS_COMPARE)
  const mode = resolveOutputMode(options)

  try {
    await runCommand({
      mode,
      format,
      commandName: 'a11y:compare',
      target,
      fetch: () => fetchA11yCompare(target, timeoutMs),
      render: (result) => formatA11yCompareOutput(result, format, mode),
      json: (result) => ({ result, issues: buildCompareIssues(result) }),
      spinnerMessage: 'Comparing…',
      completionMessage: `A11y comparison for ${target}`,
    })
  } catch (error) {
    handleCommandError(error)
  }
}
