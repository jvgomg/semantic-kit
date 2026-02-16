import { common, createEmphasize } from 'emphasize'
import { writeTextFile } from '../../lib/fs.js'
import { resolveOutputMode } from '../../lib/output-mode.js'
import { runCommand, handleCommandError } from '../../lib/run-command.js'
import { formatFetchOutput } from './formatters.js'
import { fetchAndFormat } from './runner.js'
import type { FetchOptions } from './types.js'

const emphasize = createEmphasize(common)

/**
 * Fetch command - fetches and prettifies HTML from a URL.
 */
export async function fetchCommand(
  url: string,
  options: FetchOptions,
): Promise<void> {
  const mode = resolveOutputMode(options)

  try {
    // If output file specified, handle separately (no spinner needed for file write)
    if (options.out) {
      const result = await fetchAndFormat(url)

      if (result.wasMalformed) {
        console.error('⚠ HTML could not be prettified (possibly malformed)\n')
      }

      await writeTextFile(options.out, result.prettyHtml)
      console.log(`✓ Saved to ${options.out}`)

      // If stream flag, also show in terminal
      if (options.stream) {
        console.log('')
        const highlighted = emphasize.highlight('xml', result.prettyHtml)
        console.log(highlighted.value)
      }
      return
    }

    // Default: show in terminal with spinner support
    await runCommand({
      mode,
      format: 'full',
      commandName: 'fetch',
      target: url,
      fetch: () => fetchAndFormat(url),
      render: formatFetchOutput,
      json: (result) => ({ result, issues: [] }),
      spinnerMessage: 'Fetching…',
      completionMessage: `Fetched ${url}`,
    })
  } catch (error) {
    handleCommandError(error)
  }
}
