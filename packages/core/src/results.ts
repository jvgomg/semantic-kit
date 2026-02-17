/**
 * Explicit result types for all semantic-kit commands.
 *
 * These types define the structure of JSON output for each command,
 * establishing the foundation for programmatic usage and future TUI support.
 *
 * Design principles:
 * - Result types wrap existing lib types rather than duplicating them
 * - All results include the target URL/path for context
 * - Timeout and error states are captured consistently
 */

import type { AriaNode, SnapshotDiff } from './aria-snapshot.js'
import type { AxeStaticResult } from './axe-static.js'
import type { SocialValidationIssue } from './metadata/types.js'
import type { SocialPreview } from './preview.js'
import type { ReadabilityResult } from './readability.js'
import type { StructureAnalysis, StructureComparison } from './structure.js'

// ============================================================================
// A11y Command Results
// ============================================================================

/**
 * Result for `a11y` and `a11y:js` commands.
 * Shows accessibility tree snapshot with parsed structure.
 */
export interface A11yResult {
  /** Target URL analyzed */
  url: string
  /** Raw ARIA snapshot string (YAML format) */
  snapshot: string
  /** Parsed accessibility nodes */
  parsed: AriaNode[]
  /** Count of each ARIA role */
  counts: Record<string, number>
  /** Whether the page load timed out */
  timedOut: boolean
}

/**
 * Snapshot state for one version (static or hydrated)
 */
export interface A11ySnapshotState {
  /** Raw ARIA snapshot string */
  snapshot: string
  /** Count of each ARIA role */
  counts: Record<string, number>
  /** Whether this fetch timed out */
  timedOut: boolean
}

/**
 * Result for `a11y:compare` command.
 * Compares accessibility trees between static and hydrated states.
 */
export interface A11yCompareResult {
  /** Target URL analyzed */
  url: string
  /** Whether differences were detected */
  hasDifferences: boolean
  /** Static HTML accessibility state */
  static: A11ySnapshotState
  /** JavaScript-rendered accessibility state */
  hydrated: A11ySnapshotState
  /** Detailed differences between snapshots */
  diff: SnapshotDiff
}

// ============================================================================
// Social Command Results
// ============================================================================

/**
 * A group of social meta tags (Open Graph, Twitter Cards).
 */
export interface SocialTagGroup {
  /** Human-readable name (e.g., "Open Graph") */
  name: string
  /** Tag prefix (e.g., "og:") */
  prefix: string
  /** The extracted tags */
  tags: Record<string, string>
}

/**
 * Result for the `social` command.
 * Shows what social media platforms see when a link is shared.
 */
export interface SocialResult {
  /** Target URL or file path */
  target: string
  /** Open Graph tag group (null if no OG tags found) */
  openGraph: SocialTagGroup | null
  /** Twitter Card tag group (null if no Twitter tags found) */
  twitter: SocialTagGroup | null
  /** Resolved preview values (with fallbacks) */
  preview: SocialPreview
  /** Summary counts */
  counts: {
    /** Number of Open Graph tags found */
    openGraph: number
    /** Number of Twitter Card tags found */
    twitter: number
    /** Total social meta tags */
    total: number
  }
  /** Validation issues found */
  issues: SocialValidationIssue[]
}

// ============================================================================
// Structure Command Results
// ============================================================================

/**
 * Result for `structure` command.
 * Wraps StructureAnalysis with target URL.
 */
export interface StructureResult {
  /** Target URL or file path */
  target: string
  /** Complete structure analysis */
  analysis: StructureAnalysis
}

/**
 * Result for `structure:js` command.
 * Compares static and hydrated structure.
 */
export interface StructureJsResult {
  /** Static HTML structure analysis */
  static: StructureAnalysis
  /** JavaScript-rendered structure analysis */
  hydrated: StructureAnalysis
  /** Comparison between static and hydrated */
  comparison: StructureComparison
  /** Whether the page load timed out */
  timedOut: boolean
}

/**
 * Result for `structure:compare` command.
 * Uses StructureComparison directly (already well-typed in lib/structure.ts)
 */
export type StructureCompareResult = StructureComparison

/**
 * Structure result including axe-core output, for TUI consumption.
 */
export interface TuiStructureResult {
  url: string
  analysis: StructureAnalysis
  axeResult: AxeStaticResult
}

/**
 * Structure:js result including axe-core output, for TUI consumption.
 */
export interface StructureJsInternalResult extends StructureJsResult {
  axeResult: AxeStaticResult
}

/**
 * Structure:compare runner result (comparison with timeout flag).
 */
export interface StructureCompareRunnerResult {
  comparison: StructureComparison
  timedOut: boolean
}

// ============================================================================
// AI Command Results
// ============================================================================

/**
 * Detected framework information
 */
export interface FrameworkDetection {
  /** Framework name (e.g., "Next.js") */
  name: string
  /** Detection confidence level */
  confidence: 'detected' | 'likely'
}

/**
 * Hidden content analysis results
 */
export interface HiddenContentAnalysis {
  /** Total words in hidden elements */
  hiddenWordCount: number
  /** Words visible without JavaScript */
  visibleWordCount: number
  /** Percentage of content that is hidden (0-100) */
  hiddenPercentage: number
  /** Severity level based on ratio */
  severity: 'none' | 'low' | 'high'
  /** Specific framework detected, if any */
  framework: FrameworkDetection | null
  /** Whether any streaming/hidden content was detected */
  hasStreamingContent: boolean
}

/**
 * Result for `ai` command.
 * Shows what AI crawlers see when fetching static HTML.
 */
export interface AiResult {
  /** Target URL or file path */
  url: string
  /** Page title */
  title: string | null
  /** Author/byline */
  byline: string | null
  /** Brief excerpt */
  excerpt: string | null
  /** Site name */
  siteName: string | null
  /** Word count of extracted content */
  wordCount: number
  /** Whether Readability considers page suitable for extraction */
  isReaderable: boolean
  /** Extracted content as markdown */
  markdown: string
  /** Extracted content as HTML */
  html: string
  /** Hidden content analysis */
  hiddenContentAnalysis: HiddenContentAnalysis
}

// ============================================================================
// Reader Command Results
// ============================================================================

/**
 * Readability extraction metrics.
 */
export interface ReadabilityMetrics {
  /** Word count of extracted content */
  wordCount: number
  /** Character count of extracted content */
  characterCount: number
  /** Number of paragraphs in extracted content */
  paragraphCount: number
  /** Whether Readability considers page suitable for extraction */
  isReaderable: boolean
}

/**
 * Result for `reader` command.
 * Shows how browser reader modes see the page content.
 */
export interface ReaderResult {
  /** Target URL or file path */
  url: string
  /** Page title */
  title: string | null
  /** Author/byline */
  byline: string | null
  /** Brief excerpt */
  excerpt: string | null
  /** Site name */
  siteName: string | null
  /** Published time (if detected) */
  publishedTime: string | null
  /** Readability extraction metrics */
  metrics: ReadabilityMetrics
  /** Extracted content as markdown */
  markdown: string
  /** Extracted content as HTML */
  html: string
}

// ============================================================================
// Readability Utility Command Results
// ============================================================================

/**
 * Full Readability extraction metrics (includes link density).
 */
export interface ReadabilityFullMetrics {
  /** Word count of extracted content */
  wordCount: number
  /** Character count of extracted content */
  characterCount: number
  /** Number of paragraphs in extracted content */
  paragraphCount: number
  /** Link density (links / total text length) - lower is better */
  linkDensity: number
  /** Whether Readability considers page suitable for extraction */
  isReaderable: boolean
}

/**
 * Extraction metadata from Readability.
 */
export interface ReadabilityExtractionData {
  /** Page title */
  title: string | null
  /** Author/byline */
  byline: string | null
  /** Brief excerpt */
  excerpt: string | null
  /** Site name */
  siteName: string | null
  /** Published time (if detected) */
  publishedTime: string | null
}

/**
 * Result for `readability` utility command.
 * Shows raw Readability extraction with full metrics.
 */
export interface ReadabilityUtilityResult {
  /** Target URL or file path */
  url: string
  /** Extraction metadata (null if extraction failed) */
  extraction: ReadabilityExtractionData | null
  /** Full Readability metrics including link density */
  metrics: ReadabilityFullMetrics
  /** Extracted content as markdown */
  markdown: string
  /** Extracted content as HTML */
  html: string
}

/**
 * Result for `readability:js` utility command.
 * Shows Readability extraction after JavaScript rendering.
 */
export interface ReadabilityJsResult extends ReadabilityUtilityResult {
  /** Whether the page load timed out */
  timedOut: boolean
}

/**
 * Section heading found only in one version (static or rendered).
 */
export interface SectionInfo {
  heading: string
  level: number
}

/**
 * Comparison metrics between static and rendered Readability content.
 */
export interface ReadabilityComparison {
  /** Word count in static HTML */
  staticWordCount: number
  /** Word count after JavaScript rendering */
  renderedWordCount: number
  /** Words only visible after JavaScript execution */
  jsDependentWordCount: number
  /** Percentage of content that requires JavaScript */
  jsDependentPercentage: number
  /** Sections that only appear after JavaScript */
  sectionsOnlyInRendered: SectionInfo[]
}

/**
 * Result for `readability:compare` command.
 */
export interface ReadabilityCompareResult {
  /** Target URL analyzed */
  url: string
  /** Readability extraction from static HTML */
  static: ReadabilityResult
  /** Readability extraction from JS-rendered HTML */
  rendered: ReadabilityResult
  /** Comparison metrics */
  comparison: ReadabilityComparison
  /** Whether the page load timed out */
  timedOut: boolean
}

// ============================================================================
// Google Lens Command Results
// ============================================================================

/**
 * Page metadata as Google sees it.
 */
export interface GooglePageMetadata {
  /** Page title from <title> element */
  title: string | null
  /** Meta description from <meta name="description"> */
  description: string | null
  /** Canonical URL from <link rel="canonical"> */
  canonical: string | null
  /** Language from <html lang="..."> */
  language: string | null
}

/**
 * A single JSON-LD schema object with type info.
 */
export interface GoogleSchemaItem {
  /** The @type value */
  type: string
  /** The full schema data */
  data: Record<string, unknown>
}

/**
 * Result for the `google` command.
 * Shows what Googlebot sees when crawling a page.
 */
export interface GoogleResult {
  /** Target URL or file path */
  target: string
  /** Page metadata */
  metadata: GooglePageMetadata
  /** Google-recognized JSON-LD schemas found */
  schemas: GoogleSchemaItem[]
  /** Heading structure (same as structure command) */
  headings: import('./structure.js').HeadingAnalysis
  /** Summary counts */
  counts: {
    /** Number of JSON-LD schemas found (Google-recognized only) */
    schemas: number
    /** Total headings */
    headings: number
  }
}

// ============================================================================
// Screen Reader Command Results
// ============================================================================

/**
 * Summary of accessibility features for screen reader users.
 */
export interface ScreenReaderSummary {
  /** Page title (from document or first h1) */
  pageTitle: string | null
  /** Number of landmark regions */
  landmarkCount: number
  /** Number of headings */
  headingCount: number
  /** Number of links */
  linkCount: number
  /** Number of form controls */
  formControlCount: number
  /** Number of images */
  imageCount: number
  /** Whether page has main landmark */
  hasMainLandmark: boolean
  /** Whether page has navigation landmark */
  hasNavigation: boolean
  /** Whether page has skip link */
  hasSkipLink: boolean
}

/**
 * A landmark region as experienced by screen reader users.
 */
export interface ScreenReaderLandmark {
  /** Landmark role (banner, navigation, main, contentinfo, etc.) */
  role: string
  /** Accessible name (if any) */
  name: string | null
  /** Number of headings in this landmark */
  headingCount: number
  /** Number of links in this landmark */
  linkCount: number
}

/**
 * A heading as experienced by screen reader users.
 */
export interface ScreenReaderHeading {
  /** Heading level (1-6) */
  level: number
  /** Heading text */
  text: string
}

/**
 * Result for `screen-reader` command.
 * Shows how screen readers interpret the page.
 */
export interface ScreenReaderResult {
  /** Target URL */
  url: string
  /** Whether the page load timed out */
  timedOut: boolean
  /** High-level summary of accessibility features */
  summary: ScreenReaderSummary
  /** Landmark regions found */
  landmarks: ScreenReaderLandmark[]
  /** Heading outline */
  headings: ScreenReaderHeading[]
  /** Raw ARIA snapshot for reference */
  snapshot: string
  /** Parsed accessibility nodes */
  parsed: import('./aria-snapshot.js').AriaNode[]
  /** Role counts */
  counts: Record<string, number>
}

// ============================================================================
// Schema Command Results
// ============================================================================

/**
 * Metatag group analysis (Open Graph, Twitter Cards)
 */
export interface MetatagGroupResult {
  /** Tags found as key-value pairs */
  tags: Record<string, string>
  /** Validation issues for this tag group */
  issues: SocialValidationIssue[]
}

/**
 * Result for `schema` command.
 * Shows all structured data found on a page.
 */
export interface SchemaResult {
  /** Target URL or file path */
  target: string
  /** JSON-LD schemas by type */
  jsonld: Record<string, unknown[]>
  /** Microdata schemas by type */
  microdata: Record<string, unknown[]>
  /** RDFa schemas by type */
  rdfa: Record<string, unknown[]>
  /** Open Graph metatags (null if not present) */
  openGraph: MetatagGroupResult | null
  /** Twitter Card metatags (null if not present) */
  twitter: MetatagGroupResult | null
  /** Other metatags as key-value pairs */
  metatags: Record<string, string>
  /** Validation issues found in social metadata */
  issues?: SocialValidationIssue[]
}

/**
 * Result for `schema:js` command.
 * Shows structured data after JavaScript rendering.
 */
export interface SchemaJsResult extends SchemaResult {
  /** Validation issues found in social metadata */
  issues?: SocialValidationIssue[]
  /** Whether the page load timed out */
  timedOut: boolean
}

/**
 * Comparison metrics for schema differences.
 */
export interface SchemaComparisonMetrics {
  /** Number of JSON-LD schemas added by JavaScript */
  jsonldAdded: number
  /** Number of JSON-LD schemas removed (rare, but possible) */
  jsonldRemoved: number
  /** Number of Microdata schemas added by JavaScript */
  microdataAdded: number
  /** Number of Microdata schemas removed */
  microdataRemoved: number
  /** Number of RDFa schemas added by JavaScript */
  rdfaAdded: number
  /** Number of RDFa schemas removed */
  rdfaRemoved: number
  /** Whether Open Graph tags changed */
  openGraphChanged: boolean
  /** Whether Twitter Card tags changed */
  twitterChanged: boolean
  /** Whether there are any differences */
  hasDifferences: boolean
}

/**
 * Result for `schema:compare` command.
 * Compares structured data between static and JS-rendered HTML.
 */
export interface SchemaCompareResult {
  /** Target URL analyzed */
  target: string
  /** Structured data from static HTML */
  static: SchemaResult
  /** Structured data from JS-rendered HTML */
  rendered: SchemaResult
  /** Comparison metrics */
  comparison: SchemaComparisonMetrics
  /** Whether the page load timed out */
  timedOut: boolean
}

// ============================================================================
// Validation Command Results
// ============================================================================

/**
 * Result entry from html-validate
 */
export interface HtmlValidateResultEntry {
  filePath: string
  messages: Array<{
    ruleId: string
    severity: number
    message: string
    line: number
    column: number
  }>
  errorCount: number
  warningCount: number
}

/**
 * Result for `validate:html` command.
 * HTML markup validation results.
 */
export interface ValidateHtmlResult {
  /** Target URL or file path */
  target: string
  /** Whether validation passed (no errors) */
  valid: boolean
  /** Total error count */
  errorCount: number
  /** Total warning count */
  warningCount: number
  /** Detailed results by file */
  results: HtmlValidateResultEntry[]
}

/**
 * Test result from structured-data-testing-tool
 */
export interface SchemaTestResult {
  /** Test identifier */
  test: string
  /** Schema type tested */
  type: string
  /** Test group (e.g., "Facebook", "Twitter") */
  group: string
  /** Human-readable description */
  description: string
  /** Whether the test passed */
  passed: boolean
  /** Whether the test is optional */
  optional?: boolean
  /** Whether this is a warning (not failure) */
  warning?: boolean
  /** Schema name if applicable */
  schema?: string
  /** Actual value found */
  value?: unknown
  /** Error details if failed */
  error?: {
    type: string
    message: string
    expected?: unknown
    found?: unknown
  }
}

/**
 * Result for `validate:schema` command.
 * Structured data validation results.
 */
export interface ValidateSchemaResult {
  /** Target URL or file path */
  target: string
  /** Schema types found */
  schemas: string[]
  /** Number of passed tests */
  passed: number
  /** Number of failed tests (in required groups) */
  failed: number
  /** Number of warnings */
  warnings: number
  /** Groups that were required (affect exit code) */
  requiredGroups: string[]
  /** Groups that were informational only */
  infoGroups: string[]
  /** All test results */
  tests: SchemaTestResult[]
  /** Raw structured data */
  structuredData: {
    metatags: Record<string, string[]>
    jsonld: Record<string, unknown[]>
    microdata: Record<string, unknown[]>
    rdfa: Record<string, unknown[]>
  }
}

/**
 * Axe-core violation node
 */
export interface AxeNodeResult {
  /** HTML snippet of the element */
  html: string
  /** CSS selector path to element */
  target: string[]
  /** Summary of how to fix */
  failureSummary?: string
}

/**
 * Axe-core violation
 */
export interface AxeViolationResult {
  /** Rule identifier */
  id: string
  /** Severity: critical, serious, moderate, minor */
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | null
  /** Brief description */
  description: string
  /** Help text */
  help: string
  /** URL to documentation */
  helpUrl: string
  /** Affected elements */
  nodes: AxeNodeResult[]
  /** WCAG and other tags */
  tags: string[]
}

/**
 * Result for `validate:a11y` command.
 * WCAG accessibility validation results.
 */
export interface ValidateA11yResult {
  /** Target URL */
  url: string
  /** WCAG conformance level tested */
  level: 'A' | 'AA' | 'AAA'
  /** Whether the page load timed out */
  timedOut: boolean
  /** Number of violations found */
  violations: number
  /** Number of passing rules */
  passes: number
  /** Number of incomplete checks (need manual review) */
  incomplete: number
  /** Whether incomplete checks were ignored */
  incompleteIgnored: boolean
  /** Detailed results */
  results: {
    violations: AxeViolationResult[]
    passes: unknown[]
    incomplete: unknown[]
  }
}
