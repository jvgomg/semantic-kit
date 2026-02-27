/**
 * Types for the Social lens command.
 */
import type { OutputFormat } from '../../lib/arguments.js'
import type { OutputModeOptions } from '../../lib/output-mode.js'

// Re-export types from shared library for consumers
export type {
  SocialPreview,
  SocialResult,
  SocialTagGroup,
  SocialValidationIssue,
  ValidationSeverity,
} from '@webspecs/core'

// ============================================================================
// Constants
// ============================================================================

/**
 * Valid output formats for the social command.
 */
export const VALID_FORMATS: readonly OutputFormat[] = [
  'full',
  'compact',
  'json',
]
export type SocialFormat = (typeof VALID_FORMATS)[number]

// ============================================================================
// Command Options
// ============================================================================

/**
 * Options for the social command.
 */
export interface SocialOptions extends OutputModeOptions {
  /** Output format */
  format?: string
}
