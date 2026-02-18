/**
 * Structure:compare View Content Component
 *
 * Shows comparison between static and JS-rendered page structure.
 * Uses expandable sections framework for consistent UX.
 *
 * Sections:
 * 1. TIMEOUT - Warning if page load timed out (conditional)
 * 2. COMPARISON - Summary of differences
 * 3. METADATA - Title and language changes
 * 4. LANDMARKS - Landmark changes (added/removed)
 * 5. HEADINGS - Heading changes (added/removed)
 * 6. LINKS - Link count changes
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Table,
} from '../../components/ui/index.js'
import { useSemanticColors } from '../../theme.js'
import type { StructureCompareRunnerResult } from '@webspecs/core'
import type {
  LandmarkDiff,
  HeadingDiff,
  LinkDiff,
  MetadataDiff,
} from '@webspecs/core'
import type { ViewComponentProps } from '../types.js'

// ============================================================================
// Content Components
// ============================================================================

/**
 * Comparison summary content
 */
function ComparisonContent({
  data,
}: {
  data: StructureCompareRunnerResult
}): ReactNode {
  const colors = useSemanticColors()
  const { summary, hasDifferences } = data.comparison

  if (!hasDifferences) {
    return (
      <text fg={colors.textSuccess}>
        No structural differences between static HTML and JS-rendered page.
      </text>
    )
  }

  const rows = [
    {
      field: 'Landmarks',
      value: `${summary.staticLandmarks} -> ${summary.hydratedLandmarks}`,
    },
    {
      field: 'Headings',
      value: `${summary.staticHeadings} -> ${summary.hydratedHeadings}`,
    },
    {
      field: 'Links',
      value: `${summary.staticLinks} -> ${summary.hydratedLinks}`,
    },
  ]

  return <Table data={rows} variant="borderless" labelWidth={12} />
}

/**
 * Metadata changes content
 */
function MetadataContent({ metadata }: { metadata: MetadataDiff }): ReactNode {
  const colors = useSemanticColors()
  const hasChanges = metadata.title !== null || metadata.language !== null

  if (!hasChanges) {
    return (
      <text fg={colors.textMuted}>
        No metadata changes between static and rendered versions.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={0}>
      {metadata.title && (
        <box flexDirection="column" gap={0}>
          <text fg={colors.textMuted}>Title:</text>
          <box flexDirection="row" marginLeft={2}>
            <text fg={colors.textError}>
              - {metadata.title.static || '(none)'}
            </text>
          </box>
          <box flexDirection="row" marginLeft={2}>
            <text fg={colors.textSuccess}>
              + {metadata.title.hydrated || '(none)'}
            </text>
          </box>
        </box>
      )}
      {metadata.language && (
        <box flexDirection="column" gap={0} marginTop={metadata.title ? 1 : 0}>
          <text fg={colors.textMuted}>Language:</text>
          <box flexDirection="row" marginLeft={2}>
            <text fg={colors.textError}>
              - {metadata.language.static || '(not set)'}
            </text>
          </box>
          <box flexDirection="row" marginLeft={2}>
            <text fg={colors.textSuccess}>
              + {metadata.language.hydrated || '(not set)'}
            </text>
          </box>
        </box>
      )}
    </box>
  )
}

/**
 * Landmarks changes content
 */
function LandmarksContent({
  landmarks,
}: {
  landmarks: LandmarkDiff[]
}): ReactNode {
  const colors = useSemanticColors()
  if (landmarks.length === 0) {
    return (
      <text fg={colors.textMuted}>
        No landmark changes between static and rendered versions.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={0}>
      {landmarks.map((landmark, i) => {
        const change = landmark.change
        const changeColor = change > 0 ? colors.textSuccess : colors.textError
        const changeSymbol = change > 0 ? '+' : ''

        return (
          <box key={i} flexDirection="row" gap={1}>
            <text fg={colors.textMuted}>{landmark.role}:</text>
            <text fg={colors.text}>
              {landmark.staticCount} -&gt; {landmark.hydratedCount}
            </text>
            <text fg={changeColor}>
              ({changeSymbol}
              {change})
            </text>
          </box>
        )
      })}
    </box>
  )
}

/**
 * Headings changes content
 */
function HeadingsContent({ headings }: { headings: HeadingDiff[] }): ReactNode {
  const colors = useSemanticColors()
  if (headings.length === 0) {
    return (
      <text fg={colors.textMuted}>
        No heading changes between static and rendered versions.
      </text>
    )
  }

  const added = headings.filter((h) => h.status === 'added')
  const removed = headings.filter((h) => h.status === 'removed')

  return (
    <box flexDirection="column" gap={0}>
      {added.length > 0 && (
        <box flexDirection="column" gap={0}>
          <text fg={colors.textSuccess}>Added by JavaScript:</text>
          {added.map((heading, i) => (
            <box key={`added-${i}`} flexDirection="row" marginLeft={2}>
              <text fg={colors.textSuccess}>
                + H{heading.level}: {heading.text}
              </text>
            </box>
          ))}
        </box>
      )}
      {removed.length > 0 && (
        <box
          flexDirection="column"
          gap={0}
          marginTop={added.length > 0 ? 1 : 0}
        >
          <text fg={colors.textError}>Removed by JavaScript:</text>
          {removed.map((heading, i) => (
            <box key={`removed-${i}`} flexDirection="row" marginLeft={2}>
              <text fg={colors.textError}>
                - H{heading.level}: {heading.text}
              </text>
            </box>
          ))}
        </box>
      )}
    </box>
  )
}

/**
 * Links changes content
 */
function LinksContent({ links }: { links: LinkDiff }): ReactNode {
  const colors = useSemanticColors()
  const hasChanges =
    links.internalAdded > 0 ||
    links.internalRemoved > 0 ||
    links.externalAdded > 0 ||
    links.externalRemoved > 0

  if (!hasChanges) {
    return (
      <text fg={colors.textMuted}>
        No link count changes between static and rendered versions.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={0}>
      {/* Internal link changes */}
      <box flexDirection="row" gap={1}>
        <text fg={colors.textMuted}>Internal:</text>
        {links.internalAdded > 0 && (
          <text fg={colors.textSuccess}>+{links.internalAdded}</text>
        )}
        {links.internalRemoved > 0 && (
          <text fg={colors.textError}>-{links.internalRemoved}</text>
        )}
        {links.internalAdded === 0 && links.internalRemoved === 0 && (
          <text fg={colors.text}>no change</text>
        )}
      </box>

      {/* External link changes */}
      <box flexDirection="row" gap={1}>
        <text fg={colors.textMuted}>External:</text>
        {links.externalAdded > 0 && (
          <text fg={colors.textSuccess}>+{links.externalAdded}</text>
        )}
        {links.externalRemoved > 0 && (
          <text fg={colors.textError}>-{links.externalRemoved}</text>
        )}
        {links.externalAdded === 0 && links.externalRemoved === 0 && (
          <text fg={colors.text}>no change</text>
        )}
      </box>

      {/* New internal destinations */}
      {links.newInternalDestinations.length > 0 && (
        <box flexDirection="column" gap={0} marginTop={1}>
          <text fg={colors.textMuted}>New internal paths:</text>
          {links.newInternalDestinations.slice(0, 5).map((dest, i) => (
            <box key={i} flexDirection="row" marginLeft={2}>
              <text fg={colors.textSuccess}>+ {dest}</text>
            </box>
          ))}
          {links.newInternalDestinations.length > 5 && (
            <box flexDirection="row" marginLeft={2}>
              <text fg={colors.textMuted}>
                ...and {links.newInternalDestinations.length - 5} more
              </text>
            </box>
          )}
        </box>
      )}

      {/* New external domains */}
      {links.newExternalDomains.length > 0 && (
        <box flexDirection="column" gap={0} marginTop={1}>
          <text fg={colors.textMuted}>New external domains:</text>
          {links.newExternalDomains.slice(0, 5).map((domain, i) => (
            <box key={i} flexDirection="row" marginLeft={2}>
              <text fg={colors.textSuccess}>+ {domain}</text>
            </box>
          ))}
          {links.newExternalDomains.length > 5 && (
            <box flexDirection="row" marginLeft={2}>
              <text fg={colors.textMuted}>
                ...and {links.newExternalDomains.length - 5} more
              </text>
            </box>
          )}
        </box>
      )}
    </box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main Structure:compare View Content component
 */
export function StructureCompareViewContent({
  data,
  height,
}: ViewComponentProps<StructureCompareRunnerResult>): ReactNode {
  const colors = useSemanticColors()
  const { comparison, timedOut } = data
  const { hasDifferences, summary, metadata, landmarks, headings, links } =
    comparison

  // Compute comparison summary
  const comparisonSummary = hasDifferences
    ? 'Structural differences detected'
    : 'No differences'

  // Compute metadata section summary
  const hasMetadataChanges =
    metadata.title !== null || metadata.language !== null
  const metadataSummary = hasMetadataChanges
    ? [metadata.title && 'title', metadata.language && 'language']
        .filter(Boolean)
        .join(', ') + ' changed'
    : 'No changes'

  // Compute landmarks section summary
  const landmarkChanges = landmarks.reduce(
    (acc, l) => acc + Math.abs(l.change),
    0,
  )
  const landmarkSummary =
    landmarks.length > 0
      ? `${landmarks.length} role(s) changed, ${landmarkChanges} total`
      : 'No changes'

  // Compute headings section summary
  const addedHeadings = headings.filter((h) => h.status === 'added').length
  const removedHeadings = headings.filter((h) => h.status === 'removed').length
  const headingsSummary =
    headings.length > 0
      ? `+${addedHeadings} added, -${removedHeadings} removed`
      : 'No changes'

  // Compute links section summary
  const totalLinkChanges =
    links.internalAdded +
    links.internalRemoved +
    links.externalAdded +
    links.externalRemoved
  const linksSummary =
    totalLinkChanges > 0
      ? `${summary.staticLinks} -> ${summary.hydratedLinks}`
      : 'No changes'

  return (
    <SectionContainer height={height}>
      {/* Timeout warning if applicable */}
      {timedOut && (
        <Section
          id="timeout"
          title="TIMEOUT"
          priority={SectionPriority.CRITICAL}
          severity="warning"
          icon="!"
          summary="Page load timed out - results may be incomplete"
          defaultExpanded={false}
        >
          <text fg={colors.textWarning}>
            The page took too long to load. The comparison may be based on
            partial content.
          </text>
        </Section>
      )}

      {/* Comparison summary section */}
      <Section
        id="comparison"
        title="COMPARISON"
        priority={SectionPriority.SUMMARY}
        severity={hasDifferences ? 'info' : undefined}
        icon={hasDifferences ? '!' : undefined}
        summary={comparisonSummary}
        defaultExpanded={true}
      >
        <ComparisonContent data={data} />
      </Section>

      {/* Metadata changes section */}
      <Section
        id="metadata"
        title="METADATA"
        priority={SectionPriority.PRIMARY}
        severity={hasMetadataChanges ? 'warning' : 'muted'}
        summary={metadataSummary}
        defaultExpanded={hasMetadataChanges}
      >
        <MetadataContent metadata={metadata} />
      </Section>

      {/* Landmarks changes section */}
      <Section
        id="landmarks"
        title="LANDMARKS"
        priority={SectionPriority.PRIMARY}
        count={landmarks.length}
        severity={landmarks.length > 0 ? 'info' : 'muted'}
        summary={landmarkSummary}
        defaultExpanded={landmarks.length > 0}
        scrollable
      >
        <LandmarksContent landmarks={landmarks} />
      </Section>

      {/* Headings changes section */}
      <Section
        id="headings"
        title="HEADINGS"
        priority={SectionPriority.PRIMARY}
        count={headings.length}
        severity={headings.length > 0 ? 'info' : 'muted'}
        summary={headingsSummary}
        defaultExpanded={headings.length > 0}
        scrollable
      >
        <HeadingsContent headings={headings} />
      </Section>

      {/* Links changes section */}
      <Section
        id="links"
        title="LINKS"
        priority={SectionPriority.SECONDARY}
        severity={totalLinkChanges > 0 ? 'info' : 'muted'}
        summary={linksSummary}
        defaultExpanded={totalLinkChanges > 0}
      >
        <LinksContent links={links} />
      </Section>
    </SectionContainer>
  )
}
