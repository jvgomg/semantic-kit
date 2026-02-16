/**
 * Readability utility command - raw Readability extraction and analysis.
 */
import { validateFormat } from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { formatReadabilityOutput } from './formatters.js'
import { fetchReadability } from './runner.js'
import { VALID_FORMATS, type ReadabilityOptions } from './types.js'

/**
 * Readability utility command - shows raw Readability extraction with full metrics.
 */
export async function readabilityCommand(
  target: string,
  options: ReadabilityOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'readability',
    target,
    fetch: () => fetchReadability(target),
    render: (result) => formatReadabilityOutput(result, format, mode),
    json: (result) => ({ result, issues: [] }),
    spinnerMessage: 'Extracting...',
    completionMessage: `Readability extraction for ${target}`,
  })
}
