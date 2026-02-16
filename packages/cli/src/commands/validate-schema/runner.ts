import { validateStructuredData } from '@webspecs/core'
import type { SchemaValidationResult } from './types.js'

// ============================================================================
// Public API
// ============================================================================

/**
 * Fetch and validate schema data.
 *
 * This is a thin wrapper around @webspecs/core's validateStructuredData
 * that maintains compatibility with the CLI's type definitions.
 */
export async function fetchSchemaValidation(
  target: string,
  presetsOption: string | undefined,
): Promise<SchemaValidationResult> {
  return validateStructuredData(target, presetsOption)
}
