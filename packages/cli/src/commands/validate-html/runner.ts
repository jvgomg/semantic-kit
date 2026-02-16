import { validateHtml, type HtmlValidateReport } from '@webspecs/core'

/**
 * Fetch and validate HTML from URL or file.
 */
export async function fetchValidateHtml(
  target: string,
): Promise<HtmlValidateReport> {
  return validateHtml(target)
}
