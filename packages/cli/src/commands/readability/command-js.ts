/**
 * Readability:js utility command - Readability extraction after JavaScript rendering.
 */
import {
  requireUrl,
  validateFormat,
  validateTimeout,
} from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { formatReadabilityJsOutput } from './formatters.js'
import { fetchReadabilityJs } from './runner-js.js'
import { VALID_FORMATS, type ReadabilityJsOptions } from './types.js'

/**
 * Readability:js utility command - shows Readability extraction after JS rendering.
 */
export async function readabilityJsCommand(
  target: string,
  options: ReadabilityJsOptions,
): Promise<void> {
  requireUrl(target, 'readability:js', 'Local files cannot execute JavaScript.')
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'readability:js',
    target,
    fetch: () => fetchReadabilityJs(target, { timeoutMs }),
    render: (result) => formatReadabilityJsOutput(result, format, mode),
    json: (result) => ({
      result: {
        url: result.url,
        extraction: result.extraction,
        metrics: result.metrics,
        markdown: result.markdown,
        html: result.html,
        timedOut: result.timedOut,
      },
      issues: [],
    }),
    spinnerMessage: 'Rendering and extracting...',
    completionMessage: `Readability extraction (JS) for ${target}`,
  })
}
