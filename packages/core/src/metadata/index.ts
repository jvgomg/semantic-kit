/**
 * Metadata extraction and validation library.
 *
 * Provides unified utilities for extracting and validating
 * social metadata (Open Graph, Twitter Cards) from HTML.
 */

// Types
export {
  type SocialValidationIssue,
  type SocialIssueMetadata,
  type ValidationSeverity,
  type NormalizedMetatags,
  type TagRequirements,
  OPEN_GRAPH_REQUIREMENTS,
  TWITTER_CARD_REQUIREMENTS,
  severityToIssue,
} from './types.js'

// Extraction
export {
  type StructuredData,
  type GroupedMetatags,
  extractStructuredData,
  normalizeMetatags,
  groupMetatagsByPrefix,
} from './extractor.js'

// Validation
export {
  TITLE_CHAR_LIMIT,
  DESCRIPTION_CHAR_LIMIT,
  type ValidationOptions,
  type ValidationInput,
  isAbsoluteUrl,
  validateOgUrl,
  validateOgTitleLength,
  validateOgDescriptionLength,
  validateImageDimensions,
  validateImageAltText,
  validateTwitterCard,
  validateSocialTags,
  sortIssuesBySeverity,
} from './social-validation.js'

// Image URL Validation (async)
export {
  SUPPORTED_IMAGE_TYPES,
  PARTIAL_SUPPORT_IMAGE_TYPES,
  VALID_IMAGE_TYPES,
  PLATFORM_SIZE_LIMITS,
  UNIVERSAL_SIZE_LIMIT,
  DEFAULT_TIMEOUT_MS,
  type ImageValidationResult,
  type ImageValidationOptions,
  validateImageUrl,
  validateImageUrls,
} from './image-validation.js'
