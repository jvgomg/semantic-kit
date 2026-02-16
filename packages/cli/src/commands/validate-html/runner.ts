import { HtmlValidate, type Report } from 'html-validate'

/**
 * Fetch and validate HTML from URL or file.
 */
export async function fetchValidateHtml(target: string): Promise<Report> {
  const htmlvalidate = new HtmlValidate()

  if (target.startsWith('http://') || target.startsWith('https://')) {
    // Fetch URL and validate
    const response = await fetch(target)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${target}: ${response.status}`)
    }
    const html = await response.text()
    return htmlvalidate.validateString(html, target)
  } else {
    // Validate file
    return htmlvalidate.validateFile(target)
  }
}
