/**
 * Issue generation module.
 *
 * Provides issue builders for all commands that can be used by CLI, TUI,
 * and any other consumers to generate standardized issues from results.
 */

// ============================================================================
// Shared Helpers
// ============================================================================

export {
  mapAxeImpactToSeverity,
  sortIssuesBySeverity,
  countIssuesBySeverity,
  hasHighSeverityIssues,
  getHighestSeverity,
  type AxeImpact,
} from './helpers.js'

// ============================================================================
// Metadata Types
// ============================================================================

export type {
  HtmlIssueMetadata,
  A11yIssueMetadata,
  SchemaValidationIssueMetadata,
  SocialIssueMetadata,
} from './types.js'

// ============================================================================
// Structure Command
// ============================================================================

export {
  buildStructureIssues,
  buildStructureCompareIssues,
  STRUCTURE_CODES,
  type StructureCode,
  type StructureIssueInput,
  type StructureCompareIssueInput,
} from './structure.js'

// ============================================================================
// Google Command
// ============================================================================

export {
  buildGoogleIssues,
  GOOGLE_CODES,
  type GoogleCode,
  type GoogleIssueInput,
} from './google.js'

// ============================================================================
// Screen Reader Command
// ============================================================================

export {
  buildScreenReaderIssues,
  SCREEN_READER_CODES,
  type ScreenReaderCode,
  type ScreenReaderIssueInput,
} from './screen-reader.js'

// ============================================================================
// AI Command
// ============================================================================

export {
  buildAiIssues,
  AI_CODES,
  type AiCode,
  type AiIssueInput,
} from './ai.js'

// ============================================================================
// Readability Command
// ============================================================================

export {
  buildReadabilityCompareIssues,
  READABILITY_CODES,
  type ReadabilityCode,
  type ReadabilityCompareIssueInput,
} from './readability.js'

// ============================================================================
// A11y Tree Command
// ============================================================================

export {
  buildA11yTreeIssues,
  buildA11yTreeCompareIssues,
  A11Y_TREE_CODES,
  type A11yTreeCode,
  type A11yTreeIssueInput,
  type A11yTreeCompareIssueInput,
} from './a11y-tree.js'

// ============================================================================
// HTML Validation Command
// ============================================================================

export {
  buildHtmlIssues,
  HTML_CODE_PREFIX,
  type HtmlIssue,
  type HtmlIssueInput,
} from './validate-html.js'

// ============================================================================
// Accessibility Validation Command
// ============================================================================

export {
  buildA11yIssues,
  A11Y_CODE_PREFIX,
  type A11yIssue,
  type A11yIssueInput,
} from './validate-a11y.js'

// ============================================================================
// Schema Validation Command
// ============================================================================

export {
  buildSchemaValidationIssues,
  SCHEMA_CODE_PREFIX,
  type SchemaValidationIssue,
  type SchemaValidationIssueInput,
} from './validate-schema.js'

// ============================================================================
// Social Command
// ============================================================================

export {
  buildSocialIssues,
  SOCIAL_CODES,
  type SocialCode,
  type SocialIssueInput,
} from './social.js'

// ============================================================================
// Schema Command
// ============================================================================

export {
  buildSchemaIssues,
  buildSchemaCompareIssues,
  SCHEMA_CODES,
  type SchemaCode,
  type SchemaIssueInput,
  type SchemaCompareIssueInput,
} from './schema.js'
