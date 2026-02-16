/**
 * ValidateA11y View Content Component
 *
 * Custom TUI rendering for the validate:a11y command using the expandable sections framework.
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
import type {
  AxeAnalysisResult,
  WcagLevel,
  Severity,
} from '@webspecs/cli/commands/validate-a11y/types.js'
import type { AxeViolationResult } from '@webspecs/core'
import type { ViewComponentProps } from '../types.js'

// ============================================================================
// Types
// ============================================================================

/**
 * TUI-specific result that adds the config used.
 */
export interface TuiA11yResult {
  analysis: AxeAnalysisResult
  level: WcagLevel
  timeoutMs: number
}

// ============================================================================
// Constants
// ============================================================================

const SEVERITY_ORDER: Severity[] = ['critical', 'serious', 'moderate', 'minor']

const SEVERITY_ICONS: Record<Severity, string> = {
  critical: '!!',
  serious: '!',
  moderate: '?',
  minor: 'i',
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map axe impact to Card severity.
 */
function mapImpactToSeverity(
  impact: string | null,
): 'critical' | 'error' | 'warning' | 'info' {
  switch (impact) {
    case 'critical':
      return 'critical'
    case 'serious':
      return 'error'
    case 'moderate':
      return 'warning'
    case 'minor':
    default:
      return 'info'
  }
}

/**
 * Sort violations by severity.
 */
function sortBySeverity(violations: AxeViolationResult[]): AxeViolationResult[] {
  return [...violations].sort((a, b) => {
    const aIndex = SEVERITY_ORDER.indexOf((a.impact ?? 'moderate') as Severity)
    const bIndex = SEVERITY_ORDER.indexOf((b.impact ?? 'moderate') as Severity)
    return aIndex - bIndex
  })
}

/**
 * Count violations by severity.
 */
function countBySeverity(
  violations: AxeViolationResult[],
): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  }

  for (const violation of violations) {
    const impact = (violation.impact ?? 'moderate') as Severity
    counts[impact]++
  }

  return counts
}

/**
 * Format violations summary.
 */
function formatViolationsSummary(counts: Record<Severity, number>): string {
  const parts: string[] = []

  if (counts.critical > 0) {
    parts.push(`${counts.critical} critical`)
  }
  if (counts.serious > 0) {
    parts.push(`${counts.serious} serious`)
  }
  if (counts.moderate > 0) {
    parts.push(`${counts.moderate} moderate`)
  }
  if (counts.minor > 0) {
    parts.push(`${counts.minor} minor`)
  }

  return parts.length > 0 ? parts.join(', ') : 'No violations'
}

// ============================================================================
// Content Components
// ============================================================================

/**
 * Config content showing WCAG level and timeout.
 */
function ConfigContent({
  level,
  timeoutMs,
  timedOut,
}: {
  level: WcagLevel
  timeoutMs: number
  timedOut: boolean
}): ReactNode {
  const palette = usePalette()
  const timeoutSec = Math.round(timeoutMs / 1000)

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row">
        <text fg={palette.base03}>WCAG Level: </text>
        <text fg={palette.base0D}>{level.toUpperCase()}</text>
      </box>
      <box flexDirection="row">
        <text fg={palette.base03}>Timeout: </text>
        <text fg={palette.base05}>{timeoutSec}s</text>
      </box>
      {timedOut && (
        <box flexDirection="row" marginTop={1}>
          <text fg={palette.base0A}>
            Page load timed out - results may be incomplete
          </text>
        </box>
      )}
    </box>
  )
}

/**
 * Violations content - list of a11y violations.
 */
function ViolationsContent({
  violations,
}: {
  violations: AxeViolationResult[]
}): ReactNode {
  const palette = usePalette()
  if (violations.length === 0) {
    return (
      <text fg={palette.base0B}>
        No accessibility violations detected.
      </text>
    )
  }

  const sorted = sortBySeverity(violations)

  return (
    <box flexDirection="column" gap={0}>
      {sorted.map((violation, i) => {
        const impact = violation.impact ?? 'moderate'
        const severity = mapImpactToSeverity(impact)
        const icon = SEVERITY_ICONS[impact as Severity] ?? '?'
        const nodeCount = violation.nodes.length

        return (
          <Card
            key={i}
            title={`[${impact}] ${violation.id}`}
            severity={severity}
            icon={icon}
          >
            <CardRow label="Help" value={violation.help} />
            <CardRow label="Affected" value={`${nodeCount} element(s)`} />
            {violation.nodes[0]?.html && (
              <CardRow
                label="Example"
                value={truncateHtml(violation.nodes[0].html, 60)}
              />
            )}
          </Card>
        )
      })}
    </box>
  )
}

/**
 * Truncate HTML snippet for display.
 */
function truncateHtml(html: string, maxLength: number): string {
  const trimmed = html.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= maxLength) {
    return trimmed
  }
  return trimmed.slice(0, maxLength - 3) + '...'
}

/**
 * Incomplete checks content - items needing manual review.
 */
function IncompleteContent({
  incomplete,
}: {
  incomplete: AxeViolationResult[]
}): ReactNode {
  const palette = usePalette()
  if (incomplete.length === 0) {
    return (
      <text fg={palette.base0B}>
        No items requiring manual review.
      </text>
    )
  }

  return (
    <box flexDirection="column" gap={0}>
      {incomplete.map((item, i) => {
        const nodeCount = item.nodes.length

        return (
          <Card
            key={i}
            title={item.id}
            severity="warning"
            icon="?"
          >
            <CardRow label="Help" value={item.help} />
            <CardRow label="Affected" value={`${nodeCount} element(s)`} />
            <CardRow label="Status" value="Needs manual review" muted />
          </Card>
        )
      })}
    </box>
  )
}

/**
 * Summary content showing overall stats.
 */
function SummaryContent({
  violations,
  passes,
  incomplete,
}: {
  violations: number
  passes: number
  incomplete: number
}): ReactNode {
  const palette = usePalette()
  const hasViolations = violations > 0
  const statusColor = hasViolations ? palette.base08 : palette.base0B
  const statusText = hasViolations ? 'ISSUES FOUND' : 'PASSED'
  const statusIcon = hasViolations ? '✗' : '✓'

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row">
        <text fg={statusColor}>
          {statusIcon} {statusText}
        </text>
      </box>
      <box flexDirection="row" marginTop={1}>
        <text fg={palette.base03}>Violations: </text>
        <text fg={violations > 0 ? palette.base08 : palette.base05}>
          {violations}
        </text>
      </box>
      <box flexDirection="row">
        <text fg={palette.base03}>Passed: </text>
        <text fg={palette.base0B}>{passes}</text>
      </box>
      <box flexDirection="row">
        <text fg={palette.base03}>Needs Review: </text>
        <text fg={incomplete > 0 ? palette.base0A : palette.base05}>
          {incomplete}
        </text>
      </box>
    </box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main ValidateA11y View Content component
 */
export function ValidateA11yViewContent({
  data,
  height,
}: ViewComponentProps<TuiA11yResult>): ReactNode {
  const { analysis, level, timeoutMs } = data
  const { results, timedOut } = analysis

  const violations = results.violations
  const incomplete = results.incomplete as AxeViolationResult[]
  const passes = results.passes.length

  const hasViolations = violations.length > 0
  const hasIncomplete = incomplete.length > 0

  // Compute severity counts
  const severityCounts = countBySeverity(violations)

  // Summary texts
  const summaryText = hasViolations
    ? formatViolationsSummary(severityCounts)
    : 'No accessibility violations'

  const configSummary = timedOut
    ? `WCAG ${level.toUpperCase()} (timed out)`
    : `WCAG ${level.toUpperCase()}`

  const violationsSummary = hasViolations
    ? `${violations.length} violation(s) found`
    : 'No violations'

  const incompleteSummary = hasIncomplete
    ? `${incomplete.length} item(s) need manual review`
    : 'No items need review'

  // Determine overall severity for violations section
  const violationsSeverity = severityCounts.critical > 0
    ? 'critical'
    : severityCounts.serious > 0
      ? 'error'
      : severityCounts.moderate > 0
        ? 'warning'
        : hasViolations
          ? 'info'
          : 'success'

  return (
    <SectionContainer height={height}>
      {/* Config section */}
      <Section
        id="config"
        title="CONFIG"
        priority={SectionPriority.INFO}
        severity={timedOut ? 'warning' : undefined}
        icon={timedOut ? '⚠' : undefined}
        summary={configSummary}
        defaultExpanded={true}
      >
        <ConfigContent level={level} timeoutMs={timeoutMs} timedOut={timedOut} />
      </Section>

      {/* Violations section */}
      <Section
        id="violations"
        title="VIOLATIONS"
        priority={SectionPriority.ERROR}
        count={violations.length}
        severity={violationsSeverity}
        icon={hasViolations ? '✗' : '✓'}
        summary={violationsSummary}
        defaultExpanded={hasViolations}
        scrollable
      >
        <ViolationsContent violations={violations} />
      </Section>

      {/* Incomplete section */}
      <Section
        id="incomplete"
        title="INCOMPLETE"
        priority={SectionPriority.WARNING}
        count={incomplete.length}
        severity={hasIncomplete ? 'warning' : undefined}
        icon={hasIncomplete ? '?' : undefined}
        summary={incompleteSummary}
        defaultExpanded={hasIncomplete && !hasViolations}
        scrollable
      >
        <IncompleteContent incomplete={incomplete} />
      </Section>

      {/* Summary section */}
      <Section
        id="summary"
        title="SUMMARY"
        priority={SectionPriority.SUMMARY}
        severity={hasViolations ? 'error' : 'success'}
        icon={hasViolations ? '✗' : '✓'}
        summary={summaryText}
        defaultExpanded={!hasViolations && !hasIncomplete}
      >
        <SummaryContent
          violations={violations.length}
          passes={passes}
          incomplete={incomplete.length}
        />
      </Section>
    </SectionContainer>
  )
}
