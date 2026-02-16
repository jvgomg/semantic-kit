/**
 * HTML validation using html-validate.
 */
import { HtmlValidate, type Report } from 'html-validate'

/**
 * Validate HTML from a URL or file path.
 *
 * @param target - URL (http://, https://) or file path to validate
 * @returns html-validate Report object with validation results
 *
 * @example
 * ```typescript
 * const report = await validateHtml('https://example.com')
 * console.log(`Valid: ${report.valid}, Errors: ${report.errorCount}`)
 * ```
 */
export async function validateHtml(target: string): Promise<Report> {
  const htmlvalidate = new HtmlValidate()

  if (target.startsWith('http://') || target.startsWith('https://')) {
    const response = await fetch(target)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${target}: ${response.status}`)
    }
    const html = await response.text()
    return htmlvalidate.validateString(html, target)
  } else {
    return htmlvalidate.validateFile(target)
  }
}
