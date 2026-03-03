import type { ValidateSchemaResult, AnyIssue } from '@webspecs/core'
import {
  createFormatterContext,
  formatIssues,
  formatTableGroups,
  type TableGroup,
} from '../../lib/cli-formatting/index.js'
import type { OutputMode } from '../../lib/output-mode.js'
import type { SchemaRenderOptions, SchemaValidationResult } from './types.js'
import { buildIssues } from './issues.js'

// Re-export for backwards compatibility
export { buildIssues, type SchemaIssue } from './issues.js'

// ============================================================================
// Table Groups
// ============================================================================

/**
 * Build detection table group showing what structured data was found.
 */
function buildDetectionTableGroup(result: SchemaValidationResult): TableGroup {
  const { testResult, detectedDisplayNames } = result
  const rows: { key: string; value: string | undefined }[] = []

  // JSON-LD types found
  if (testResult.schemas.length > 0) {
    rows.push({
      key: 'JSON-LD Types',
      value: testResult.schemas.join(', '),
    })
  }

  // Metatag standards detected
  if (detectedDisplayNames.length > 0) {
    rows.push({
      key: 'Metatags',
      value: detectedDisplayNames.join(', '),
    })
  }

  // No structured data found
  if (testResult.schemas.length === 0 && detectedDisplayNames.length === 0) {
    rows.push({
      key: 'Status',
      value: 'No structured data found',
    })
  }

  return {
    header: 'Detection',
    rows,
  }
}

// ============================================================================
// Output Formats
// ============================================================================

/**
 * Get success message for schema validation.
 */
function getSuccessMessage(result: SchemaValidationResult): string {
  const { testResult, requiredGroups } = result

  const isRequired = (group: string) =>
    requiredGroups.length === 0 || requiredGroups.includes(group)

  const requiredPassed = testResult.passed.filter((t) => isRequired(t.group))
  return `All ${requiredPassed.length} required schema tests passed`
}

/**
 * Format terminal output - full or compact mode.
 */
function formatTerminal(
  result: SchemaValidationResult,
  ctx: ReturnType<typeof createFormatterContext>,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact ?? false
  const sections: string[] = []

  // Detection table group
  const detectionGroup = buildDetectionTableGroup(result)
  sections.push(formatTableGroups([detectionGroup], ctx))

  // Issues section
  const issues = buildIssues(result)
  const successMessage = getSuccessMessage(result)

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

  return sections.join('\n')
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format schema validation result for terminal output (full or compact mode).
 * JSON format is handled directly by runCommand.
 */
export function formatSchemaValidationOutput(
  result: SchemaValidationResult,
  options: SchemaRenderOptions,
  mode: OutputMode,
): string {
  const ctx = createFormatterContext(mode)

  switch (options.format) {
    case 'compact':
      return formatTerminal(result, ctx, { compact: true })
    case 'full':
    default:
      return formatTerminal(result, ctx)
  }
}

/**
 * Build JSON result data from schema validation result.
 */
export function buildJsonResult(
  result: SchemaValidationResult,
  target: string,
): { result: ValidateSchemaResult; issues: AnyIssue[] } {
  const jsonResult: ValidateSchemaResult = {
    target,
    schemas: result.testResult.schemas,
    passed: result.testResult.passed.length,
    failed: result.requiredFailedCount,
    warnings: result.testResult.warnings.length,
    requiredGroups: result.requiredGroups,
    infoGroups: result.infoGroups,
    tests: result.testResult.tests,
    structuredData: result.testResult.structuredData,
  }
  return {
    result: jsonResult,
    issues: buildIssues(result),
  }
}
