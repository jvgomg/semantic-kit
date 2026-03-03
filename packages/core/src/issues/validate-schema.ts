/**
 * Schema validation issue generation.
 */
import type { SchemaTestResult } from '../results.js'
import type { SchemaValidationResult } from '../schema-validation.js'
import type { Issue } from '../types.js'
import type { SchemaValidationIssueMetadata } from './types.js'

// ============================================================================
// Issue Type
// ============================================================================

/**
 * Schema validation issue with group metadata.
 */
export type SchemaValidationIssue = Issue<SchemaValidationIssueMetadata>

// ============================================================================
// Issue Codes
// ============================================================================

/**
 * Issue code prefix for schema validation.
 * Full codes are: schema-{group}-{test}
 */
export const SCHEMA_CODE_PREFIX = 'schema' as const

// ============================================================================
// Input Types
// ============================================================================

export interface SchemaValidationIssueInput {
  result: SchemaValidationResult
  requiredGroups: string[]
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a single issue from a schema test result.
 */
function buildIssueFromTest(
  test: SchemaTestResult,
  type: Issue['type'],
  severity: Issue['severity'],
): SchemaValidationIssue {
  const title = `${test.group}: ${test.test}`
  const description = test.error?.message ?? test.description ?? 'Test failed'
  const code = `${SCHEMA_CODE_PREFIX}-${test.group.toLowerCase()}-${test.test.toLowerCase().replace(/\s+/g, '-')}`

  return {
    type,
    severity,
    code,
    title,
    description,
    metadata: {
      group: test.group,
      test: test.test,
    },
  }
}

// ============================================================================
// Issue Builder
// ============================================================================

/**
 * Build an array of issues from the schema validation result.
 * Severity mapping:
 * - Failed required tests -> error/high
 * - Warnings -> warning/medium
 * - Failed info-only tests -> info/low
 */
export function buildSchemaValidationIssues(
  input: SchemaValidationIssueInput,
): SchemaValidationIssue[] {
  const { result, requiredGroups } = input
  const { testResult } = result
  const issues: SchemaValidationIssue[] = []

  const isRequired = (group: string) =>
    requiredGroups.length === 0 || requiredGroups.includes(group)

  // Failed required tests -> error/high
  for (const test of testResult.failed) {
    if (isRequired(test.group)) {
      issues.push(buildIssueFromTest(test, 'error', 'high'))
    } else {
      // Failed info-only tests -> info/low
      issues.push(buildIssueFromTest(test, 'info', 'low'))
    }
  }

  // Warnings -> warning/medium
  for (const test of testResult.warnings) {
    if (isRequired(test.group)) {
      issues.push(buildIssueFromTest(test, 'warning', 'medium'))
    } else {
      issues.push(buildIssueFromTest(test, 'info', 'low'))
    }
  }

  return issues
}
