/**
 * HeadingOutline component for displaying heading hierarchies.
 *
 * Provides consistent heading outline rendering across all TUI views.
 * Normalizes visual style: uppercase H1/H2, content stats, tree connectors.
 */
import type { ReactNode } from 'react'
import type { HeadingInfo } from '@webspecs/core'
import { Tree, type TreeNode } from './Tree.js'

// ============================================================================
// Types
// ============================================================================

export interface HeadingOutlineProps {
  /** Heading hierarchy to display */
  headings: HeadingInfo[]

  /** Include content statistics (word count, paragraphs, lists). Default: true */
  includeStats?: boolean

  /** Maximum text length before truncation. Default: 50 */
  maxTextLength?: number

  /** Show box-drawing tree lines. Default: true */
  showLines?: boolean
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Truncate text to a maximum length.
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Format content stats string for a heading.
 */
function formatContentStats(heading: HeadingInfo): string {
  const stats: string[] = []

  if (heading.content.wordCount > 0) {
    stats.push(`${heading.content.wordCount} words`)
  }
  if (heading.content.paragraphs > 0) {
    stats.push(`${heading.content.paragraphs}p`)
  }
  if (heading.content.lists > 0) {
    stats.push(`${heading.content.lists}L`)
  }

  return stats.length > 0 ? ` (${stats.join(', ')})` : ''
}

/**
 * Convert a HeadingInfo to a TreeNode.
 */
function headingToTreeNode(
  heading: HeadingInfo,
  options: { includeStats: boolean; maxTextLength: number },
): TreeNode {
  const { includeStats, maxTextLength } = options

  // Uppercase level label (H1, H2, etc.)
  const label = `H${heading.level}`

  // Truncate text and add stats
  const text = truncateText(heading.text, maxTextLength)
  const stats = includeStats ? formatContentStats(heading) : ''
  const meta = text + stats

  return {
    label,
    meta,
    children: heading.children.map((child) =>
      headingToTreeNode(child, options),
    ),
  }
}

/**
 * Convert HeadingInfo array to TreeNode array.
 */
function headingsToTreeNodes(
  headings: HeadingInfo[],
  options: { includeStats: boolean; maxTextLength: number },
): TreeNode[] {
  return headings.map((heading) => headingToTreeNode(heading, options))
}

// ============================================================================
// Component
// ============================================================================

/**
 * HeadingOutline component.
 *
 * Renders a heading hierarchy using the Tree component for consistent
 * visual display with box-drawing connectors.
 *
 * @example
 * ```tsx
 * <HeadingOutline
 *   headings={data.headings.outline}
 *   includeStats={true}
 * />
 * ```
 */
export function HeadingOutline({
  headings,
  includeStats = true,
  maxTextLength = 50,
  showLines = true,
}: HeadingOutlineProps): ReactNode {
  const nodes = headingsToTreeNodes(headings, { includeStats, maxTextLength })

  return <Tree nodes={nodes} showLines={showLines} />
}
