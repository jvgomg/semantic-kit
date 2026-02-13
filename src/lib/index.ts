export { fetchHtmlContent } from './fetch.js'
export {
  validateFormat,
  validateTimeout,
  requireUrl,
  isUrl,
  type OutputFormat,
} from './arguments.js'
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
export { createTurndownService } from './turndown.js'
export { countWords } from './words.js'
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
export {
  runAxeOnStaticHtml,
  getStructureRuleIds,
  type AxeStaticOptions,
  type AxeStaticResult,
} from './axe-static.js'
export {
  fetchRenderedHtml,
  PlaywrightNotInstalledError,
  type RenderedHtmlResult,
} from './playwright.js'
export {
  fetchSitemap,
  buildSitemapTree,
  flattenSitemapTree,
  countTreeUrls,
  extractDomainUrl,
  getDefaultSitemapUrl,
  type SitemapUrl,
  type SitemapReference,
  type SitemapResult,
  type SitemapError,
  type SitemapFetchResult,
  type SitemapTreeNode,
} from './sitemap.js'
export {
  createJsonEnvelope,
  formatJsonEnvelope,
  type CommandInfo,
  type JsonEnvelope,
  type CreateEnvelopeOptions,
} from './json-envelope.js'
// CLI formatting (mode-aware)
export {
  colorize,
  colors,
  createFormatterContext,
  formatIssue,
  formatIssues,
  formatTable,
  formatTableGroups,
  getTerminalWidth,
  indent,
  wrapText,
  type FormatterContext,
  type FormatTableOptions,
  type Issue,
  type IssueSeverity,
  type IssueType,
  type TableGroup,
  type TableRow,
} from './cli-formatting/index.js'
