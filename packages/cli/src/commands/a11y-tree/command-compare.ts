import {
  requireUrl,
  validateFormat,
  validateTimeout,
} from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand, handleCommandError } from '../../lib/run-command.js'
import { buildCompareIssues, formatA11yCompareOutput } from './formatters.js'
import { fetchA11yCompare } from './runner-compare.js'
import { VALID_FORMATS_COMPARE, type A11yCompareOptions } from './types.js'

/**
 * a11y-tree:compare command - compares accessibility tree differences between static and hydrated page.
 */
export async function a11yTreeCompareCommand(
  target: string,
  options: A11yCompareOptions,
): Promise<void> {
  requireUrl(target, 'a11y-tree:compare')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS_COMPARE)
  const mode = resolveOutputMode(options)

  try {
    await runCommand({
      mode,
      format,
      commandName: 'a11y-tree:compare',
      target,
      fetch: () => fetchA11yCompare(target, timeoutMs),
      render: (result) => formatA11yCompareOutput(result, format, mode),
      json: (result) => ({ result, issues: buildCompareIssues(result) }),
      spinnerMessage: 'Comparing…',
      completionMessage: `Accessibility tree comparison for ${target}`,
    })
  } catch (error) {
    handleCommandError(error)
  }
}
