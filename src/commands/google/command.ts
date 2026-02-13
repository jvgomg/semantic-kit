/**
 * Google lens command - shows how Googlebot sees your page.
 */
import { validateFormat } from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { buildIssues, formatGoogleOutput } from './formatters.js'
import { fetchGoogle } from './runner.js'
import { VALID_FORMATS, type GoogleOptions } from './types.js'

/**
 * Google lens command - shows how Googlebot sees your page.
 * Displays page metadata, Google-recognized structured data, and heading structure.
 */
export async function googleCommand(
  target: string,
  options: GoogleOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'google',
    target,
    fetch: () => fetchGoogle(target),
    render: (result) => formatGoogleOutput(result, format, mode),
    json: (result) => ({
      result,
      issues: buildIssues(result),
    }),
    spinnerMessage: 'Analyzing...',
    completionMessage: `Google lens analysis for ${target}`,
  })
}
