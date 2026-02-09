import {
  createFormatterContext,
  formatIssues,
  formatTableGroups,
  type Issue,
  type TableGroup,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { ValidateA11yResult, AxeViolationResult } from '../../lib/results.js'
import type {
  AxeAnalysisResult,
  RenderOptions,
  WcagLevel,
} from './types.js'

// ============================================================================
// Issue Building
// ============================================================================

/**
 * Build an array of issues from the axe analysis result.
 * Severity mapping:
 * - critical -> error/high
 * - serious -> error/medium
 * - moderate -> warning/medium
 * - minor -> info/low
 * - Incomplete (if not ignored) -> warning/low with "Needs manual review: " prefix
 */
export function buildIssues(
  result: AxeAnalysisResult,
  ignoreIncomplete: boolean = false,
): Issue[] {
  const issues: Issue[] = []
  const { results } = result

  // Process violations
  for (const violation of results.violations) {
    issues.push(buildIssueFromViolation(violation))
  }

  // Process incomplete checks (if not ignored)
  if (!ignoreIncomplete) {
    for (const incomplete of results.incomplete as AxeViolationResult[]) {
      issues.push(buildIssueFromIncomplete(incomplete))
    }
  }

  return issues
}

/**
 * Build a single issue from an axe violation.
 */
function buildIssueFromViolation(violation: AxeViolationResult): Issue {
  const impact = violation.impact ?? 'moderate'
  const { type, severity } = mapImpactToSeverity(impact)

  const title = `[${impact}] ${violation.id}`
  const nodeCount = violation.nodes.length
  const description = `${violation.help}. Affects ${nodeCount} element(s).`

  return {
    type,
    severity,
    title,
    description,
    tip: violation.helpUrl || undefined,
  }
}

/**
 * Build a single issue from an incomplete check.
 */
function buildIssueFromIncomplete(incomplete: AxeViolationResult): Issue {
  const nodeCount = incomplete.nodes.length
  const description = `${incomplete.help}. Affects ${nodeCount} element(s).`

  return {
    type: 'warning',
    severity: 'low',
    title: `Needs manual review: ${incomplete.id}`,
    description,
    tip: incomplete.helpUrl || undefined,
  }
}

/**
 * Map axe impact to issue type and severity.
 */
function mapImpactToSeverity(
  impact: string,
): { type: Issue['type']; severity: Issue['severity'] } {
  switch (impact) {
    case 'critical':
      return { type: 'error', severity: 'high' }
    case 'serious':
      return { type: 'error', severity: 'medium' }
    case 'moderate':
      return { type: 'warning', severity: 'medium' }
    case 'minor':
    default:
      return { type: 'info', severity: 'low' }
  }
}

// ============================================================================
// Table Groups
// ============================================================================

/**
 * Build config table group showing WCAG level and timeout status.
 */
function buildConfigTableGroup(
  level: WcagLevel,
  timedOut: boolean,
): TableGroup {
  const rows: { key: string; value: string | undefined }[] = [
    { key: 'WCAG Level', value: level.toUpperCase() },
  ]

  if (timedOut) {
    rows.push({ key: 'Timeout', value: 'Page load timed out - results may be incomplete' })
  }

  return {
    header: 'Config',
    rows,
  }
}

// ============================================================================
// Output Formats
// ============================================================================

/**
 * Get success message for a11y validation.
 */
function getSuccessMessage(level: WcagLevel): string {
  return `No WCAG ${level.toUpperCase()} accessibility violations found`
}

/**
 * Format terminal output - full or compact mode.
 */
function formatTerminal(
  result: AxeAnalysisResult,
  ctx: ReturnType<typeof createFormatterContext>,
  options: { compact?: boolean; level: WcagLevel; ignoreIncomplete: boolean },
): string {
  const { compact = false, level, ignoreIncomplete } = options
  const sections: string[] = []

  // Config table group
  const configGroup = buildConfigTableGroup(level, result.timedOut)
  sections.push(formatTableGroups([configGroup], ctx))

  // Issues section
  const issues = buildIssues(result, ignoreIncomplete)
  const successMessage = getSuccessMessage(level)

  if (compact && issues.length > 3) {
    // Show first 3 issues + "and N more" in compact mode
    const truncatedIssues = issues.slice(0, 3)
    const moreCount = issues.length - 3
    const issuesOutput = formatIssues(truncatedIssues, ctx, { compact: true })
    sections.push('')
    sections.push(issuesOutput)
    sections.push('')
    sections.push(`... and ${moreCount} more`)
  } else {
    sections.push('')
    sections.push(formatIssues(issues, ctx, { compact, successMessage }))
  }

  // Add note about ignored incomplete checks
  if (ignoreIncomplete && result.results.incomplete.length > 0) {
    sections.push('')
    sections.push(`${result.results.incomplete.length} incomplete check(s) ignored`)
  }

  return sections.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format A11y validation result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatA11yValidationOutput(
  result: AxeAnalysisResult,
  options: RenderOptions,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (options.format) {
    case 'compact':
      return formatTerminal(result, ctx, {
        compact: true,
        level: options.level,
        ignoreIncomplete: options.ignoreIncomplete,
      })
    case 'full':
    default:
      return formatTerminal(result, ctx, {
        compact: false,
        level: options.level,
        ignoreIncomplete: options.ignoreIncomplete,
      })
  }
}

/**
 * Build JSON result data from axe analysis result.
 */
export function buildJsonResult(
  result: AxeAnalysisResult,
  url: string,
  level: WcagLevel,
  ignoreIncomplete: boolean,
): { result: ValidateA11yResult; issues: Issue[] } {
  const { results, timedOut } = result
  const hasIncomplete = results.incomplete.length > 0

  const jsonResult: ValidateA11yResult = {
    url,
    level: level.toUpperCase() as 'A' | 'AA' | 'AAA',
    timedOut,
    violations: results.violations.length,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    incompleteIgnored: ignoreIncomplete && hasIncomplete,
    results: {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
    },
  }
  return {
    result: jsonResult,
    issues: buildIssues(result, ignoreIncomplete),
  }
}
