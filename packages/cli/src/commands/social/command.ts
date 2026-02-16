/**
 * Social lens command - shows how social media platforms see your page.
 */
import { validateFormat } from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { buildIssues, formatSocialOutput } from './formatters.js'
import { fetchSocial } from './runner.js'
import { VALID_FORMATS, type SocialOptions } from './types.js'

/**
 * Social lens command - shows how social media platforms see your page.
 * Displays Open Graph tags, Twitter Card tags, and a preview of how the
 * link will appear when shared.
 */
export async function socialCommand(
  target: string,
  options: SocialOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  await runCommand({
    mode,
    format,
    commandName: 'social',
    target,
    fetch: () => fetchSocial(target),
    render: (result) => formatSocialOutput(result, format, mode),
    json: (result) => ({
      result,
      issues: buildIssues(result),
    }),
    spinnerMessage: 'Analyzing...',
    completionMessage: `Social lens analysis for ${target}`,
  })
}
