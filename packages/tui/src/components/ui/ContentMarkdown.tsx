/**
 * ContentMarkdown - Reusable styled markdown component using OpenTUI's markdown element.
 *
 * Wraps OpenTUI's `<markdown>` with a consistent syntax style for rendering
 * extracted content (articles, documentation, etc.) across all views.
 */
import { useMemo, type ReactNode } from 'react'
import { SyntaxStyle, RGBA } from '@opentui/core'
import { usePalette } from '../../theme.js'

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
  const palette = usePalette()

  // Memoize the syntax style to avoid recreating on every render
  const contentMarkdownStyle = useMemo(() => {
    return SyntaxStyle.fromStyles({
      'markup.heading.1': {
        fg: RGBA.fromHex(palette.base0C),
        bold: true,
        underline: true,
      },
      'markup.heading.2': { fg: RGBA.fromHex(palette.base0D), bold: true },
      'markup.heading.3': { fg: RGBA.fromHex(palette.base0D), bold: true },
      'markup.heading.4': { fg: RGBA.fromHex(palette.base0D), bold: true },
      'markup.heading.5': { fg: RGBA.fromHex(palette.base0D), bold: true },
      'markup.heading.6': { fg: RGBA.fromHex(palette.base0D), bold: true },
      'markup.bold': { fg: RGBA.fromHex(palette.base05), bold: true },
      'markup.strong': { fg: RGBA.fromHex(palette.base05), bold: true },
      'markup.italic': { fg: RGBA.fromHex(palette.base05), italic: true },
      'markup.list': { fg: RGBA.fromHex(palette.base0A) },
      'markup.quote': { fg: RGBA.fromHex(palette.base03), italic: true },
      'markup.raw': { fg: RGBA.fromHex(palette.base0B) },
      'markup.raw.block': { fg: RGBA.fromHex(palette.base0B) },
      'markup.link': { fg: RGBA.fromHex(palette.base0D), underline: true },
      'markup.link.url': { fg: RGBA.fromHex(palette.base0D), underline: true },
      default: { fg: RGBA.fromHex(palette.base05) },
    })
  }, [palette])

  const fullContent = title ? `# ${title}\n\n${content}` : content

  return (
    <markdown
      content={fullContent}
      syntaxStyle={contentMarkdownStyle}
      conceal={false}
    />
  )
}
