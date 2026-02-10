/**
 * ContentMarkdown - Reusable styled markdown component using OpenTUI's markdown element.
 *
 * Wraps OpenTUI's `<markdown>` with a consistent syntax style for rendering
 * extracted content (articles, documentation, etc.) across all views.
 */
import type { ReactNode } from 'react'
import { SyntaxStyle, RGBA } from '@opentui/core'
import { palette } from '../../theme.js'

/**
 * Shared markdown syntax style for content display.
 * Uses the theme palette for consistent styling across all views.
 */
const contentMarkdownStyle = SyntaxStyle.fromStyles({
  'markup.heading.1': {
    fg: RGBA.fromHex(palette.cyanBright),
    bold: true,
    underline: true,
  },
  'markup.heading.2': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.heading.3': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.heading.4': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.heading.5': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.heading.6': { fg: RGBA.fromHex(palette.cyan), bold: true },
  'markup.bold': { fg: RGBA.fromHex(palette.white), bold: true },
  'markup.strong': { fg: RGBA.fromHex(palette.white), bold: true },
  'markup.italic': { fg: RGBA.fromHex(palette.white), italic: true },
  'markup.list': { fg: RGBA.fromHex(palette.yellow) },
  'markup.quote': { fg: RGBA.fromHex(palette.gray), italic: true },
  'markup.raw': { fg: RGBA.fromHex(palette.green) },
  'markup.raw.block': { fg: RGBA.fromHex(palette.green) },
  'markup.link': { fg: RGBA.fromHex(palette.blue), underline: true },
  'markup.link.url': { fg: RGBA.fromHex(palette.blue), underline: true },
  default: { fg: RGBA.fromHex(palette.white) },
})

export interface ContentMarkdownProps {
  /** The markdown content to render */
  content: string
  /** Optional title to prepend as h1 */
  title?: string
}

/**
 * Renders markdown content with consistent styling across all views.
 */
export function ContentMarkdown({
  content,
  title,
}: ContentMarkdownProps): ReactNode {
  const fullContent = title ? `# ${title}\n\n${content}` : content

  return (
    <markdown
      content={fullContent}
      syntaxStyle={contentMarkdownStyle}
      conceal={false}
    />
  )
}
