import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { validateFormat } from '../../lib/arguments.js'
import { buildIssues, formatStructureOutput } from './formatters.js'
import { fetchStructure } from './runner.js'
import { VALID_FORMATS, type StructureOptions } from './types.js'

/**
 * Structure command - shows page structure (landmarks, headings, links).
 */
export async function structureCommand(
  target: string,
  options: StructureOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'structure',
    target,
    fetch: () => fetchStructure(target),
    render: (result) => formatStructureOutput(result, format, mode),
    json: (result) => ({
      result: result.analysis,
      issues: buildIssues(result.analysis, result.axeResult),
    }),
    spinnerMessage: 'Analyzing...',
    completionMessage: `Structure analysis for ${target}`,
  })
}
