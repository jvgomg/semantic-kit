/**
 * Schema:compare command - compares structured data from static vs JS-rendered HTML.
 */
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import {
  requireUrl,
  validateFormat,
  validateTimeout,
} from '../../lib/validation.js'
import { buildCompareIssues, formatSchemaCompareOutput } from './formatters.js'
import { fetchSchemaCompare } from './runner-compare.js'
import { VALID_FORMATS, type SchemaCompareOptions } from './types.js'

/**
 * Schema:compare command - compares structured data between static and rendered HTML.
 */
export async function schemaCompareCommand(
  target: string,
  options: SchemaCompareOptions,
): Promise<void> {
  requireUrl(
    target,
    'schema:compare',
    'Local files cannot execute JavaScript.',
  )
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'schema:compare',
    target,
    fetch: () => fetchSchemaCompare(target, { timeoutMs }),
    render: (result) => formatSchemaCompareOutput(result, format, mode),
    json: (result) => ({
      result: {
        target: result.target,
        static: result.static,
        rendered: result.rendered,
        comparison: result.comparison,
        timedOut: result.timedOut,
      },
      issues: buildCompareIssues(result),
    }),
    spinnerMessage: 'Comparing schemas...',
    completionMessage: `Schema comparison for ${target}`,
  })
}
