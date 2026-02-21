/**
 * ValidateSchema View Content Component
 *
 * Custom TUI rendering for the validate:schema command using the expandable sections framework.
 */
import type { ReactNode } from 'react'
import {
  SectionContainer,
  Section,
  SectionPriority,
  Card,
  CardRow,
} from '../../components/ui/index.js'
import { useSemanticColors } from '../../theme.js'
import type { SchemaValidationResult } from '@webspecs/core'
import type { SchemaTestResult } from '@webspecs/core'
import type { ViewComponentProps } from '../types.js'

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Categorize test results by status.
 */
function categorizeTests(result: SchemaValidationResult): {
  failed: SchemaTestResult[]
  warnings: SchemaTestResult[]
  info: SchemaTestResult[]
  passed: number
} {
  const { testResult, requiredGroups } = result

  const isRequired = (group: string) =>
    requiredGroups.length === 0 || requiredGroups.includes(group)

  // Required failed tests are critical
  const failed = testResult.failed.filter((t) => isRequired(t.group))
  // Info-only failed tests (from detected but not required groups)
  const info = testResult.failed.filter((t) => !isRequired(t.group))
  // Warnings from required groups
  const warnings = testResult.warnings.filter((t) => isRequired(t.group))
  // Add info-only warnings
  info.push(...testResult.warnings.filter((t) => !isRequired(t.group)))

  return {
    failed,
    warnings,
    info,
    passed: testResult.passed.length,
  }
}

/**
 * Format schema detection summary.
 */
function formatDetectionSummary(result: SchemaValidationResult): string {
  const parts: string[] = []

  if (result.testResult.schemas.length > 0) {
    parts.push(`JSON-LD: ${result.testResult.schemas.join(', ')}`)
  }

  if (result.detectedDisplayNames.length > 0) {
    parts.push(`Metatags: ${result.detectedDisplayNames.join(', ')}`)
  }

  if (parts.length === 0) {
    return 'No structured data found'
  }

  return parts.join(' | ')
}

// ============================================================================
// Content Components
// ============================================================================

/**
 * Summary content showing overall validation status.
 */
function SummaryContent({
  failed,
  warnings,
  passed,
}: {
  failed: SchemaTestResult[]
  warnings: SchemaTestResult[]
  passed: number
}): ReactNode {
  const colors = useSemanticColors()
  const hasFailures = failed.length > 0
  const statusColor = hasFailures ? colors.error : colors.success
  const statusText = hasFailures ? 'FAILED' : 'PASSED'
  const statusIcon = hasFailures ? '✗' : '✓'

  return (
    <box flexDirection="column" gap={0}>
      <box flexDirection="row">
        <text fg={statusColor}>
          {statusIcon} {statusText}
        </text>
      </box>
      <box flexDirection="row" marginTop={1}>
        <text fg={colors.textMuted}>Passed: </text>
        <text fg={colors.success}>{passed}</text>
      </box>
      <box flexDirection="row">
        <text fg={colors.textMuted}>Failed: </text>
        <text fg={failed.length > 0 ? colors.error : colors.text}>
          {failed.length}
        </text>
      </box>
      <box flexDirection="row">
        <text fg={colors.textMuted}>Warnings: </text>
        <text fg={warnings.length > 0 ? colors.warning : colors.text}>
          {warnings.length}
        </text>
      </box>
    </box>
  )
}

/**
 * Detection content showing what structured data was found.
 */
function DetectionContent({
  result,
}: {
  result: SchemaValidationResult
}): ReactNode {
  const colors = useSemanticColors()
  const { testResult, detectedDisplayNames } = result
  const hasJsonLd = testResult.schemas.length > 0
  const hasMetatags = detectedDisplayNames.length > 0

  if (!hasJsonLd && !hasMetatags) {
    return <text fg={colors.warning}>No structured data detected.</text>
  }

  return (
    <box flexDirection="column" gap={0}>
      {hasJsonLd && (
        <box flexDirection="row">
          <text fg={colors.textMuted}>JSON-LD Types: </text>
          <text fg={colors.text}>{testResult.schemas.join(', ')}</text>
        </box>
      )}
      {hasMetatags && (
        <box flexDirection="row">
          <text fg={colors.textMuted}>Metatag Standards: </text>
          <text fg={colors.text}>{detectedDisplayNames.join(', ')}</text>
        </box>
      )}
      {result.requiredGroups.length > 0 && (
        <box flexDirection="row" marginTop={1}>
          <text fg={colors.textMuted}>Required Groups: </text>
          <text fg={colors.accent}>{result.requiredGroups.join(', ')}</text>
        </box>
      )}
      {result.infoGroups.length > 0 && (
        <box flexDirection="row">
          <text fg={colors.textMuted}>Info Groups: </text>
          <text fg={colors.textMuted}>{result.infoGroups.join(', ')}</text>
        </box>
      )}
    </box>
  )
}

/**
 * Render a list of test results as cards.
 */
function TestResultsContent({
  tests,
  severity,
  emptyMessage,
}: {
  tests: SchemaTestResult[]
  severity: 'error' | 'warning' | 'info'
  emptyMessage: string
}): ReactNode {
  const colors = useSemanticColors()
  if (tests.length === 0) {
    return <text fg={colors.success}>{emptyMessage}</text>
  }

  const icon = severity === 'error' ? '✗' : severity === 'warning' ? '⚠' : 'i'

  return (
    <box flexDirection="column" gap={0}>
      {tests.map((test, i) => (
        <Card
          key={i}
          title={`${test.group}: ${test.test}`}
          severity={severity}
          icon={icon}
        >
          <CardRow label="Description" value={test.description} />
          {test.error?.message && (
            <CardRow label="Error" value={test.error.message} />
          )}
          {test.schema && <CardRow label="Schema" value={test.schema} />}
        </Card>
      ))}
    </box>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * Main ValidateSchema View Content component
 */
export function ValidateSchemaViewContent({
  data,
  height,
}: ViewComponentProps<SchemaValidationResult>): ReactNode {
  const { failed, warnings, info, passed } = categorizeTests(data)
  const hasFailures = failed.length > 0
  const hasWarnings = warnings.length > 0
  const hasInfo = info.length > 0

  // Summary text for collapsed sections
  const summaryText = hasFailures
    ? `${failed.length} failed, ${warnings.length} warnings`
    : `All ${passed} tests passed`

  const detectionSummary = formatDetectionSummary(data)

  const failedSummary = hasFailures
    ? `${failed.length} test(s) failed`
    : 'All required tests passed'

  const warningSummary = hasWarnings
    ? `${warnings.length} warning(s)`
    : 'No warnings'

  const infoSummary = hasInfo
    ? `${info.length} informational item(s)`
    : 'No additional info'

  return (
    <SectionContainer height={height}>
      {/* Summary section */}
      <Section
        id="summary"
        title="SUMMARY"
        priority={SectionPriority.SUMMARY}
        severity={hasFailures ? 'error' : 'success'}
        icon={hasFailures ? '✗' : '✓'}
        summary={summaryText}
        defaultExpanded={true}
      >
        <SummaryContent failed={failed} warnings={warnings} passed={passed} />
      </Section>

      {/* Detection section */}
      <Section
        id="detection"
        title="DETECTION"
        priority={SectionPriority.INFO}
        summary={detectionSummary}
        defaultExpanded={true}
      >
        <DetectionContent result={data} />
      </Section>

      {/* Failed tests section */}
      <Section
        id="failed"
        title="FAILED TESTS"
        priority={SectionPriority.ERROR}
        count={failed.length}
        severity={hasFailures ? 'error' : 'success'}
        icon={hasFailures ? '✗' : '✓'}
        summary={failedSummary}
        defaultExpanded={hasFailures}
        scrollable
      >
        <TestResultsContent
          tests={failed}
          severity="error"
          emptyMessage="All required tests passed."
        />
      </Section>

      {/* Warnings section */}
      <Section
        id="warnings"
        title="WARNINGS"
        priority={SectionPriority.WARNING}
        count={warnings.length}
        severity={hasWarnings ? 'warning' : undefined}
        icon={hasWarnings ? '⚠' : undefined}
        summary={warningSummary}
        defaultExpanded={hasWarnings}
        scrollable
      >
        <TestResultsContent
          tests={warnings}
          severity="warning"
          emptyMessage="No warnings."
        />
      </Section>

      {/* Info section (non-required group results) */}
      {hasInfo && (
        <Section
          id="info"
          title="INFO"
          priority={SectionPriority.SECONDARY}
          count={info.length}
          summary={infoSummary}
          defaultExpanded={false}
          scrollable
        >
          <TestResultsContent
            tests={info}
            severity="info"
            emptyMessage="No additional information."
          />
        </Section>
      )}
    </SectionContainer>
  )
}
