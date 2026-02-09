/**
 * Markdown Renderer component for OpenTUI
 *
 * Renders markdown content as styled terminal text using marked-terminal.
 *
 * Note: OpenTUI's built-in `<markdown>` component uses Tree-sitter for
 * syntax highlighting of markdown SOURCE code (shows raw markdown with colors).
 * This component instead RENDERS markdown to formatted output (bold, headers,
 * links, etc.) - which is useful for displaying extracted page content.
 *
 * Use this component when you want traditional markdown rendering.
 * Use OpenTUI's `<markdown>` when you want syntax-highlighted markdown source.
 */
import type { ReactNode } from 'react'
import { Marked, type MarkedExtension } from 'marked'
import { markedTerminal } from 'marked-terminal'
import type { TerminalRendererOptions } from 'marked-terminal'

export type MarkdownProps = TerminalRendererOptions & {
  children: string
}

/**
 * Renders markdown content with terminal styling
 */
export function Markdown({ children, ...options }: MarkdownProps): ReactNode {
  // Create a new marked instance to avoid global state
  const instance = new Marked()
  // @types/marked-terminal is outdated, markedTerminal actually returns MarkedExtension
  instance.use(markedTerminal(options) as MarkedExtension)
  const rendered = instance.parse(children)
  // marked.parse can return string | Promise<string>, but with sync renderer it's always string
  const text = typeof rendered === 'string' ? rendered : ''

  // Split into lines and render each
  const lines = text.trim().split('\n')

  return (
    <box flexDirection="column">
      {lines.map((line, index) => (
        <text key={index}>{line || ' '}</text>
      ))}
    </box>
  )
}
