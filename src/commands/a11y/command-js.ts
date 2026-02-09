import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand, handleCommandError } from '../../lib/run-command.js'
import { requireUrl, validateFormat, validateTimeout } from '../../lib/validation.js'
import { buildIssues, formatA11yJsOutput } from './formatters.js'
import { fetchA11yJs } from './runner-js.js'
import { VALID_FORMATS_BASIC, type A11yJsOptions } from './types.js'

/**
 * A11y:js command - shows accessibility tree after JavaScript rendering.
 */
export async function a11yJsCommand(
  target: string,
  options: A11yJsOptions,
): Promise<void> {
  requireUrl(target, 'a11y:js', 'Local files cannot execute JavaScript.')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS_BASIC)
  const mode = resolveOutputMode(options)

  try {
    await runCommand({
      mode,
      format,
      commandName: 'a11y:js',
      target,
      fetch: () => fetchA11yJs(target, timeoutMs),
      render: (result) => formatA11yJsOutput(result, format, mode),
      json: (result) => ({ result, issues: buildIssues(result) }),
      spinnerMessage: 'Analyzing…',
      completionMessage: `A11y analysis (JS) for ${target}`,
    })
  } catch (error) {
    handleCommandError(error)
  }
}
