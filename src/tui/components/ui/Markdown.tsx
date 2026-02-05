/**
 * Markdown component for Ink
 * Based on ink-markdown by cameronhunter, adapted for ESM compatibility
 */
import { Marked, type MarkedExtension } from 'marked'
import { Text } from 'ink'
import { markedTerminal } from 'marked-terminal'
import type { TerminalRendererOptions } from 'marked-terminal'

export type MarkdownProps = TerminalRendererOptions & {
  children: string
}

export function Markdown({ children, ...options }: MarkdownProps) {
  // Create a new marked instance to avoid global state
  const instance = new Marked()
  // @types/marked-terminal is outdated, markedTerminal actually returns MarkedExtension
  instance.use(markedTerminal(options) as MarkedExtension)
  const rendered = instance.parse(children)
  // marked.parse can return string | Promise<string>, but with sync renderer it's always string
  const text = typeof rendered === 'string' ? rendered : ''
  return <Text>{text.trim()}</Text>
}
