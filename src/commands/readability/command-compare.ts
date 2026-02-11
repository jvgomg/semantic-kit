/**
 * Readability:compare command - compares Readability extraction from static vs JS-rendered HTML.
 */
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { requireUrl, validateFormat, validateTimeout } from '../../lib/validation.js'
import { buildCompareIssues, formatReadabilityCompareOutput } from './formatters.js'
import { fetchReadabilityCompare } from './runner-compare.js'
import { VALID_FORMATS, type ReadabilityCompareOptions } from './types.js'

/**
 * Readability:compare command - compares content extraction between static and rendered HTML.
 */
export async function readabilityCompareCommand(
  target: string,
  options: ReadabilityCompareOptions,
): Promise<void> {
  requireUrl(
    target,
    'readability:compare',
    'Local files cannot execute JavaScript.',
  )
  const timeoutMs = validateTimeout(options.timeout)
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'readability:compare',
    target,
    fetch: () => fetchReadabilityCompare(target, timeoutMs),
    render: (result) => formatReadabilityCompareOutput(result, format, mode),
    json: (result) => ({
      result: {
        url: result.url,
        static: {
          extraction: result.static.extraction,
          metrics: result.static.metrics,
          markdown: result.static.markdown,
        },
        rendered: {
          extraction: result.rendered.extraction,
          metrics: result.rendered.metrics,
          markdown: result.rendered.markdown,
        },
        comparison: result.comparison,
        timedOut: result.timedOut,
      },
      issues: buildCompareIssues(result),
    }),
    spinnerMessage: 'Comparing...',
    completionMessage: `Readability comparison for ${target}`,
  })
}
