/**
 * Schema:js utility command - Structured data extraction after JavaScript rendering.
 */
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import {
  requireUrl,
  validateFormat,
  validateTimeout,
} from '../../lib/arguments.js'
import { buildIssues, formatSchemaOutput } from './formatters.js'
import { fetchSchemaJs } from './runner-js.js'
import { VALID_FORMATS, type SchemaJsOptions } from './types.js'

/**
 * Schema:js utility command - shows structured data after JS rendering.
 */
export async function schemaJsCommand(
  target: string,
  options: SchemaJsOptions,
): Promise<void> {
  requireUrl(target, 'schema:js', 'Local files cannot execute JavaScript.')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'schema:js',
    target,
    fetch: () => fetchSchemaJs(target, { timeoutMs }),
    render: (result) => formatSchemaOutput(result, format, mode),
    json: (result) => ({
      result: {
        target: result.target,
        jsonld: result.jsonld,
        microdata: result.microdata,
        rdfa: result.rdfa,
        openGraph: result.openGraph,
        twitter: result.twitter,
        metatags: result.metatags,
        timedOut: result.timedOut,
      },
      issues: buildIssues(result),
    }),
    spinnerMessage: 'Rendering and analyzing...',
    completionMessage: `Schema analysis (JS) for ${target}`,
  })
}
