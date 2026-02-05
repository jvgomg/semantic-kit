import { HtmlValidate, formatterFactory, type Report } from 'html-validate'

import type { ValidateHtmlResult } from '../lib/results.js'

type OutputFormat = 'full' | 'brief' | 'compact' | 'json'
type FormatterName = 'stylish' | 'codeframe' | 'text'

const VALID_FORMATS: OutputFormat[] = ['full', 'brief', 'compact', 'json']

/**
 * Map --format values to html-validate formatters
 */
const FORMAT_TO_FORMATTER: Record<
  Exclude<OutputFormat, 'json'>,
  FormatterName
> = {
  full: 'codeframe', // Shows code context around errors
  brief: 'text', // Minimal one-line per error
  compact: 'stylish', // Concise grouped errors
}

interface ValidateHtmlOptions {
  config?: string
  format?: OutputFormat
}

/**
 * Build the result object from html-validate report
 */
function buildValidateHtmlResult(
  report: Report,
  target: string,
): ValidateHtmlResult {
  return {
    target,
    valid: report.valid,
    errorCount: report.errorCount,
    warningCount: report.warningCount,
    results: report.results,
  }
}

export async function validateHtml(
  target: string,
  options: ValidateHtmlOptions,
): Promise<void> {
  // Validate format option
  const format: OutputFormat = options.format ?? 'full'
  if (!VALID_FORMATS.includes(format)) {
    console.error(
      `Error: Invalid --format value: "${options.format}". Must be one of: ${VALID_FORMATS.join(', ')}`,
    )
    process.exit(1)
  }

  const htmlvalidate = new HtmlValidate()

  // For non-JSON formats, use the mapped html-validate formatter
  const formatterName: FormatterName =
    format === 'json' ? 'stylish' : FORMAT_TO_FORMATTER[format]
  const formatter = formatterFactory(formatterName)

  try {
    let report

    if (target.startsWith('http://') || target.startsWith('https://')) {
      // Fetch URL and validate
      const response = await fetch(target)
      if (!response.ok) {
        console.error(`Failed to fetch ${target}: ${response.status}`)
        process.exit(1)
      }
      const html = await response.text()
      report = await htmlvalidate.validateString(html, target)
    } else {
      // Validate file
      report = await htmlvalidate.validateFile(target)
    }

    // JSON output
    if (format === 'json') {
      const result = buildValidateHtmlResult(report, target)
      console.log(JSON.stringify(result, null, 2))
      if (!result.valid) {
        process.exit(1)
      }
      return
    }

    // Output results using html-validate's built-in formatter
    const output = formatter(report.results)
    if (output) {
      console.log(output)
    }

    if (report.valid) {
      console.log(`\n✓ No HTML validation errors found in ${target}`)
    } else {
      process.exit(1)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.error('An unknown error occurred')
    }
    process.exit(1)
  }
}
