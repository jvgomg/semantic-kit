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
import { palette } from '../../theme.js'
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
  const { summary } = data

  const getStatusColor = (value: boolean) =>
    value ? palette.green : palette.red

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Page Title:</span>{' '}
          <span fg={palette.white}>
            {summary.pageTitle ?? '(not found)'}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Landmarks:</span>{' '}
          <span fg={palette.white}>{summary.landmarkCount}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Headings:</span>{' '}
          <span fg={palette.white}>{summary.headingCount}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Links:</span>{' '}
          <span fg={palette.white}>{summary.linkCount}</span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Main Landmark:</span>{' '}
          <span fg={getStatusColor(summary.hasMainLandmark)}>
            {summary.hasMainLandmark ? 'Yes' : 'No'}
          </span>
        </text>
      </box>
      <box flexDirection="row" gap={2}>
        <text>
          <span fg={palette.gray}>Skip Link:</span>{' '}
          <span fg={summary.hasSkipLink ? palette.green : palette.yellow}>
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
  if (data.landmarks.length === 0) {
    return (
      <text fg={palette.yellow}>
        No landmark regions found on this page.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={1}>
      {data.landmarks.map((landmark, index) => (
        <box key={index} flexDirection="column">
          <text>
            <span fg={palette.cyan}>{landmark.role}</span>
            {landmark.name && (
              <span fg={palette.gray}> "{landmark.name}"</span>
            )}
          </text>
          <text fg={palette.gray}>
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
  if (data.headings.length === 0) {
    return (
      <text fg={palette.yellow}>
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
            <span fg={palette.gray}>{indent}</span>
            <span fg={palette.darkGray}>H{heading.level}</span>
            <span fg={palette.white}>  {text}</span>
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
          <text fg={palette.green}>
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
