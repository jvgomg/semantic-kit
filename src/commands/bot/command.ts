import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { validateFormat, validateTimeout, requireUrl } from '../../lib/validation.js'
import { buildIssues, formatBotOutput } from './formatters.js'
import { fetchBot } from './runner.js'
import { VALID_FORMATS, type BotOptions } from './types.js'

/**
 * Bot command - compares static HTML vs JavaScript-rendered content.
 */
export async function botCommand(
  target: string,
  options: BotOptions,
): Promise<void> {
  requireUrl(target, 'bot')

  const format = validateFormat(options.format, VALID_FORMATS)
  const timeoutMs = validateTimeout(options.timeout)
  const mode = resolveOutputMode(options)
  const showContent = options.content ?? false

  await runCommand({
    mode,
    format,
    commandName: 'bot',
    target,
    fetch: () => fetchBot(target, { timeoutMs }),
    render: (result) => formatBotOutput(result, format, mode, showContent),
    json: (result) => ({
      result,
      issues: buildIssues(result),
    }),
    spinnerMessage: 'Analyzing…',
    completionMessage: `Bot analysis for ${target}`,
  })
}
