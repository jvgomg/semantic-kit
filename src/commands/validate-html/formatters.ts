import type { Report, Message } from 'html-validate'
import type { OutputFormat } from '../../lib/arguments.js'
import {
  createFormatterContext,
  formatIssues,
  type Issue,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { ValidateHtmlResult } from '../../lib/results.js'

// ============================================================================
// Issue Building
// ============================================================================

/**
 * Build an array of issues from the html-validate report.
 * Severity mapping:
 * - severity 2 -> error/high
 * - severity 1 -> warning/medium
 */
export function buildIssues(report: Report): Issue[] {
  const issues: Issue[] = []

  for (const result of report.results) {
    for (const message of result.messages) {
      issues.push(buildIssueFromMessage(message))
    }
  }

  return issues
}

/**
 * Build a single issue from an html-validate message.
 */
function buildIssueFromMessage(message: Message): Issue {
  const isError = message.severity === 2
  return {
    type: isError ? 'error' : 'warning',
    severity: isError ? 'high' : 'medium',
    title: message.ruleId,
    description: `${message.message} (line ${message.line}, col ${message.column})`,
  }
}

// ============================================================================
// Result Building
// ============================================================================

/**
 * Build the result object from html-validate report
 */
function buildValidateHtmlResult(
  report: Report,
  target: string,
): ValidateHtmlResult {
  return {
    target,
    valid: report.valid,
    errorCount: report.errorCount,
    warningCount: report.warningCount,
    results: report.results,
  }
}

// ============================================================================
// Output Formats
// ============================================================================

const SUCCESS_MESSAGE = 'HTML markup is valid'

/**
 * Format terminal output - full or compact mode.
 */
function formatTerminal(
  report: Report,
  ctx: ReturnType<typeof createFormatterContext>,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const issues = buildIssues(report)

  if (compact && issues.length > 3) {
    // Show first 3 issues + "and N more" in compact mode
    const truncatedIssues = issues.slice(0, 3)
    const moreCount = issues.length - 3
    const issuesOutput = formatIssues(truncatedIssues, ctx, { compact: true })
    return `${issuesOutput}\n\n... and ${moreCount} more`
  }

  return formatIssues(issues, ctx, { compact, successMessage: SUCCESS_MESSAGE })
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format HTML validation result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatValidateHtmlOutput(
  report: Report,
  format: OutputFormat,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (format) {
    case 'compact':
      return formatTerminal(report, ctx, { compact: true })
    case 'full':
    default:
      return formatTerminal(report, ctx)
  }
}

/**
 * Build JSON result data from html-validate report.
 */
export function buildJsonResult(
  report: Report,
  target: string,
): { result: ValidateHtmlResult; issues: Issue[] } {
  return {
    result: buildValidateHtmlResult(report, target),
    issues: buildIssues(report),
  }
}
