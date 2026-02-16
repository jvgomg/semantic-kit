import { requireUrl, validateFormat, validateTimeout } from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { buildIssuesCompare, formatStructureCompareOutput } from './formatters.js'
import { fetchStructureCompare } from './runner-compare.js'
import { VALID_FORMATS, type StructureCompareOptions } from './types.js'

/**
 * Structure:compare command - compares structural differences between static and hydrated page.
 */
export async function structureCompareCommand(
  target: string,
  options: StructureCompareOptions,
): Promise<void> {
  requireUrl(
    target,
    'structure:compare',
    'Local files cannot execute JavaScript.',
  )
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'structure:compare',
    target,
    fetch: () => fetchStructureCompare(target, timeoutMs),
    render: (result) => formatStructureCompareOutput(result, { format, target }, mode),
    json: (result) => ({
      result: result.comparison,
      issues: buildIssuesCompare(result.comparison, result.timedOut),
    }),
    spinnerMessage: 'Comparing...',
    completionMessage: `Structure comparison for ${target}`,
  })
}
