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
import { palette } from '../../theme.js'
import type { StructureCompareResult } from '../../../commands/structure/index.js'
import type {
  LandmarkDiff,
  HeadingDiff,
  LinkDiff,
  MetadataDiff,
} from '../../../lib/structure.js'
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
  data: StructureCompareResult
}): ReactNode {
  const { summary, hasDifferences } = data.comparison

  if (!hasDifferences) {
    return (
      <text fg={palette.green}>
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
function MetadataContent({
  metadata,
}: {
  metadata: MetadataDiff
}): ReactNode {
  const hasChanges = metadata.title !== null || metadata.language !== null

  if (!hasChanges) {
    return (
      <text fg={palette.gray}>
        No metadata changes between static and rendered versions.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={0}>
      {metadata.title && (
        <box flexDirection="column" gap={0}>
          <text fg={palette.gray}>Title:</text>
          <box flexDirection="row" marginLeft={2}>
            <text fg={palette.red}>- {metadata.title.static || '(none)'}</text>
          </box>
          <box flexDirection="row" marginLeft={2}>
            <text fg={palette.green}>
              + {metadata.title.hydrated || '(none)'}
            </text>
          </box>
        </box>
      )}
      {metadata.language && (
        <box flexDirection="column" gap={0} marginTop={metadata.title ? 1 : 0}>
          <text fg={palette.gray}>Language:</text>
          <box flexDirection="row" marginLeft={2}>
            <text fg={palette.red}>
              - {metadata.language.static || '(not set)'}
            </text>
          </box>
          <box flexDirection="row" marginLeft={2}>
            <text fg={palette.green}>
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
  if (landmarks.length === 0) {
    return (
      <text fg={palette.gray}>
        No landmark changes between static and rendered versions.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={0}>
      {landmarks.map((landmark, i) => {
        const change = landmark.change
        const changeColor = change > 0 ? palette.green : palette.red
        const changeSymbol = change > 0 ? '+' : ''

        return (
          <box key={i} flexDirection="row" gap={1}>
            <text fg={palette.gray}>{landmark.role}:</text>
            <text fg={palette.white}>
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
function HeadingsContent({
  headings,
}: {
  headings: HeadingDiff[]
}): ReactNode {
  if (headings.length === 0) {
    return (
      <text fg={palette.gray}>
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
          <text fg={palette.green}>Added by JavaScript:</text>
          {added.map((heading, i) => (
            <box key={`added-${i}`} flexDirection="row" marginLeft={2}>
              <text fg={palette.green}>
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
          <text fg={palette.red}>Removed by JavaScript:</text>
          {removed.map((heading, i) => (
            <box key={`removed-${i}`} flexDirection="row" marginLeft={2}>
              <text fg={palette.red}>
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
  const hasChanges =
    links.internalAdded > 0 ||
    links.internalRemoved > 0 ||
    links.externalAdded > 0 ||
    links.externalRemoved > 0

  if (!hasChanges) {
    return (
      <text fg={palette.gray}>
        No link count changes between static and rendered versions.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={0}>
      {/* Internal link changes */}
      <box flexDirection="row" gap={1}>
        <text fg={palette.gray}>Internal:</text>
        {links.internalAdded > 0 && (
          <text fg={palette.green}>+{links.internalAdded}</text>
        )}
        {links.internalRemoved > 0 && (
          <text fg={palette.red}>-{links.internalRemoved}</text>
        )}
        {links.internalAdded === 0 && links.internalRemoved === 0 && (
          <text fg={palette.white}>no change</text>
        )}
      </box>

      {/* External link changes */}
      <box flexDirection="row" gap={1}>
        <text fg={palette.gray}>External:</text>
        {links.externalAdded > 0 && (
          <text fg={palette.green}>+{links.externalAdded}</text>
        )}
        {links.externalRemoved > 0 && (
          <text fg={palette.red}>-{links.externalRemoved}</text>
        )}
        {links.externalAdded === 0 && links.externalRemoved === 0 && (
          <text fg={palette.white}>no change</text>
        )}
      </box>

      {/* New internal destinations */}
      {links.newInternalDestinations.length > 0 && (
        <box flexDirection="column" gap={0} marginTop={1}>
          <text fg={palette.gray}>New internal paths:</text>
          {links.newInternalDestinations.slice(0, 5).map((dest, i) => (
            <box key={i} flexDirection="row" marginLeft={2}>
              <text fg={palette.green}>+ {dest}</text>
            </box>
          ))}
          {links.newInternalDestinations.length > 5 && (
            <box flexDirection="row" marginLeft={2}>
              <text fg={palette.gray}>
                ...and {links.newInternalDestinations.length - 5} more
              </text>
            </box>
          )}
        </box>
      )}

      {/* New external domains */}
      {links.newExternalDomains.length > 0 && (
        <box flexDirection="column" gap={0} marginTop={1}>
          <text fg={palette.gray}>New external domains:</text>
          {links.newExternalDomains.slice(0, 5).map((domain, i) => (
            <box key={i} flexDirection="row" marginLeft={2}>
              <text fg={palette.green}>+ {domain}</text>
            </box>
          ))}
          {links.newExternalDomains.length > 5 && (
            <box flexDirection="row" marginLeft={2}>
              <text fg={palette.gray}>
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
}: ViewComponentProps<StructureCompareResult>): ReactNode {
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
          <text fg={palette.yellow}>
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
