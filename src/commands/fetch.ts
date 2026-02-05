import { common, createEmphasize } from 'emphasize'
import * as prettier from 'prettier'

const emphasize = createEmphasize(common)

interface FetchOptions {
  out?: string
  stream?: boolean
}

export async function fetchHtml(
  url: string,
  options: FetchOptions,
): Promise<void> {
  try {
    // Fetch the HTML
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`)
      process.exit(1)
    }
    const rawHtml = await response.text()

    // Prettify the HTML (fall back to raw if formatting fails)
    let prettyHtml: string
    try {
      prettyHtml = await prettier.format(rawHtml, {
        parser: 'html',
        printWidth: 100,
        tabWidth: 2,
        htmlWhitespaceSensitivity: 'ignore',
      })
    } catch {
      // HTML may be malformed - show raw with a warning
      console.error('⚠ HTML could not be prettified (possibly malformed)\n')
      prettyHtml = rawHtml
    }

    // If output file specified
    if (options.out) {
      await Bun.write(options.out, prettyHtml)
      console.log(`✓ Saved to ${options.out}`)

      // If stream flag, also show in terminal
      if (options.stream) {
        console.log('')
        const highlighted = emphasize.highlight('xml', prettyHtml)
        console.log(highlighted.value)
      }
    } else {
      // Default: show in terminal with syntax highlighting
      const highlighted = emphasize.highlight('xml', prettyHtml)
      console.log(highlighted.value)
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
