import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { requireUrl, validateFormat, validateTimeout } from '../../lib/arguments.js'
import { buildIssuesJs, formatStructureJsOutput } from './formatters.js'
import { fetchStructureJs } from './runner-js.js'
import { VALID_FORMATS, type StructureJsOptions } from './types.js'

/**
 * Structure:js command - shows page structure after JavaScript rendering.
 */
export async function structureJsCommand(
  target: string,
  options: StructureJsOptions,
): Promise<void> {
  requireUrl(target, 'structure:js', 'Local files cannot execute JavaScript.')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'structure:js',
    target,
    fetch: () => fetchStructureJs(target, { timeoutMs, allRules: options.allRules }),
    render: (result) => formatStructureJsOutput(result, { format, target }, mode),
    json: (result) => ({
      result: {
        static: result.static,
        hydrated: result.hydrated,
        comparison: result.comparison,
        timedOut: result.timedOut,
      },
      issues: buildIssuesJs(result.hydrated, result.axeResult, result.timedOut),
    }),
    spinnerMessage: 'Analyzing...',
    completionMessage: `Structure analysis (JS) for ${target}`,
  })
}
