import { fetchHtmlContent } from '../../lib/fetch.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { validateFormat } from '../../lib/validation.js'
import { buildIssues, formatAiOutput } from './formatters.js'
import { fetchAi } from './runner.js'
import { VALID_FORMATS, type AiOptions } from './types.js'

/**
 * AI command - shows what AI crawlers see when fetching static HTML.
 */
export async function aiCommand(
  target: string,
  options: AiOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  // If --raw flag, just output the static HTML (always plain mode)
  if (options.raw) {
    const html = await fetchHtmlContent(target)
    console.log(html)
    return
  }

  await runCommand({
    mode,
    format,
    commandName: 'ai',
    target,
    fetch: () => fetchAi(target),
    render: (result) => formatAiOutput(result, format, mode),
    json: (result) => ({
      result,
      issues: buildIssues(result),
    }),
    spinnerMessage: 'Fetching…',
    completionMessage: `AI bot analysis for ${target}`,
  })
}
