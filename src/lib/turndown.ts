import TurndownService from 'turndown'

/**
 * Configure Turndown for clean markdown output
 */
export function createTurndownService(): TurndownService {
  return new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**',
  })
}
