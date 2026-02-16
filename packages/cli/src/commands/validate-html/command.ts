import { validateFormat } from '../../lib/arguments.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { buildJsonResult, formatValidateHtmlOutput } from './formatters.js'
import { fetchValidateHtml } from './runner.js'
import { VALID_FORMATS, type ValidateHtmlOptions } from './types.js'

/**
 * Validate HTML command - validates HTML markup against W3C standards.
 */
export async function validateHtmlCommand(
  target: string,
  options: ValidateHtmlOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  const result = await runCommand({
    mode,
    format,
    commandName: 'validate:html',
    target,
    fetch: () => fetchValidateHtml(target),
    render: (report) => formatValidateHtmlOutput(report, format, mode),
    json: (report) => buildJsonResult(report, target),
    spinnerMessage: 'Validating...',
    completionMessage: `HTML validation for ${target}`,
  })

  // Exit with error code only if validation failed
  if (!result.valid) {
    process.exit(1)
  }
}
