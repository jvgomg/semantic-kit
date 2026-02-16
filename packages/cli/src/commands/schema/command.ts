import { validateFormat } from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { buildIssues, formatSchemaOutput } from './formatters.js'
import { fetchSchema } from './runner.js'
import { VALID_FORMATS, type SchemaOptions } from './types.js'

/**
 * Schema command - views structured data (JSON-LD, Microdata, RDFa, Open Graph, Twitter Cards).
 */
export async function schemaCommand(
  target: string,
  options: SchemaOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'schema',
    target,
    fetch: () => fetchSchema(target),
    render: (result) => formatSchemaOutput(result, format, mode),
    json: (result) => ({ result, issues: buildIssues(result) }),
    spinnerMessage: 'Analyzing...',
    completionMessage: `Schema analysis for ${target}`,
  })
}
