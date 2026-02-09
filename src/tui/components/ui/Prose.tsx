/**
 * Prose component for the expandable sections framework.
 *
 * Displays long text content with optional truncation and markdown rendering.
 */
import type { ReactNode } from 'react'
import { Markdown } from './Markdown.js'
import { palette } from '../../theme.js'

export interface ProseProps {
  /** Full text content */
  content: string
  /** Rendering format */
  format?: 'plain' | 'markdown'

  /** Enable truncation (for collapsed state) */
  truncate?: boolean
  /** Maximum lines when truncated (default: 3) */
  maxLines?: number

  /** Word count to display in metadata */
  wordCount?: number
}

/**
 * Truncate text to a maximum number of lines.
 */
function truncateToLines(text: string, maxLines: number): { text: string; truncated: boolean } {
  const lines = text.split('\n')
  if (lines.length <= maxLines) {
    return { text, truncated: false }
  }
  return {
    text: lines.slice(0, maxLines).join('\n'),
    truncated: true,
  }
}

/**
 * Count words in text.
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Prose component.
 *
 * Renders long text content with optional truncation.
 * Supports plain text and markdown formats.
 */
export function Prose({
  content,
  format = 'plain',
  truncate = false,
  maxLines = 3,
  wordCount,
}: ProseProps): ReactNode {
  // Handle truncation
  const { text: displayText, truncated } = truncate
    ? truncateToLines(content, maxLines)
    : { text: content, truncated: false }

  return (
    <box flexDirection="column">
      {/* Word count metadata */}
      {wordCount !== undefined && (
        <box marginBottom={1}>
          <text fg={palette.gray}>{wordCount.toLocaleString()} words</text>
        </box>
      )}

      {/* Content */}
      {format === 'markdown' ? (
        <Markdown>{displayText}</Markdown>
      ) : (
        <box flexDirection="column">
          {displayText.split('\n').map((line, index) => (
            <text key={index}>{line || ' '}</text>
          ))}
        </box>
      )}

      {/* Truncation indicator */}
      {truncated && (
        <box marginTop={1}>
          <text fg={palette.gray}>
            <em>... ({countWords(content) - countWords(displayText)} more words)</em>
          </text>
        </box>
      )}
    </box>
  )
}
