/**
 * Config file loading and validation.
 *
 * Reads YAML config files from disk, parses them, and validates
 * against the Zod schema. Returns typed results with clear error messages.
 */
import { parse as parseYaml, YAMLParseError } from 'yaml'
import { TuiConfigSchema } from './schema.js'
import type { ConfigLoadResult } from './types.js'

/**
 * Load and validate a TUI config file.
 *
 * @param path - Path to the YAML config file
 * @returns Result containing the parsed config or an error
 */
export async function loadTuiConfig(path: string): Promise<ConfigLoadResult> {
  // Read file from disk
  let content: string
  try {
    const file = Bun.file(path)
    if (!(await file.exists())) {
      return {
        type: 'error',
        errorType: 'file-not-found',
        message: `Config file not found: ${path}`,
        path,
      }
    }
    content = await file.text()
  } catch (error) {
    return {
      type: 'error',
      errorType: 'read-error',
      message: error instanceof Error ? error.message : 'Failed to read config file',
      path,
    }
  }

  // Parse YAML
  let parsed: unknown
  try {
    parsed = parseYaml(content)
  } catch (error) {
    if (error instanceof YAMLParseError) {
      return {
        type: 'error',
        errorType: 'parse-error',
        message: `YAML parse error: ${error.message}`,
        path,
      }
    }
    return {
      type: 'error',
      errorType: 'parse-error',
      message: 'Failed to parse YAML',
      path,
    }
  }

  // Validate against schema
  const result = TuiConfigSchema.safeParse(parsed)
  if (!result.success) {
    const details = result.error.issues.map((issue) => {
      const path = issue.path.join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    return {
      type: 'error',
      errorType: 'validation-error',
      message: 'Config validation failed',
      path,
      details,
    }
  }

  return {
    type: 'success',
    config: result.data,
    path,
  }
}

/**
 * Format a config load error for display.
 */
export function formatConfigError(error: ConfigLoadResult): string {
  if (error.type === 'success') {
    return ''
  }

  const lines = [`Error loading config: ${error.message}`]

  if (error.details && error.details.length > 0) {
    lines.push('')
    lines.push('Validation errors:')
    for (const detail of error.details) {
      lines.push(`  - ${detail}`)
    }
  }

  return lines.join('\n')
}
