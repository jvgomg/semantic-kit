import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand } from '../../lib/run-command.js'
import { validateFormat } from '../../lib/arguments.js'
import { buildJsonResult, formatSchemaValidationOutput } from './formatters.js'
import { fetchSchemaValidation } from './runner.js'
import {
  VALID_FORMATS,
  type SchemaRenderOptions,
  type ValidateSchemaOptions,
} from './types.js'

/**
 * Validate schema command - validates structured data against platform requirements.
 */
export async function validateSchemaCommand(
  target: string,
  options: ValidateSchemaOptions,
): Promise<void> {
  const format = validateFormat(options.format, VALID_FORMATS)
  const mode = resolveOutputMode(options)

  const renderOptions: SchemaRenderOptions = {
    format,
    target,
    presetsOption: options.presets,
  }

  const result = await runCommand({
    mode,
    format,
    commandName: 'validate:schema',
    target,
    fetch: () => fetchSchemaValidation(target, options.presets),
    render: (r) => formatSchemaValidationOutput(r, renderOptions, mode),
    json: (r) => buildJsonResult(r, target),
    spinnerMessage: 'Validating...',
    completionMessage: `Schema validation for ${target}`,
  })

  // Exit with error code only if required tests failed
  if (result.requiredFailedCount > 0) {
    process.exit(1)
  }
}
