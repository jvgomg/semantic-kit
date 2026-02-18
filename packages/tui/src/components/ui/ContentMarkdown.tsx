/**
 * ContentMarkdown - Reusable styled markdown component using OpenTUI's markdown element.
 *
 * Wraps OpenTUI's `<markdown>` with a consistent syntax style for rendering
 * extracted content (articles, documentation, etc.) across all views.
 */
import { useMemo, type ReactNode } from 'react'
import { SyntaxStyle, RGBA } from '@opentui/core'
import { useSemanticColors } from '../../theme.js'

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
  const colors = useSemanticColors()

  // Memoize the syntax style to avoid recreating on every render
  const contentMarkdownStyle = useMemo(() => {
    return SyntaxStyle.fromStyles({
      'markup.heading.1': {
        fg: RGBA.fromHex(colors.markdownHeading1),
        bold: true,
        underline: true,
      },
      'markup.heading.2': {
        fg: RGBA.fromHex(colors.markdownHeading),
        bold: true,
      },
      'markup.heading.3': {
        fg: RGBA.fromHex(colors.markdownHeading),
        bold: true,
      },
      'markup.heading.4': {
        fg: RGBA.fromHex(colors.markdownHeading),
        bold: true,
      },
      'markup.heading.5': {
        fg: RGBA.fromHex(colors.markdownHeading),
        bold: true,
      },
      'markup.heading.6': {
        fg: RGBA.fromHex(colors.markdownHeading),
        bold: true,
      },
      'markup.bold': { fg: RGBA.fromHex(colors.text), bold: true },
      'markup.strong': { fg: RGBA.fromHex(colors.text), bold: true },
      'markup.italic': { fg: RGBA.fromHex(colors.text), italic: true },
      'markup.list': { fg: RGBA.fromHex(colors.markdownList) },
      'markup.quote': { fg: RGBA.fromHex(colors.markdownQuote), italic: true },
      'markup.raw': { fg: RGBA.fromHex(colors.markdownCode) },
      'markup.raw.block': { fg: RGBA.fromHex(colors.markdownCode) },
      'markup.link': { fg: RGBA.fromHex(colors.markdownLink), underline: true },
      'markup.link.url': {
        fg: RGBA.fromHex(colors.markdownLink),
        underline: true,
      },
      default: { fg: RGBA.fromHex(colors.text) },
    })
  }, [colors])

  const fullContent = title ? `# ${title}\n\n${content}` : content

  return (
    <markdown
      content={fullContent}
      syntaxStyle={contentMarkdownStyle}
      conceal={false}
    />
  )
}
