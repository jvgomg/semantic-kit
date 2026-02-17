// @webspecs/core - Core analyzers, extractors, and validators

// Shared types
export type { Issue, IssueType, IssueSeverity } from './types.js'

// HTML fetching
export { fetchHtmlContent } from './fetch.js'

// HTML parsing
export { parseHTML } from './html-parser.js'

// Google analysis
export { analyzeForGoogle, GOOGLE_SCHEMA_TYPES } from './google-analysis.js'

// HTML validation
export { validateHtml } from './html-validation.js'
export type {
  Report as HtmlValidateReport,
  Message as HtmlValidateMessage,
} from 'html-validate'

// Accessibility validation
export {
  validateAccessibility,
  parseWcagLevel,
  VALID_LEVELS as WCAG_VALID_LEVELS,
  WCAG_TAGS,
  type WcagLevel,
  type AxeResults,
  type AxeAnalysisResult,
} from './accessibility-validation.js'

// File system utilities (with build-time target switching)
export {
  fileExists,
  readTextFile,
  readJsonFile,
  writeTextFile,
  mkdir,
} from './fs.js'

// HTML to Markdown
export { createTurndownService } from './turndown.js'

// Word/character counting
export { countWords } from './words.js'

// Structure analysis
export {
  analyzeStructure,
  compareStructures,
  extractTitle,
  extractLanguage,
  extractSkipLinks,
  extractLandmarks,
  extractHeadings,
  extractLinks,
  type StructureAnalysis,
  type StructureComparison,
  type StructureComparisonSummary,
  type StructureWarning,
  type LandmarkSkeleton,
  type LandmarkDiff,
  type ElementCount,
  type LandmarkNode,
  type LandmarkAnalysis,
  type HeadingInfo,
  type HeadingContentStats,
  type HeadingAnalysis,
  type HeadingDiff,
  type LinkDetail,
  type LinkGroup,
  type LinkAnalysis,
  type LinkDiff,
  type MetadataDiff,
  type SkipLinkInfo,
} from './structure.js'

// Structure formatting utilities
export {
  formatContentStats,
  formatElements,
  formatHeadingsSummary,
  formatHeadingTree,
  formatLandmarkSkeleton,
  formatLandmarkSkeletonCompact,
  formatLinkBadges,
  formatLinkGroups,
  formatOutline,
  formatWarnings,
  formatWarningsCompact,
} from './formatting.js'

// Accessibility testing (axe-core)
export {
  runAxeOnStaticHtml,
  getStructureRuleIds,
  type AxeStaticOptions,
  type AxeStaticResult,
  type RuleSet,
} from './axe-static.js'

// Accessibility tree / ARIA snapshot
export {
  analyzeAriaSnapshot,
  parseAriaSnapshot,
  countByRole,
  formatAriaSnapshot,
  compareSnapshots,
  hasDifferences,
  type AriaNode,
  type AriaSnapshotAnalysis,
  type FormatOptions,
  type SnapshotDiff,
} from './aria-snapshot.js'

// Playwright helpers
export {
  fetchRenderedHtml,
  fetchAccessibilitySnapshot,
  fetchAccessibilityComparison,
  PlaywrightNotInstalledError,
  type RenderedHtmlResult,
} from './playwright.js'

// Sitemap parsing
export {
  fetchSitemap,
  buildSitemapTree,
  flattenSitemapTree,
  countTreeUrls,
  extractDomainUrl,
  getDefaultSitemapUrl,
  isSitemapUrl,
  type SitemapUrl,
  type SitemapReference,
  type SitemapResult,
  type SitemapError,
  type SitemapFetchResult,
  type SitemapTreeNode,
} from './sitemap.js'

// Readability extraction
export { extractReadability, type ReadabilityResult } from './readability.js'

// Hidden content detection
export {
  analyzeHiddenContent,
  type HiddenContentSeverity,
  type FrameworkDetector,
} from './hidden-content.js'

// Metadata extraction and validation
export {
  type SocialValidationIssue,
  type ValidationSeverity,
  type NormalizedMetatags,
  type TagRequirements,
  type StructuredData,
  type GroupedMetatags,
  type ValidationOptions,
  type ValidationInput,
  OPEN_GRAPH_REQUIREMENTS,
  TWITTER_CARD_REQUIREMENTS,
  TITLE_CHAR_LIMIT,
  DESCRIPTION_CHAR_LIMIT,
  severityToIssue,
  extractStructuredData,
  normalizeMetatags,
  groupMetatagsByPrefix,
  isAbsoluteUrl,
  validateOgUrl,
  validateOgTitleLength,
  validateOgDescriptionLength,
  validateImageDimensions,
  validateImageAltText,
  validateTwitterCard,
  validateSocialTags,
  sortIssuesBySeverity,
} from './metadata/index.js'

// Social preview
export {
  type PageMetadata,
  type SocialTags,
  type SocialPreview,
  extractPageMetadata,
  buildSocialPreview,
  buildPreview,
} from './preview.js'

// Structured data validation
export {
  validateStructuredData,
  VALID_PRESETS,
  type StructuredDataResult,
  type Preset,
  type PresetName,
  type PresetMap,
  type SchemaValidationResult,
} from './schema-validation.js'

// Result types for all commands
export type {
  // A11y command results
  A11yResult,
  A11ySnapshotState,
  A11yCompareResult,
  // Structure command results
  StructureResult,
  StructureJsResult,
  StructureCompareResult,
  TuiStructureResult,
  StructureJsInternalResult,
  StructureCompareRunnerResult,
  // AI command results
  FrameworkDetection,
  HiddenContentAnalysis,
  AiResult,
  // Social command results
  SocialTagGroup,
  SocialResult,
  // Schema command results
  MetatagGroupResult,
  SchemaResult,
  SchemaJsResult,
  SchemaCompareResult,
  SchemaComparisonMetrics,
  // Readability command results
  ReadabilityJsResult,
  ReadabilityCompareResult,
  ReadabilityComparison,
  SectionInfo,
  ReaderResult,
  ReadabilityMetrics,
  ReadabilityFullMetrics,
  ReadabilityExtractionData,
  ReadabilityUtilityResult,
  // Validation command results
  HtmlValidateResultEntry,
  ValidateHtmlResult,
  SchemaTestResult,
  ValidateSchemaResult,
  AxeNodeResult,
  AxeViolationResult,
  ValidateA11yResult,
  // Google command results
  GoogleResult,
  GooglePageMetadata,
  GoogleSchemaItem,
  // Screen reader command results
  ScreenReaderResult,
  ScreenReaderSummary,
  ScreenReaderLandmark,
  ScreenReaderHeading,
} from './results.js'

// Screen reader analysis
export { analyzeScreenReaderExperience } from './screen-reader-analysis.js'

// Runner functions (orchestrate core analysis functions into typed results)
export {
  fetchAi,
  fetchA11y,
  fetchA11yJs,
  fetchA11yCompare,
  fetchGoogle,
  fetchReader,
  fetchReadability,
  fetchReadabilityJs,
  fetchReadabilityCompare,
  fetchSchema,
  fetchSchemaJs,
  fetchSchemaCompare,
  fetchSocial,
  fetchScreenReader,
  fetchStructure,
  fetchStructureJs,
  fetchStructureCompare,
  runAxeAnalysis,
  fetchValidateHtml,
  fetchSchemaValidation,
  type FetchReadabilityJsOptions,
  type FetchSchemaJsOptions,
  type FetchSchemaCompareOptions,
  type FetchStructureJsOptions,
} from './runners.js'
