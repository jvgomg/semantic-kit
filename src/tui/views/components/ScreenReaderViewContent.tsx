/**
 * Screen Reader View Content Component
 *
 * Custom TUI rendering for the Screen Reader command using the expandable sections framework.
 *
 * Sections:
 * 1. Warnings - Accessibility issues (missing landmarks, etc.)
 * 2. Summary - Quick stats (landmarks, headings, links)
 * 3. Landmarks - Page regions with their contents
 * 4. Headings - Document outline
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Card,
  CardRow,
} from '../../components/ui/index.js'
import { usePalette } from '../../theme.js'
import type { ScreenReaderResult } from '../../../lib/results.js'
import type { ViewComponentProps } from '../types.js'

/**
 * Warning card for missing main landmark
 */
function MissingMainCard(): ReactNode {
  return (
    <Card title="Missing Main Landmark" severity="error" icon="✗">
      <CardRow
        label="Issue"
        value="No <main> element found"
      />
      <CardRow
        label="Impact"
        value="Screen reader users cannot quickly navigate to primary content"
        muted
      />
      <CardRow
        label="Fix"
        value="Add a <main> element to wrap your primary content"
        muted
      />
    </Card>
  )
}

/**
 * Warning card for missing headings
 */
function MissingHeadingsCard(): ReactNode {
  return (
    <Card title="No Headings Found" severity="error" icon="✗">
      <CardRow
        label="Issue"
        value="No heading elements found"
      />
      <CardRow
        label="Impact"
        value="Screen reader users cannot navigate by headings"
        muted
      />
      <CardRow
        label="Fix"
        value="Add heading elements (h1-h6) to organize content"
        muted
      />
    </Card>
  )
}

/**
 * Summary section content
 */
function SummaryContent({ data }: { data: ScreenReaderResult }): ReactNode {
  const palette = usePalette()
  const { summary } = data

  const getStatusColor = (value: boolean) =>
    value ? palette.base0B : palette.base08

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Page Title:</span>{' '}
          <span fg={palette.base05}>
            {summary.pageTitle ?? '(not found)'}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Landmarks:</span>{' '}
          <span fg={palette.base05}>{summary.landmarkCount}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Headings:</span>{' '}
          <span fg={palette.base05}>{summary.headingCount}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Links:</span>{' '}
          <span fg={palette.base05}>{summary.linkCount}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Main Landmark:</span>{' '}
          <span fg={getStatusColor(summary.hasMainLandmark)}>
            {summary.hasMainLandmark ? 'Yes' : 'No'}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.base03}>Skip Link:</span>{' '}
          <span fg={summary.hasSkipLink ? palette.base0B : palette.base0A}>
            {summary.hasSkipLink ? 'Yes' : 'No'}
          </span>
        </text>
      </box>
    </box>
  )
}

/**
 * Landmarks section content
 */
function LandmarksContent({ data }: { data: ScreenReaderResult }): ReactNode {
  const palette = usePalette()
  if (data.landmarks.length === 0) {
    return (
      <text fg={palette.base0A}>
        No landmark regions found on this page.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={1}>
      {data.landmarks.map((landmark, index) => (
        <box key={index} flexDirection="column">
          <text>
            <span fg={palette.base0D}>{landmark.role}</span>
            {landmark.name && (
              <span fg={palette.base03}> "{landmark.name}"</span>
            )}
          </text>
          <text fg={palette.base03}>
            {'  '}({landmark.headingCount} headings, {landmark.linkCount} links)
          </text>
        </box>
      ))}
    </box>
  )
}

/**
 * Headings section content with tree-like display
 */
function HeadingsContent({ data }: { data: ScreenReaderResult }): ReactNode {
  const palette = usePalette()
  if (data.headings.length === 0) {
    return (
      <text fg={palette.base0A}>
        No headings found on this page.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={0}>
      {data.headings.map((heading, index) => {
        const indent = '  '.repeat(heading.level - 1)
        const text = heading.text.length > 50
          ? heading.text.slice(0, 47) + '...'
          : heading.text
        return (
          <text key={index}>
            <span fg={palette.base03}>{indent}</span>
            <span fg={palette.base02}>H{heading.level}</span>
            <span fg={palette.base05}>  {text}</span>
          </text>
        )
      })}
    </box>
  )
}

/**
 * Main Screen Reader View Content component
 */
export function ScreenReaderViewContent({
  data,
  height,
}: ViewComponentProps<ScreenReaderResult>): ReactNode {
  const palette = usePalette()
  const { summary } = data

  // Check for issues
  const hasMainIssue = !summary.hasMainLandmark
  const hasHeadingIssue = summary.headingCount === 0
  const hasIssues = hasMainIssue || hasHeadingIssue
  const issueCount = (hasMainIssue ? 1 : 0) + (hasHeadingIssue ? 1 : 0)

  // Compute summary text
  const summaryText = `${summary.landmarkCount} landmarks, ${summary.headingCount} headings, ${summary.linkCount} links`

  // Compute landmarks summary
  const landmarksSummary = data.landmarks.length > 0
    ? data.landmarks.map(l => l.role).slice(0, 4).join(', ') +
      (data.landmarks.length > 4 ? `, +${data.landmarks.length - 4} more` : '')
    : 'No landmarks found'

  // Compute headings summary
  const headingsSummary = data.headings.length > 0
    ? `${data.headings.length} headings (H1-H${Math.max(...data.headings.map(h => h.level))})`
    : 'No headings found'

  return (
    <SectionContainer height={height}>
      {/* Warnings section */}
      <Section
        id="warnings"
        title="WARNINGS"
        priority={SectionPriority.WARNING}
        severity={hasIssues ? 'error' : 'success'}
        icon={hasIssues ? '✗' : '✓'}
        count={issueCount}
        summary={hasIssues ? `${issueCount} accessibility issue${issueCount > 1 ? 's' : ''} found` : 'No issues detected'}
        defaultExpanded={hasIssues}
      >
        {hasIssues ? (
          <box flexDirection="column" gap={1}>
            {hasMainIssue && <MissingMainCard />}
            {hasHeadingIssue && <MissingHeadingsCard />}
          </box>
        ) : (
          <text fg={palette.base0B}>
            All basic accessibility checks passed.
          </text>
        )}
      </Section>

      {/* Summary section */}
      <Section
        id="summary"
        title="SUMMARY"
        priority={SectionPriority.SUMMARY}
        summary={summaryText}
        defaultExpanded={true}
      >
        <SummaryContent data={data} />
      </Section>

      {/* Landmarks section */}
      <Section
        id="landmarks"
        title="LANDMARKS"
        priority={SectionPriority.PRIMARY}
        severity={data.landmarks.length > 0 ? undefined : 'warning'}
        summary={landmarksSummary}
        defaultExpanded={false}
      >
        <LandmarksContent data={data} />
      </Section>

      {/* Headings section */}
      <Section
        id="headings"
        title="HEADING OUTLINE"
        priority={SectionPriority.SECONDARY}
        severity={data.headings.length > 0 ? undefined : 'warning'}
        summary={headingsSummary}
        defaultExpanded={true}
        scrollable
      >
        <scrollbox flexGrow={1}>
          <HeadingsContent data={data} />
        </scrollbox>
      </Section>
    </SectionContainer>
  )
}
