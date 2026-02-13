/**
 * Social View Content Component
 *
 * Custom TUI rendering for the Social lens using the expandable sections framework.
 *
 * Sections:
 * 1. Preview - ASCII mockup of social card
 * 2. Issues - Validation issues with severity
 * 3. Open Graph - All OG tags
 * 4. Twitter Cards - All Twitter tags
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
} from '../../components/ui/index.js'
import { usePalette } from '../../theme.js'
import type {
  SocialResult,
  SocialTagGroup,
  SocialValidationIssue,
} from '../../../commands/social/types.js'
import type { ViewComponentProps } from '../types.js'

// ============================================================================
// Card Preview Component
// ============================================================================

/**
 * ASCII card preview mockup
 */
function CardPreview({ data }: { data: SocialResult }): ReactNode {
  const palette = usePalette()
  const CARD_WIDTH = 50
  const innerWidth = CARD_WIDTH - 2

  const truncate = (text: string, maxLen: number): string => {
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen - 3) + '...'
  }

  const truncateMiddle = (text: string, maxLen: number): string => {
    if (text.length <= maxLen) return text
    const half = Math.floor((maxLen - 3) / 2)
    return text.slice(0, half) + '...' + text.slice(-half)
  }

  // Extract domain from URL
  const getDomain = (url: string | null): string | null => {
    if (!url) return null
    try {
      return new URL(url).hostname
    } catch {
      return null
    }
  }

  const siteName = data.preview.siteName || getDomain(data.preview.url)
  const title = data.preview.title || '(No title)'
  const description = data.preview.description || '(No description)'
  const imageUrl = data.preview.image

  // Truncate for display
  const displayImage = imageUrl
    ? `[IMG] ${truncateMiddle(imageUrl, innerWidth - 8)}`
    : '[No image]'
  const displayTitle = truncate(title, innerWidth - 2)
  const displayDesc = truncate(description, innerWidth - 2)
  const displaySite = siteName ? truncate(siteName, innerWidth - 2) : null

  return (
    <box flexDirection="column" gap={0}>
      {/* Top border */}
      <text fg={palette.base03}>{'┌' + '─'.repeat(innerWidth) + '┐'}</text>

      {/* Image area */}
      <text>
        <span fg={palette.base03}>{'│'}</span>
        <span fg={palette.base02}>
          {` ${displayImage}`.padEnd(innerWidth)}
        </span>
        <span fg={palette.base03}>{'│'}</span>
      </text>

      {/* Divider */}
      <text fg={palette.base03}>{'│' + '─'.repeat(innerWidth) + '│'}</text>

      {/* Site name */}
      {displaySite && (
        <text>
          <span fg={palette.base03}>{'│'}</span>
          <span fg={palette.base02}>
            {` ${displaySite}`.padEnd(innerWidth)}
          </span>
          <span fg={palette.base03}>{'│'}</span>
        </text>
      )}

      {/* Title */}
      <text>
        <span fg={palette.base03}>{'│'}</span>
        <span fg={palette.base05}>{` ${displayTitle}`.padEnd(innerWidth)}</span>
        <span fg={palette.base03}>{'│'}</span>
      </text>

      {/* Description */}
      <text>
        <span fg={palette.base03}>{'│'}</span>
        <span>{` ${displayDesc}`.padEnd(innerWidth)}</span>
        <span fg={palette.base03}>{'│'}</span>
      </text>

      {/* Bottom border */}
      <text fg={palette.base03}>{'└' + '─'.repeat(innerWidth) + '┘'}</text>
    </box>
  )
}

// ============================================================================
// Issues Component
// ============================================================================

/**
 * Display validation issues
 */
function IssuesContent({
  issues,
}: {
  issues: SocialValidationIssue[]
}): ReactNode {
  const palette = usePalette()
  if (issues.length === 0) {
    return <text fg={palette.base0B}>No issues found</text>
  }

  const severityColors: Record<string, string> = {
    error: palette.base08,
    warning: palette.base0A,
    info: palette.base03,
  }

  const severityLabels: Record<string, string> = {
    error: 'ERROR',
    warning: 'WARN',
    info: 'INFO',
  }

  return (
    <box flexDirection="column" gap={0}>
      {issues.map((issue, idx) => (
        <text key={idx}>
          <span fg={severityColors[issue.severity]}>
            [{severityLabels[issue.severity]}]
          </span>{' '}
          <span>{issue.message}</span>
        </text>
      ))}
    </box>
  )
}

// ============================================================================
// Tag Group Content Component
// ============================================================================

/**
 * Display a tag group's tags
 */
function TagGroupContent({ group }: { group: SocialTagGroup }): ReactNode {
  const palette = usePalette()
  const truncate = (text: string, maxLen: number): string => {
    if (text.length <= maxLen) return text
    return text.slice(0, maxLen - 3) + '...'
  }

  return (
    <box flexDirection="column" gap={0}>
      {/* Tags */}
      {Object.entries(group.tags).map(([key, value], idx) => (
        <box key={idx} paddingLeft={0}>
          <text>
            <span fg={palette.base0D}>{key}:</span>{' '}
            <span fg={palette.base05}>{truncate(value, 40)}</span>
          </text>
        </box>
      ))}
    </box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Social View Content component
 */
export function SocialViewContent({
  data,
  height,
}: ViewComponentProps<SocialResult>): ReactNode {
  const palette = usePalette()
  const hasOpenGraph = data.openGraph !== null
  const hasTwitter = data.twitter !== null
  const hasAny = hasOpenGraph || hasTwitter

  // Compute summary text
  const summaryParts: string[] = []
  if (hasOpenGraph) summaryParts.push(`${data.counts.openGraph} OG`)
  if (hasTwitter) summaryParts.push(`${data.counts.twitter} Twitter`)
  if (!hasAny) summaryParts.push('No social tags')
  const summaryText = summaryParts.join(', ')

  // Compute issue severity for section display
  const hasErrors = data.issues.some((i) => i.severity === 'error')
  const hasWarnings = data.issues.some((i) => i.severity === 'warning')
  const issuesSeverity = hasErrors
    ? 'error'
    : hasWarnings
      ? 'warning'
      : undefined

  return (
    <SectionContainer height={height}>
      {/* Preview section */}
      <Section
        id="preview"
        title="PREVIEW"
        priority={SectionPriority.SUMMARY}
        summary={summaryText}
        defaultExpanded={true}
      >
        <CardPreview data={data} />
      </Section>

      {/* Issues section */}
      <Section
        id="issues"
        title="ISSUES"
        priority={SectionPriority.PRIMARY}
        severity={issuesSeverity}
        summary={
          data.issues.length === 0
            ? 'No issues'
            : `${data.issues.length} issue${data.issues.length !== 1 ? 's' : ''}`
        }
        defaultExpanded={data.issues.length > 0}
      >
        <IssuesContent issues={data.issues} />
      </Section>

      {/* Open Graph section */}
      <Section
        id="open-graph"
        title="OPEN GRAPH"
        priority={SectionPriority.PRIMARY}
        severity={hasOpenGraph ? undefined : 'muted'}
        summary={
          hasOpenGraph
            ? `${data.counts.openGraph} tag${data.counts.openGraph !== 1 ? 's' : ''}`
            : 'No Open Graph tags'
        }
        defaultExpanded={hasOpenGraph}
        scrollable={data.counts.openGraph > 5}
      >
        {hasOpenGraph ? (
          <TagGroupContent group={data.openGraph!} />
        ) : (
          <text fg={palette.base03}>
            No Open Graph tags found. Add og:title, og:description, og:image for
            social previews.
          </text>
        )}
      </Section>

      {/* Twitter Cards section */}
      <Section
        id="twitter-cards"
        title="TWITTER CARDS"
        priority={SectionPriority.SECONDARY}
        severity={hasTwitter ? undefined : 'muted'}
        summary={
          hasTwitter
            ? `${data.counts.twitter} tag${data.counts.twitter !== 1 ? 's' : ''}`
            : 'No Twitter Card tags'
        }
        defaultExpanded={hasTwitter && !hasOpenGraph}
        scrollable={data.counts.twitter > 5}
      >
        {hasTwitter ? (
          <TagGroupContent group={data.twitter!} />
        ) : (
          <text fg={palette.base03}>
            No Twitter Card tags found. Twitter will fall back to Open Graph
            tags.
          </text>
        )}
      </Section>
    </SectionContainer>
  )
}
