import { requireUrl, validateFormat, validateTimeout } from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand, handleCommandError } from '../../lib/run-command.js'
import { buildIssues, formatA11yOutput } from './formatters.js'
import { fetchA11y } from './runner.js'
import { VALID_FORMATS_BASIC, type A11yOptions } from './types.js'

/**
 * a11y-tree command - shows accessibility tree from static HTML (JavaScript disabled).
 */
export async function a11yTreeCommand(
  target: string,
  options: A11yOptions,
): Promise<void> {
  requireUrl(target, 'a11y-tree', 'Uses browser with JavaScript disabled.')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS_BASIC)
  const mode = resolveOutputMode(options)

  try {
    await runCommand({
      mode,
      format,
      commandName: 'a11y-tree',
      target,
      fetch: () => fetchA11y(target, timeoutMs),
      render: (result) => formatA11yOutput(result, format, mode),
      json: (result) => ({ result, issues: buildIssues(result) }),
      spinnerMessage: 'Analyzing…',
      completionMessage: `Accessibility tree for ${target}`,
    })
  } catch (error) {
    handleCommandError(error)
  }
}
