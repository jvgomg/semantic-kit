/**
 * Screen reader command - shows how screen readers interpret your page.
 */
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { validateFormat, validateTimeout } from '../../lib/arguments.js'
import { buildIssues, formatScreenReaderOutput } from './formatters.js'
import { fetchScreenReader } from './runner.js'
import { VALID_FORMATS, type ScreenReaderOptions } from './types.js'

/**
 * Screen reader command - shows how screen readers interpret your page.
 *
 * Always uses JavaScript rendering because real screen readers
 * interact with the rendered page, not static HTML.
 */
export async function screenReaderCommand(
  target: string,
  options: ScreenReaderOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)
  const timeout = validateTimeout(options.timeout)

  await runCommand({
    mode,
    format,
    commandName: 'screen-reader',
    target,
    fetch: () => fetchScreenReader(target, timeout),
    render: (result) => formatScreenReaderOutput(result, format, mode),
    json: (result) => ({ result, issues: buildIssues(result) }),
    spinnerMessage: 'Analyzing accessibility tree...',
    completionMessage: `Screen reader analysis for ${target}`,
  })
}
