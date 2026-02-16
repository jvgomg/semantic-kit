import { readTextFile } from './fs.js'

/**
 * Fetch HTML from URL or read from file
 */
export async function fetchHtmlContent(target: string): Promise<string> {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    const response = await fetch(target)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${target}: ${response.status}`)
    }
    return response.text()
  }

  return readTextFile(target)
}
