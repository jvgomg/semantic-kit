/**
 * Social lens formatters.
 *
 * Formats social lens results for CLI output, including ASCII card preview.
 */
import type { OutputFormat } from '../../lib/arguments.js'
import {
  colorize,
  colors,
  createFormatterContext,
  type FormatterContext,
  type Issue,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type {
  SocialResult,
  SocialTagGroup,
  SocialValidationIssue,
} from './types.js'

// ============================================================================
// Constants
// ============================================================================

const CARD_WIDTH = 50
const CARD_BORDER = '─'
const CARD_CORNER_TL = '┌'
const CARD_CORNER_TR = '┐'
const CARD_CORNER_BL = '└'
const CARD_CORNER_BR = '┘'
const CARD_VERTICAL = '│'

// ============================================================================
// Issue Building
// ============================================================================

/**
 * Build CLI issues from social result.
 *
 * SocialValidationIssue extends Issue, so validation issues can be used directly.
 */
export function buildIssues(result: SocialResult): Issue[] {
  const issues: Issue[] = []

  // No social tags at all
  if (!result.openGraph && !result.twitter) {
    issues.push({
      type: 'warning',
      severity: 'high',
      title: 'No Social Meta Tags',
      description: 'The page has no Open Graph or Twitter Card tags.',
      tip: 'Add og:title, og:description, and og:image tags for better link previews.',
    })
    return issues
  }

  // Include validation issues directly (they extend Issue)
  issues.push(...result.issues)

  // No Open Graph tags
  if (!result.openGraph) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      title: 'No Open Graph Tags',
      description:
        'The page has no Open Graph tags. Facebook, LinkedIn, WhatsApp, and other platforms will use fallbacks.',
      tip: 'Add og:title, og:description, og:image, og:url, and og:type tags.',
    })
  }

  // No preview image
  if (!result.preview.image) {
    issues.push({
      type: 'info',
      severity: 'low',
      title: 'No Preview Image',
      description:
        'No og:image or twitter:image found. Link previews will appear without an image.',
      tip: 'Add an og:image tag with a 1200x630px image for best results.',
    })
  }

  return issues
}

// ============================================================================
// ASCII Card Preview
// ============================================================================

/**
 * Create an ASCII mockup of a social card preview.
 */
function formatCardPreview(
  result: SocialResult,
  ctx: FormatterContext,
): string[] {
  const lines: string[] = []
  const innerWidth = CARD_WIDTH - 2

  // Top border
  lines.push(
    colorize(
      CARD_CORNER_TL + CARD_BORDER.repeat(innerWidth) + CARD_CORNER_TR,
      colors.gray,
      ctx,
    ),
  )

  // Image area (simplified - just shows image URL or placeholder)
  const imageUrl = result.preview.image
  if (imageUrl) {
    // Account for " [IMG] " prefix (7 chars) when truncating URL
    const truncatedUrl = truncateMiddle(imageUrl, innerWidth - 8)
    lines.push(
      colorize(CARD_VERTICAL, colors.gray, ctx) +
        colorize(` [IMG] ${truncatedUrl}`.padEnd(innerWidth), colors.dim, ctx) +
        colorize(CARD_VERTICAL, colors.gray, ctx),
    )
  } else {
    lines.push(
      colorize(CARD_VERTICAL, colors.gray, ctx) +
        colorize(' [No image]'.padEnd(innerWidth), colors.dim, ctx) +
        colorize(CARD_VERTICAL, colors.gray, ctx),
    )
  }

  // Divider
  lines.push(
    colorize(
      CARD_VERTICAL + '─'.repeat(innerWidth) + CARD_VERTICAL,
      colors.gray,
      ctx,
    ),
  )

  // Site name
  const siteName =
    result.preview.siteName || getDomainFromUrl(result.preview.url)
  if (siteName) {
    const truncatedSite = truncate(siteName, innerWidth - 2)
    lines.push(
      colorize(CARD_VERTICAL, colors.gray, ctx) +
        colorize(` ${truncatedSite}`.padEnd(innerWidth), colors.dim, ctx) +
        colorize(CARD_VERTICAL, colors.gray, ctx),
    )
  }

  // Title
  const title = result.preview.title || '(No title)'
  const truncatedTitle = truncate(title, innerWidth - 2)
  lines.push(
    colorize(CARD_VERTICAL, colors.gray, ctx) +
      (ctx.mode === 'tty'
        ? colorize(` ${truncatedTitle}`.padEnd(innerWidth), colors.bold, ctx)
        : ` ${truncatedTitle}`.padEnd(innerWidth)) +
      colorize(CARD_VERTICAL, colors.gray, ctx),
  )

  // Description (wrapped to 2 lines max)
  const description = result.preview.description || '(No description)'
  const descLines = wrapText(description, innerWidth - 2, 2)
  for (const line of descLines) {
    lines.push(
      colorize(CARD_VERTICAL, colors.gray, ctx) +
        ` ${line}`.padEnd(innerWidth) +
        colorize(CARD_VERTICAL, colors.gray, ctx),
    )
  }

  // Bottom border
  lines.push(
    colorize(
      CARD_CORNER_BL + CARD_BORDER.repeat(innerWidth) + CARD_CORNER_BR,
      colors.gray,
      ctx,
    ),
  )

  return lines
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Truncate text to max length with ellipsis.
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Truncate text in the middle, keeping start and end visible.
 */
function truncateMiddle(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const halfLength = Math.floor((maxLength - 3) / 2)
  return text.slice(0, halfLength) + '...' + text.slice(-halfLength)
}

/**
 * Wrap text to multiple lines.
 */
function wrapText(text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if (lines.length >= maxLines) break

    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) {
        lines.push(currentLine)
        if (lines.length >= maxLines) break
      }
      currentLine = word.length > maxWidth ? truncate(word, maxWidth) : word
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  // Fill remaining lines with empty strings
  while (lines.length < maxLines) {
    lines.push('')
  }

  // Truncate last line if there's more content
  if (words.length > 0 && lines[lines.length - 1].length > 0) {
    const lastLine = lines[lines.length - 1]
    if (lastLine !== truncate(text, maxWidth * maxLines)) {
      lines[lines.length - 1] = truncate(lastLine, maxWidth - 3) + '...'
    }
  }

  return lines.slice(0, maxLines)
}

/**
 * Extract domain from URL.
 */
function getDomainFromUrl(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

/**
 * Format a tag group's tags for display.
 */
function formatTagGroupTags(
  group: SocialTagGroup,
  ctx: FormatterContext,
): string[] {
  const lines: string[] = []

  for (const [key, value] of Object.entries(group.tags)) {
    const displayValue = value.length > 50 ? value.slice(0, 47) + '...' : value
    if (ctx.mode === 'tty') {
      lines.push(`  ${colorize(key + ':', colors.cyan, ctx)} ${displayValue}`)
    } else {
      lines.push(`  ${key}: ${displayValue}`)
    }
  }

  return lines
}

/**
 * Format validation issues for display.
 */
function formatIssues(
  issues: SocialValidationIssue[],
  ctx: FormatterContext,
): string[] {
  if (issues.length === 0) return []

  const lines: string[] = []

  // Map IssueSeverity to display labels
  const severityToLabel: Record<string, string> = {
    high: 'ERROR',
    medium: 'WARN',
    low: 'INFO',
  }
  const severityToColor: Record<string, (s: string) => string> = {
    high: colors.red,
    medium: colors.yellow,
    low: colors.dim,
  }

  for (const issue of issues) {
    const label = severityToLabel[issue.severity]
    const color = severityToColor[issue.severity]

    if (ctx.mode === 'tty') {
      lines.push(`  ${colorize(`[${label}]`, color, ctx)} ${issue.description}`)
    } else {
      lines.push(`  [${label}] ${issue.description}`)
    }
  }

  return lines
}

// ============================================================================
// Terminal Formatters
// ============================================================================

/**
 * Format terminal output - full or compact mode.
 */
function formatTerminal(
  result: SocialResult,
  ctx: FormatterContext,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // [PREVIEW] section - ASCII card mockup
  if (ctx.mode === 'tty') {
    sections.push(colorize('PREVIEW', colors.gray, ctx))
  } else {
    sections.push('PREVIEW')
  }
  sections.push(...formatCardPreview(result, ctx))

  // [ISSUES] section
  if (result.issues.length > 0) {
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(
        colorize(`ISSUES (${result.issues.length})`, colors.gray, ctx),
      )
    } else {
      sections.push(`ISSUES (${result.issues.length})`)
    }
    sections.push(...formatIssues(result.issues, ctx))
  }

  // [OPEN GRAPH] section
  if (result.openGraph || !compact) {
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(
        colorize(`OPEN GRAPH (${result.counts.openGraph})`, colors.gray, ctx),
      )
    } else {
      sections.push(`OPEN GRAPH (${result.counts.openGraph})`)
    }

    if (result.openGraph) {
      sections.push(...formatTagGroupTags(result.openGraph, ctx))
    } else {
      sections.push('(no Open Graph tags found)')
    }
  }

  // [TWITTER CARDS] section
  if (result.twitter || !compact) {
    sections.push('')
    if (ctx.mode === 'tty') {
      sections.push(
        colorize(`TWITTER CARDS (${result.counts.twitter})`, colors.gray, ctx),
      )
    } else {
      sections.push(`TWITTER CARDS (${result.counts.twitter})`)
    }

    if (result.twitter) {
      sections.push(...formatTagGroupTags(result.twitter, ctx))
    } else {
      sections.push('(no Twitter Card tags found)')
    }
  }

  return sections.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format Social lens result for terminal output.
 * JSON format is handled directly by runCommand.
 */
export function formatSocialOutput(
  result: SocialResult,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatTerminal(result, ctx, { compact: true })
    case 'full':
    default:
      return formatTerminal(result, ctx)
  }
}
