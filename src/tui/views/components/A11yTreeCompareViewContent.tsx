/**
 * A11y Tree:compare View Content Component
 *
 * Shows comparison between static and JS-rendered accessibility trees.
 *
 * Sections:
 * 1. Timeout (conditional) - Warning if page load timed out
 * 2. Summary - Overview of differences
 * 3. Role Changes - Table of role count changes
 * 4. Elements Added - List of elements added by JavaScript
 * 5. Elements Removed - List of elements removed by JavaScript
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Table,
} from '../../components/ui/index.js'
import { palette } from '../../theme.js'
import type { A11yCompareResult } from '../../../lib/results.js'
import type { ViewComponentProps } from '../types.js'

/**
 * Summary section content showing high-level comparison.
 */
function SummaryContent({ data }: { data: A11yCompareResult }): ReactNode {
  const { diff } = data
  const staticTotal = Object.values(data.static.counts).reduce((a, b) => a + b, 0)
  const hydratedTotal = Object.values(data.hydrated.counts).reduce((a, b) => a + b, 0)
  const nodeDiff = hydratedTotal - staticTotal

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Static HTML Nodes:</span>{' '}
          <span fg={palette.white}>{staticTotal}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Rendered DOM Nodes:</span>{' '}
          <span fg={palette.white}>{hydratedTotal}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Node Difference:</span>{' '}
          <span fg={nodeDiff > 0 ? palette.green : nodeDiff < 0 ? palette.red : palette.white}>
            {nodeDiff > 0 ? `+${nodeDiff}` : nodeDiff}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Roles Changed:</span>{' '}
          <span fg={diff.countChanges.length > 0 ? palette.yellow : palette.green}>
            {diff.countChanges.length}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Elements Added:</span>{' '}
          <span fg={diff.added.length > 0 ? palette.green : palette.white}>
            {diff.added.length}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Elements Removed:</span>{' '}
          <span fg={diff.removed.length > 0 ? palette.red : palette.white}>
            {diff.removed.length}
          </span>
        </text>
      </box>
    </box>
  )
}

/**
 * Role changes section content.
 */
function RoleChangesContent({ data }: { data: A11yCompareResult }): ReactNode {
  const { diff } = data

  if (diff.countChanges.length === 0) {
    return (
      <text fg={palette.gray}>
        No role count changes between static and rendered versions.
      </text>
    )
  }

  const tableData = diff.countChanges.map((change) => {
    const nodeDiff = change.hydrated - change.static
    const changeStr = nodeDiff > 0 ? `+${nodeDiff}` : `${nodeDiff}`
    return {
      role: change.role,
      static: change.static,
      hydrated: change.hydrated,
      change: changeStr,
    } as Record<string, string | number>
  })

  return <Table data={tableData} columns={['role', 'static', 'hydrated', 'change']} />
}

/**
 * Format a snapshot line for display (trim whitespace, limit length).
 */
function formatSnapshotLine(line: string, maxLength = 80): string {
  const trimmed = line.trim().replace(/^-\s*/, '')
  if (trimmed.length <= maxLength) return trimmed
  return trimmed.slice(0, maxLength - 3) + '...'
}

/**
 * Elements added section content.
 */
function ElementsAddedContent({ data }: { data: A11yCompareResult }): ReactNode {
  const { diff } = data

  if (diff.added.length === 0) {
    return (
      <text fg={palette.gray}>
        No elements were added by JavaScript.
      </text>
    )
  }

  // Show up to 50 items
  const displayItems = diff.added.slice(0, 50)
  const hasMore = diff.added.length > 50

  return (
    <box flexDirection="column" gap={0}>
      {displayItems.map((line, index) => (
        <text key={index}>
          <span fg={palette.green}>+ </span>
          <span fg={palette.white}>{formatSnapshotLine(line)}</span>
        </text>
      ))}
      {hasMore && (
        <text fg={palette.gray}>
          ... and {diff.added.length - 50} more
        </text>
      )}
    </box>
  )
}

/**
 * Elements removed section content.
 */
function ElementsRemovedContent({ data }: { data: A11yCompareResult }): ReactNode {
  const { diff } = data

  if (diff.removed.length === 0) {
    return (
      <text fg={palette.gray}>
        No elements were removed by JavaScript.
      </text>
    )
  }

  // Show up to 50 items
  const displayItems = diff.removed.slice(0, 50)
  const hasMore = diff.removed.length > 50

  return (
    <box flexDirection="column" gap={0}>
      {displayItems.map((line, index) => (
        <text key={index}>
          <span fg={palette.red}>- </span>
          <span fg={palette.white}>{formatSnapshotLine(line)}</span>
        </text>
      ))}
      {hasMore && (
        <text fg={palette.gray}>
          ... and {diff.removed.length - 50} more
        </text>
      )}
    </box>
  )
}

/**
 * Main A11y Tree:compare View Content component.
 */
export function A11yTreeCompareViewContent({
  data,
  height,
}: ViewComponentProps<A11yCompareResult>): ReactNode {
  const { hasDifferences, diff } = data

  // Check for timeout
  const timedOut = data.static.timedOut || data.hydrated.timedOut

  // Build summary text
  const summaryText = hasDifferences
    ? `${diff.countChanges.length} roles changed, ${diff.added.length} added, ${diff.removed.length} removed`
    : 'No differences detected'

  // Build role changes summary
  const roleChangesSummary = diff.countChanges.length > 0
    ? diff.countChanges.slice(0, 3).map(c => c.role).join(', ') +
      (diff.countChanges.length > 3 ? `, +${diff.countChanges.length - 3} more` : '')
    : 'No role count changes'

  // Build elements added summary
  const addedSummary = diff.added.length > 0
    ? `${diff.added.length} element${diff.added.length !== 1 ? 's' : ''} added by JavaScript`
    : 'No elements added'

  // Build elements removed summary
  const removedSummary = diff.removed.length > 0
    ? `${diff.removed.length} element${diff.removed.length !== 1 ? 's' : ''} removed by JavaScript`
    : 'No elements removed'

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
          summary="Page load timed out - comparison may be incomplete"
          defaultExpanded={false}
        >
          <text fg={palette.yellow}>
            {data.static.timedOut && data.hydrated.timedOut
              ? 'Both static and rendered fetches timed out.'
              : data.static.timedOut
                ? 'Static HTML fetch timed out.'
                : 'Rendered DOM fetch timed out.'}
            {' '}The comparison may be based on partial content.
          </text>
        </Section>
      )}

      {/* Summary section */}
      <Section
        id="summary"
        title="SUMMARY"
        priority={SectionPriority.SUMMARY}
        severity={hasDifferences ? 'info' : undefined}
        icon={hasDifferences ? '!' : undefined}
        summary={summaryText}
        defaultExpanded={true}
      >
        <SummaryContent data={data} />
      </Section>

      {/* Role changes section */}
      <Section
        id="role-changes"
        title="ROLE CHANGES"
        priority={SectionPriority.PRIMARY}
        severity={diff.countChanges.length > 0 ? 'warning' : 'muted'}
        count={diff.countChanges.length > 0 ? diff.countChanges.length : undefined}
        summary={roleChangesSummary}
        defaultExpanded={diff.countChanges.length > 0}
        scrollable={diff.countChanges.length > 10}
      >
        {diff.countChanges.length > 10 ? (
          <scrollbox flexGrow={1}>
            <RoleChangesContent data={data} />
          </scrollbox>
        ) : (
          <RoleChangesContent data={data} />
        )}
      </Section>

      {/* Elements added section */}
      <Section
        id="elements-added"
        title="ELEMENTS ADDED"
        priority={SectionPriority.SECONDARY}
        severity={diff.added.length > 0 ? undefined : 'muted'}
        count={diff.added.length > 0 ? diff.added.length : undefined}
        summary={addedSummary}
        defaultExpanded={diff.added.length > 0 && diff.added.length <= 20}
        scrollable
      >
        <scrollbox flexGrow={1}>
          <ElementsAddedContent data={data} />
        </scrollbox>
      </Section>

      {/* Elements removed section */}
      <Section
        id="elements-removed"
        title="ELEMENTS REMOVED"
        priority={SectionPriority.SECONDARY}
        severity={diff.removed.length > 0 ? 'error' : 'muted'}
        count={diff.removed.length > 0 ? diff.removed.length : undefined}
        summary={removedSummary}
        defaultExpanded={diff.removed.length > 0 && diff.removed.length <= 20}
        scrollable
      >
        <scrollbox flexGrow={1}>
          <ElementsRemovedContent data={data} />
        </scrollbox>
      </Section>
    </SectionContainer>
  )
}
