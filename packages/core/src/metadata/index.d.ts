/**
 * Metadata extraction and validation library.
 *
 * Provides unified utilities for extracting and validating
 * social metadata (Open Graph, Twitter Cards) from HTML.
 */
export { type SocialValidationIssue, type ValidationSeverity, type NormalizedMetatags, type TagRequirements, OPEN_GRAPH_REQUIREMENTS, TWITTER_CARD_REQUIREMENTS, severityToIssue, } from './types.js';
export { type StructuredData, type GroupedMetatags, extractStructuredData, normalizeMetatags, groupMetatagsByPrefix, } from './extractor.js';
export { TITLE_CHAR_LIMIT, DESCRIPTION_CHAR_LIMIT, type ValidationOptions, type ValidationInput, isAbsoluteUrl, validateOgUrl, validateOgTitleLength, validateOgDescriptionLength, validateImageDimensions, validateImageAltText, validateTwitterCard, validateSocialTags, sortIssuesBySeverity, } from './social-validation.js';
//# sourceMappingURL=index.d.ts.map