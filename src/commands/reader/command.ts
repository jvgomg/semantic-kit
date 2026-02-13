/**
 * Reader command - shows how browser reader modes see your page.
 */
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { validateFormat } from '../../lib/arguments.js'
import { formatReaderOutput } from './formatters.js'
import { fetchReader } from './runner.js'
import { VALID_FORMATS, type ReaderOptions } from './types.js'

/**
 * Reader command - shows how browser reader modes see your page content.
 */
export async function readerCommand(
  target: string,
  options: ReaderOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'reader',
    target,
    fetch: () => fetchReader(target),
    render: (result) => formatReaderOutput(result, format, mode),
    json: (result) => ({ result, issues: [] }),
    spinnerMessage: 'Analyzing...',
    completionMessage: `Reader analysis for ${target}`,
  })
}
