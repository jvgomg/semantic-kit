/**
 * ValidateHtml View Content Component
 *
 * Custom TUI rendering for the validate:html command using the expandable sections framework.
 */
import type { ReactNode } from 'react'
import type { Report } from 'html-validate'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Card,
  CardRow,
} from '../../components/ui/index.js'
import { usePalette } from '../../theme.js'
import type { ViewComponentProps } from '../types.js'

// ============================================================================
// Types
// ============================================================================

interface HtmlValidateMessage {
  ruleId: string
  severity: number
  message: string
  line: number
  column: number
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Separate messages into errors and warnings.
 */
function categorizeMessages(report: Report): {
  errors: HtmlValidateMessage[]
  warnings: HtmlValidateMessage[]
} {
  const errors: HtmlValidateMessage[] = []
  const warnings: HtmlValidateMessage[] = []

  for (const result of report.results) {
    for (const message of result.messages) {
      if (message.severity === 2) {
        errors.push(message)
      } else {
        warnings.push(message)
      }
    }
  }

  return { errors, warnings }
}

// ============================================================================
// Content Components
// ============================================================================

/**
 * Summary content showing pass/fail status and counts.
 */
function SummaryContent({
  report,
  errors,
  warnings,
}: {
  report: Report
  errors: HtmlValidateMessage[]
  warnings: HtmlValidateMessage[]
}): ReactNode {
  const palette = usePalette()
  const statusColor = report.valid ? palette.base0B : palette.base08
  const statusText = report.valid ? 'VALID' : 'INVALID'
  const statusIcon = report.valid ? '✓' : '✗'

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row">
        <text fg={statusColor}>
          {statusIcon} {statusText}
        </text>
      </box>
      <box flexDirection="row" marginTop={1}>
        <text fg={palette.base03}>Errors: </text>
        <text fg={errors.length > 0 ? palette.base08 : palette.base05}>
          {errors.length}
        </text>
      </box>
      <box flexDirection="row">
        <text fg={palette.base03}>Warnings: </text>
        <text fg={warnings.length > 0 ? palette.base0A : palette.base05}>
          {warnings.length}
        </text>
      </box>
    </box>
  )
}

/**
 * Render a list of validation messages as cards.
 */
function MessagesContent({
  messages,
  severity,
}: {
  messages: HtmlValidateMessage[]
  severity: 'error' | 'warning'
}): ReactNode {
  const palette = usePalette()
  if (messages.length === 0) {
    const color = palette.base0B
    const text =
      severity === 'error'
        ? 'No errors found.'
        : 'No warnings found.'
    return <text fg={color}>{text}</text>
  }

  return (
    <box flexDirection="column" gap={0}>
      {messages.map((message, i) => (
        <Card
          key={i}
          title={message.ruleId}
          severity={severity}
          icon={severity === 'error' ? '✗' : '⚠'}
        >
          <CardRow label="Message" value={message.message} />
          <CardRow label="Location" value={`Line ${message.line}, Column ${message.column}`} />
        </Card>
      ))}
    </box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main ValidateHtml View Content component
 */
export function ValidateHtmlViewContent({
  data,
  height,
}: ViewComponentProps<Report>): ReactNode {
  const { errors, warnings } = categorizeMessages(data)
  const hasErrors = errors.length > 0
  const hasWarnings = warnings.length > 0

  // Summary text for collapsed sections
  const summaryText = data.valid
    ? 'HTML markup is valid'
    : `${errors.length} error(s), ${warnings.length} warning(s)`

  const errorsSummary = hasErrors
    ? `${errors.length} error(s) found`
    : 'No errors found'

  const warningsSummary = hasWarnings
    ? `${warnings.length} warning(s) found`
    : 'No warnings found'

  return (
    <SectionContainer height={height}>
      {/* Summary section */}
      <Section
        id="summary"
        title="SUMMARY"
        priority={SectionPriority.SUMMARY}
        severity={data.valid ? 'success' : 'error'}
        icon={data.valid ? '✓' : '✗'}
        summary={summaryText}
        defaultExpanded={true}
      >
        <SummaryContent report={data} errors={errors} warnings={warnings} />
      </Section>

      {/* Errors section */}
      <Section
        id="errors"
        title="ERRORS"
        priority={SectionPriority.ERROR}
        count={errors.length}
        severity={hasErrors ? 'error' : 'success'}
        icon={hasErrors ? '✗' : '✓'}
        summary={errorsSummary}
        defaultExpanded={hasErrors}
        scrollable
      >
        <MessagesContent messages={errors} severity="error" />
      </Section>

      {/* Warnings section */}
      <Section
        id="warnings"
        title="WARNINGS"
        priority={SectionPriority.WARNING}
        count={warnings.length}
        severity={hasWarnings ? 'warning' : 'success'}
        icon={hasWarnings ? '⚠' : '✓'}
        summary={warningsSummary}
        defaultExpanded={hasWarnings}
        scrollable
      >
        <MessagesContent messages={warnings} severity="warning" />
      </Section>
    </SectionContainer>
  )
}
