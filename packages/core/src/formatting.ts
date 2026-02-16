/**
 * Shared formatting utilities for structure analysis output.
 * Used by structure, structure:js, and structure:compare commands.
 */

import type {
  LandmarkSkeleton,
  ElementCount,
  LandmarkNode,
  LinkGroup,
  LinkDetail,
  HeadingInfo,
  StructureWarning,
} from './structure.js'

// ============================================================================
// Landmark Formatting
// ============================================================================

/**
 * Format landmark skeleton for compact display
 */
export function formatLandmarkSkeletonCompact(
  skeleton: LandmarkSkeleton[],
): string {
  const parts: string[] = []
  for (const landmark of skeleton) {
    if (landmark.count > 0) {
      const countSuffix = landmark.count > 1 ? ` (${landmark.count})` : ''
      parts.push(`${landmark.role}${countSuffix}`)
    }
  }
  return parts.length > 0 ? parts.join(' · ') : '(none)'
}

/**
 * Format landmark skeleton with all roles
 */
export function formatLandmarkSkeleton(skeleton: LandmarkSkeleton[]): string[] {
  return skeleton.map((landmark) => `│   ${landmark.role}: ${landmark.count}`)
}

/**
 * Format element counts
 */
export function formatElements(elements: ElementCount[]): string[] {
  if (elements.length === 0) {
    return ['│   (none)']
  }
  return elements.map((el) => `│   ${el.element}: ${el.count}`)
}

/**
 * Format outline with indentation
 */
export function formatOutline(
  nodes: LandmarkNode[],
  indent: number = 0,
): string[] {
  const lines: string[] = []
  const prefix = '│   ' + '  '.repeat(indent)

  for (const node of nodes) {
    const markup = node.role
      ? `<${node.tag} role="${node.role}">`
      : `<${node.tag}>`
    lines.push(`${prefix}${markup}`)
    if (node.children.length > 0) {
      lines.push(...formatOutline(node.children, indent + 1))
    }
  }

  return lines
}

// ============================================================================
// Link Formatting
// ============================================================================

/**
 * Format link attributes as badges
 */
export function formatLinkBadges(link: LinkDetail): string {
  const badges: string[] = []
  if (link.targetBlank) badges.push('_blank')
  if (link.noopener) badges.push('noopener')
  if (link.noreferrer) badges.push('noreferrer')
  return badges.length > 0 ? ` [${badges.join(', ')}]` : ''
}

/**
 * Format link groups for display
 */
export function formatLinkGroups(
  groups: LinkGroup[],
  showFull: boolean,
  limit: number,
  indent: string,
): { lines: string[]; truncated: number } {
  const lines: string[] = []
  const groupsToShow = showFull ? groups : groups.slice(0, limit)

  for (const group of groupsToShow) {
    // Show destination with count
    const countSuffix = group.count > 1 ? ` (${group.count})` : ''
    lines.push(`${indent}${group.destination}${countSuffix}`)

    // Show individual links with details (limit to 3 per group unless --full)
    const linksToShow = showFull ? group.links : group.links.slice(0, 3)
    for (const link of linksToShow) {
      const badges = formatLinkBadges(link)
      const text = link.text || '(no text)'
      lines.push(`${indent}  "${text}"${badges}`)
    }
    if (!showFull && group.links.length > 3) {
      lines.push(`${indent}  ... and ${group.links.length - 3} more links`)
    }
  }

  const truncated = groups.length - groupsToShow.length
  return { lines, truncated }
}

// ============================================================================
// Heading Formatting
// ============================================================================

/**
 * Format heading counts for compact display
 */
export function formatHeadingsSummary(counts: Record<string, number>): string {
  if (Object.keys(counts).length === 0) return '(none)'

  return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    .filter((h) => counts[h])
    .map((h) => `${counts[h]}×${h}`)
    .join(' · ')
}

/**
 * Format content stats as a summary line
 */
export function formatContentStats(content: HeadingInfo['content']): string {
  const parts: string[] = []

  if (content.wordCount > 0) {
    parts.push(`${content.wordCount} words`)
  }
  if (content.paragraphs > 0) {
    parts.push(
      `${content.paragraphs} paragraph${content.paragraphs > 1 ? 's' : ''}`,
    )
  }
  if (content.lists > 0) {
    parts.push(`${content.lists} list${content.lists > 1 ? 's' : ''}`)
  }

  if (parts.length === 0) {
    return '⚠ no content'
  }

  return parts.join(' · ')
}

/**
 * Format heading hierarchy with indentation and content stats
 */
export function formatHeadingTree(
  headings: HeadingInfo[],
  indent: number = 0,
): string[] {
  const lines: string[] = []
  const prefix = '│   ' + '  '.repeat(indent)
  const statsPrefix = '│   ' + '  '.repeat(indent) + '  '

  for (const heading of headings) {
    lines.push(`${prefix}h${heading.level}: ${heading.text}`)
    lines.push(`${statsPrefix}${formatContentStats(heading.content)}`)
    if (heading.children.length > 0) {
      lines.push(...formatHeadingTree(heading.children, indent + 1))
    }
  }

  return lines
}

// ============================================================================
// Warning Formatting
// ============================================================================

const WARNING_ICONS = {
  error: '✗',
  warning: '⚠',
} as const

/**
 * Format warnings for compact display (single line summary)
 */
export function formatWarningsCompact(warnings: StructureWarning[]): string {
  if (warnings.length === 0) {
    return '✓ No issues'
  }

  const errors = warnings.filter((w) => w.severity === 'error').length
  const warns = warnings.filter((w) => w.severity === 'warning').length

  const parts: string[] = []
  if (errors > 0) {
    parts.push(`${errors} error${errors > 1 ? 's' : ''}`)
  }
  if (warns > 0) {
    parts.push(`${warns} warning${warns > 1 ? 's' : ''}`)
  }

  return parts.join(', ')
}

/**
 * Format warnings for expanded display (with details)
 */
export function formatWarnings(warnings: StructureWarning[]): string[] {
  if (warnings.length === 0) {
    return ['│   ✓ No issues detected']
  }

  const lines: string[] = []

  // Group by severity
  const errors = warnings.filter((w) => w.severity === 'error')
  const warns = warnings.filter((w) => w.severity === 'warning')

  // Show errors first
  for (const warning of errors) {
    const icon = WARNING_ICONS[warning.severity]
    lines.push(`│   ${icon} ${warning.message}`)
    if (warning.details) {
      lines.push(`│     ${warning.details}`)
    }
  }

  // Then warnings
  for (const warning of warns) {
    const icon = WARNING_ICONS[warning.severity]
    lines.push(`│   ${icon} ${warning.message}`)
    if (warning.details) {
      lines.push(`│     ${warning.details}`)
    }
  }

  return lines
}

/**
 * Format violations for expanded display (definite failures)
 */
export function formatViolations(violations: StructureWarning[]): string[] {
  if (violations.length === 0) {
    return ['│   ✓ No violations']
  }

  const lines: string[] = []

  for (const violation of violations) {
    const icon = WARNING_ICONS[violation.severity]
    lines.push(`│   ${icon} ${violation.message}`)
    if (violation.details) {
      lines.push(`│     ${violation.details}`)
    }
  }

  return lines
}

/**
 * Format violations compact summary
 */
export function formatViolationsCompact(
  violations: StructureWarning[],
): string {
  if (violations.length === 0) {
    return '✓ None'
  }
  return `${violations.length} found`
}
