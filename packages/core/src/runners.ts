/**
 * Runner functions for all semantic-kit commands.
 *
 * These are the core orchestration functions that fetch, analyze, and return
 * structured results. Both the CLI and TUI consume these functions.
 *
 * Each runner:
 * 1. Takes a URL/target as input
 * 2. Calls core analysis functions
 * 3. Returns a typed result object
 */

import type { Report as HtmlValidateReport } from 'html-validate'
import { validateAccessibility } from './accessibility-validation.js'
import type {
  AxeAnalysisResult,
  WcagLevel,
} from './accessibility-validation.js'
import {
  analyzeAriaSnapshot,
  compareSnapshots,
  hasDifferences,
} from './aria-snapshot.js'
import { runAxeOnStaticHtml } from './axe-static.js'
import type { RuleSet } from './axe-static.js'
import { fetchHtmlContent } from './fetch.js'
import { analyzeForGoogle } from './google-analysis.js'
import { analyzeHiddenContent } from './hidden-content.js'
import { parseHTML } from './html-parser.js'
import { validateHtml } from './html-validation.js'
import {
  extractStructuredData,
  normalizeMetatags,
  validateSocialTags,
  sortIssuesBySeverity,
  groupMetatagsByPrefix,
} from './metadata/index.js'
import type { SocialValidationIssue } from './metadata/types.js'
import {
  fetchRenderedHtml,
  fetchAccessibilitySnapshot,
  fetchAccessibilityComparison,
} from './playwright.js'
import { buildSocialPreview, extractPageMetadata } from './preview.js'
import { extractReadability } from './readability.js'
import type {
  AiResult,
  A11yResult,
  A11yCompareResult,
  GoogleResult,
  ReaderResult,
  ReadabilityUtilityResult,
  ReadabilityJsResult,
  ReadabilityCompareResult,
  SchemaResult,
  SchemaJsResult,
  SchemaCompareResult,
  SocialResult,
  SocialTagGroup,
  ScreenReaderResult,
  TuiStructureResult,
  StructureJsInternalResult,
  StructureCompareRunnerResult,
} from './results.js'
import { validateStructuredData } from './schema-validation.js'
import type { SchemaValidationResult } from './schema-validation.js'
import { analyzeScreenReaderExperience } from './screen-reader-analysis.js'
import { analyzeStructure, compareStructures } from './structure.js'

// ============================================================================
// Internal helpers
// ============================================================================

interface InternalTagGroup {
  name: string
  prefix: string
  tags: Array<{ name: string; value: string }>
}

/**
 * Group metatags by standard (Open Graph, Twitter, other).
 */
function groupMetatagsInternal(metatags: Record<string, string[]>): {
  openGraph: InternalTagGroup | null
  twitter: InternalTagGroup | null
  other: Array<{ name: string; value: string }>
} {
  const ogTags: Array<{ name: string; value: string }> = []
  const twitterTags: Array<{ name: string; value: string }> = []
  const otherTags: Array<{ name: string; value: string }> = []

  for (const [name, values] of Object.entries(metatags)) {
    if (name === 'undefined') continue
    const value = values[0] || ''

    if (name.startsWith('og:')) {
      ogTags.push({ name, value })
    } else if (name.startsWith('twitter:')) {
      twitterTags.push({ name, value })
    } else {
      otherTags.push({ name, value })
    }
  }

  const openGraph: InternalTagGroup | null =
    ogTags.length > 0
      ? { name: 'Open Graph', prefix: 'og:', tags: ogTags }
      : null

  const twitter: InternalTagGroup | null =
    twitterTags.length > 0
      ? { name: 'Twitter Cards', prefix: 'twitter:', tags: twitterTags }
      : null

  return { openGraph, twitter, other: otherTags }
}

/**
 * Filter validation issues by tag prefix.
 */
function filterIssuesByPrefix(
  issues: SocialValidationIssue[],
  prefix: string,
): SocialValidationIssue[] {
  return issues.filter((issue) => issue.tag.startsWith(prefix))
}

/**
 * Build a SchemaResult from extracted structured data.
 */
function buildSchemaResult(
  target: string,
  data: ReturnType<typeof extractStructuredData>,
): SchemaResult {
  const metatagGroups = groupMetatagsInternal(data.metatags)
  const normalizedTags = normalizeMetatags(data.metatags)
  const allIssues = sortIssuesBySeverity(
    validateSocialTags(normalizedTags, {
      checkPresence: true,
      checkQuality: true,
    }),
  )
  const ogIssues = filterIssuesByPrefix(allIssues, 'og:')
  const twitterIssues = filterIssuesByPrefix(allIssues, 'twitter:')

  return {
    target,
    jsonld: data.jsonld,
    microdata: data.microdata,
    rdfa: data.rdfa,
    openGraph: metatagGroups.openGraph
      ? {
          tags: Object.fromEntries(
            metatagGroups.openGraph.tags.map((t) => [t.name, t.value]),
          ),
          issues: ogIssues,
        }
      : null,
    twitter: metatagGroups.twitter
      ? {
          tags: Object.fromEntries(
            metatagGroups.twitter.tags.map((t) => [t.name, t.value]),
          ),
          issues: twitterIssues,
        }
      : null,
    metatags: Object.fromEntries(
      metatagGroups.other.map((t) => [t.name, t.value]),
    ),
    issues: allIssues,
  }
}

/**
 * Extract section headings from HTML content.
 */
function extractSections(html: string): { heading: string; level: number }[] {
  const sections: { heading: string; level: number }[] = []
  const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi
  let match

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const text = match[2].replace(/<[^>]+>/g, '').trim()
    if (text) {
      sections.push({ heading: text, level })
    }
  }

  return sections
}

// ============================================================================
// AI runner
// ============================================================================

/**
 * Fetch and extract AI-visible content from a URL or file path.
 */
export async function fetchAi(target: string): Promise<AiResult> {
  const html = await fetchHtmlContent(target)
  const { extraction, metrics, markdown } = extractReadability(html)
  const hiddenContentAnalysis = analyzeHiddenContent(html, metrics.wordCount)

  return {
    url: target,
    title: extraction?.title ?? null,
    byline: extraction?.byline ?? null,
    excerpt: extraction?.excerpt ?? null,
    siteName: extraction?.siteName ?? null,
    wordCount: metrics.wordCount,
    isReaderable: metrics.isReaderable,
    markdown,
    html: extraction?.html ?? '',
    hiddenContentAnalysis,
  }
}

// ============================================================================
// A11y tree runners
// ============================================================================

/**
 * Fetch accessibility snapshot with JavaScript disabled.
 */
export async function fetchA11y(
  target: string,
  timeoutMs: number,
): Promise<A11yResult> {
  const { snapshot, timedOut } = await fetchAccessibilitySnapshot(target, {
    javaScriptEnabled: false,
    timeoutMs,
  })
  const { nodes, counts } = analyzeAriaSnapshot(snapshot)

  return {
    url: target,
    snapshot,
    parsed: nodes,
    counts,
    timedOut,
  }
}

/**
 * Fetch accessibility snapshot with JavaScript enabled.
 */
export async function fetchA11yJs(
  target: string,
  timeoutMs: number,
): Promise<A11yResult> {
  const { snapshot, timedOut } = await fetchAccessibilitySnapshot(target, {
    javaScriptEnabled: true,
    timeoutMs,
  })
  const { nodes, counts } = analyzeAriaSnapshot(snapshot)

  return {
    url: target,
    snapshot,
    parsed: nodes,
    counts,
    timedOut,
  }
}

/**
 * Fetch and compare accessibility snapshots (static vs hydrated).
 */
export async function fetchA11yCompare(
  target: string,
  timeoutMs: number,
): Promise<A11yCompareResult> {
  const { static: staticResult, hydrated: hydratedResult } =
    await fetchAccessibilityComparison(target, timeoutMs)

  const diff = compareSnapshots(staticResult.snapshot, hydratedResult.snapshot)
  const staticAnalysis = analyzeAriaSnapshot(staticResult.snapshot)
  const hydratedAnalysis = analyzeAriaSnapshot(hydratedResult.snapshot)

  return {
    url: target,
    hasDifferences: hasDifferences(diff),
    static: {
      snapshot: staticResult.snapshot,
      counts: staticAnalysis.counts,
      timedOut: staticResult.timedOut,
    },
    hydrated: {
      snapshot: hydratedResult.snapshot,
      counts: hydratedAnalysis.counts,
      timedOut: hydratedResult.timedOut,
    },
    diff,
  }
}

// ============================================================================
// Google runner
// ============================================================================

/**
 * Fetch and analyze a page from Google's perspective.
 */
export async function fetchGoogle(target: string): Promise<GoogleResult> {
  return analyzeForGoogle(target)
}

// ============================================================================
// Reader runner
// ============================================================================

/**
 * Fetch and extract reader mode content from a URL or file path.
 */
export async function fetchReader(target: string): Promise<ReaderResult> {
  const html = await fetchHtmlContent(target)
  const { extraction, metrics, markdown } = extractReadability(html)

  return {
    url: target,
    title: extraction?.title ?? null,
    byline: extraction?.byline ?? null,
    excerpt: extraction?.excerpt ?? null,
    siteName: extraction?.siteName ?? null,
    publishedTime: extraction?.publishedTime ?? null,
    metrics: {
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      paragraphCount: metrics.paragraphCount,
      isReaderable: metrics.isReaderable,
    },
    markdown,
    html: extraction?.html ?? '',
  }
}

// ============================================================================
// Readability runners
// ============================================================================

/**
 * Fetch and extract Readability content with full metrics.
 */
export async function fetchReadability(
  target: string,
): Promise<ReadabilityUtilityResult> {
  const html = await fetchHtmlContent(target)
  const { extraction, metrics, markdown } = extractReadability(html)

  return {
    url: target,
    extraction: extraction
      ? {
          title: extraction.title,
          byline: extraction.byline,
          excerpt: extraction.excerpt,
          siteName: extraction.siteName,
          publishedTime: extraction.publishedTime,
        }
      : null,
    metrics: {
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      paragraphCount: metrics.paragraphCount,
      linkDensity: metrics.linkDensity,
      isReaderable: metrics.isReaderable,
    },
    markdown,
    html: extraction?.html ?? '',
  }
}

export interface FetchReadabilityJsOptions {
  timeoutMs: number
}

/**
 * Fetch JS-rendered HTML and extract Readability content with full metrics.
 */
export async function fetchReadabilityJs(
  target: string,
  options: FetchReadabilityJsOptions,
): Promise<ReadabilityJsResult> {
  const { timeoutMs } = options
  const { html, timedOut } = await fetchRenderedHtml(target, timeoutMs)
  const { extraction, metrics, markdown } = extractReadability(html)

  return {
    url: target,
    extraction: extraction
      ? {
          title: extraction.title,
          byline: extraction.byline,
          excerpt: extraction.excerpt,
          siteName: extraction.siteName,
          publishedTime: extraction.publishedTime,
        }
      : null,
    metrics: {
      wordCount: metrics.wordCount,
      characterCount: metrics.characterCount,
      paragraphCount: metrics.paragraphCount,
      linkDensity: metrics.linkDensity,
      isReaderable: metrics.isReaderable,
    },
    markdown,
    html: extraction?.html ?? '',
    timedOut,
  }
}

/**
 * Fetch and compare Readability extraction from static vs JS-rendered HTML.
 */
export async function fetchReadabilityCompare(
  url: string,
  timeoutMs: number = 5000,
): Promise<ReadabilityCompareResult> {
  const [staticHtml, { html: renderedHtml, timedOut }] = await Promise.all([
    fetchHtmlContent(url),
    fetchRenderedHtml(url, timeoutMs),
  ])

  const staticResult = extractReadability(staticHtml)
  const renderedResult = extractReadability(renderedHtml)

  const jsDependentWordCount = Math.max(
    0,
    renderedResult.metrics.wordCount - staticResult.metrics.wordCount,
  )
  const jsDependentPercentage =
    renderedResult.metrics.wordCount > 0
      ? Math.round(
          (jsDependentWordCount / renderedResult.metrics.wordCount) * 100,
        )
      : 0

  const staticSections = extractSections(staticResult.markdown)
  const renderedSections = extractSections(renderedResult.markdown)
  const staticHeadings = new Set(
    staticSections.map((s) => s.heading.toLowerCase()),
  )
  const sectionsOnlyInRendered = renderedSections.filter(
    (section) => !staticHeadings.has(section.heading.toLowerCase()),
  )

  return {
    url,
    static: staticResult,
    rendered: renderedResult,
    comparison: {
      staticWordCount: staticResult.metrics.wordCount,
      renderedWordCount: renderedResult.metrics.wordCount,
      jsDependentWordCount,
      jsDependentPercentage,
      sectionsOnlyInRendered,
    },
    timedOut,
  }
}

// ============================================================================
// Schema runners
// ============================================================================

/**
 * Fetch schema data from static HTML and return as structured result.
 */
export async function fetchSchema(target: string): Promise<SchemaResult> {
  const html = await fetchHtmlContent(target)
  const data = extractStructuredData(html)
  return buildSchemaResult(target, data)
}

export interface FetchSchemaJsOptions {
  timeoutMs: number
}

/**
 * Fetch JS-rendered HTML and extract structured data.
 */
export async function fetchSchemaJs(
  target: string,
  options: FetchSchemaJsOptions,
): Promise<SchemaJsResult> {
  const { timeoutMs } = options
  const { html, timedOut } = await fetchRenderedHtml(target, timeoutMs)
  const data = extractStructuredData(html)
  const base = buildSchemaResult(target, data)
  return { ...base, timedOut }
}

export interface FetchSchemaCompareOptions {
  timeoutMs: number
}

/**
 * Fetch and compare schema extraction from static vs JS-rendered HTML.
 */
export async function fetchSchemaCompare(
  target: string,
  options: FetchSchemaCompareOptions,
): Promise<SchemaCompareResult> {
  const { timeoutMs } = options

  const [staticHtml, { html: renderedHtml, timedOut }] = await Promise.all([
    fetchHtmlContent(target),
    fetchRenderedHtml(target, timeoutMs),
  ])

  const staticData = extractStructuredData(staticHtml)
  const renderedData = extractStructuredData(renderedHtml)
  const staticResult = buildSchemaResult(target, staticData)
  const renderedResult = buildSchemaResult(target, renderedData)

  function getSchemaTypes(schemas: Record<string, unknown[]>): Set<string> {
    return new Set(Object.keys(schemas).filter((k) => k !== 'undefined'))
  }

  const staticJsonld = getSchemaTypes(staticResult.jsonld)
  const renderedJsonld = getSchemaTypes(renderedResult.jsonld)
  const staticMicrodata = getSchemaTypes(staticResult.microdata)
  const renderedMicrodata = getSchemaTypes(renderedResult.microdata)
  const staticRdfa = getSchemaTypes(staticResult.rdfa)
  const renderedRdfa = getSchemaTypes(renderedResult.rdfa)

  const jsonldAdded = [...renderedJsonld].filter(
    (t) => !staticJsonld.has(t),
  ).length
  const microdataAdded = [...renderedMicrodata].filter(
    (t) => !staticMicrodata.has(t),
  ).length
  const rdfaAdded = [...renderedRdfa].filter((t) => !staticRdfa.has(t)).length
  const jsonldRemoved = [...staticJsonld].filter(
    (t) => !renderedJsonld.has(t),
  ).length
  const microdataRemoved = [...staticMicrodata].filter(
    (t) => !renderedMicrodata.has(t),
  ).length
  const rdfaRemoved = [...staticRdfa].filter((t) => !renderedRdfa.has(t)).length

  const staticOG = staticResult.openGraph
  const renderedOG = renderedResult.openGraph
  const openGraphChanged =
    !staticOG !== !renderedOG ||
    (staticOG && renderedOG
      ? JSON.stringify(staticOG.tags) !== JSON.stringify(renderedOG.tags)
      : false)

  const staticTw = staticResult.twitter
  const renderedTw = renderedResult.twitter
  const twitterChanged =
    !staticTw !== !renderedTw ||
    (staticTw && renderedTw
      ? JSON.stringify(staticTw.tags) !== JSON.stringify(renderedTw.tags)
      : false)

  const comparison = {
    jsonldAdded,
    jsonldRemoved,
    microdataAdded,
    microdataRemoved,
    rdfaAdded,
    rdfaRemoved,
    openGraphChanged: openGraphChanged ?? false,
    twitterChanged: twitterChanged ?? false,
    hasDifferences:
      jsonldAdded > 0 ||
      jsonldRemoved > 0 ||
      microdataAdded > 0 ||
      microdataRemoved > 0 ||
      rdfaAdded > 0 ||
      rdfaRemoved > 0 ||
      (openGraphChanged ?? false) ||
      (twitterChanged ?? false),
  }

  return {
    target,
    static: staticResult,
    rendered: renderedResult,
    comparison,
    timedOut,
  }
}

// ============================================================================
// Social runner
// ============================================================================

/**
 * Fetch social metadata and return as structured result.
 */
export async function fetchSocial(target: string): Promise<SocialResult> {
  const html = await fetchHtmlContent(target)
  const data = extractStructuredData(html)
  const grouped = groupMetatagsByPrefix(data.metatags)
  const pageMetadata = extractPageMetadata(html)

  function buildTagGroup(
    name: string,
    prefix: string,
    tags: Record<string, string>,
  ): SocialTagGroup | null {
    if (Object.keys(tags).length === 0) return null
    return { name, prefix, tags }
  }

  const openGraph = buildTagGroup('Open Graph', 'og:', grouped.openGraph)
  const twitter = buildTagGroup('Twitter Cards', 'twitter:', grouped.twitter)

  const preview = buildSocialPreview(
    grouped.openGraph,
    grouped.twitter,
    pageMetadata,
    target,
  )

  const normalizedTags = normalizeMetatags(data.metatags)
  const issues = sortIssuesBySeverity(
    validateSocialTags(normalizedTags, {
      checkPresence: true,
      checkQuality: true,
    }),
  )

  const ogCount = openGraph ? Object.keys(openGraph.tags).length : 0
  const twCount = twitter ? Object.keys(twitter.tags).length : 0

  return {
    target,
    openGraph,
    twitter,
    preview,
    counts: {
      openGraph: ogCount,
      twitter: twCount,
      total: ogCount + twCount,
    },
    issues,
  }
}

// ============================================================================
// Screen reader runner
// ============================================================================

/**
 * Fetch and analyze how a screen reader would interpret a page.
 */
export async function fetchScreenReader(
  target: string,
  timeoutMs: number = 5000,
): Promise<ScreenReaderResult> {
  return analyzeScreenReaderExperience(target, timeoutMs)
}

// ============================================================================
// Structure runners
// ============================================================================

/**
 * Fetch and analyze page structure from a URL or file path.
 */
export async function fetchStructure(
  target: string,
): Promise<TuiStructureResult> {
  const html = await fetchHtmlContent(target)
  const { document } = parseHTML(html)
  const baseUrl = target.startsWith('http') ? target : null
  const analysis = analyzeStructure(document, baseUrl)
  const axeResult = await runAxeOnStaticHtml(html, { ruleSet: 'structure' })
  analysis.warnings = axeResult.warnings

  return { url: target, analysis, axeResult }
}

export interface FetchStructureJsOptions {
  timeoutMs: number
  allRules?: boolean
}

/**
 * Fetch and compare static vs hydrated structure.
 */
export async function fetchStructureJs(
  target: string,
  options: FetchStructureJsOptions,
): Promise<StructureJsInternalResult> {
  const { timeoutMs, allRules } = options

  const [staticHtml, { html: hydratedHtml, timedOut }] = await Promise.all([
    fetchHtmlContent(target),
    fetchRenderedHtml(target, timeoutMs),
  ])

  const { document: staticDoc } = parseHTML(staticHtml)
  const { document: hydratedDoc } = parseHTML(hydratedHtml)

  const staticAnalysis = analyzeStructure(staticDoc, target)
  const hydratedAnalysis = analyzeStructure(hydratedDoc, target)

  const ruleSet: RuleSet = allRules ? 'all' : 'structure'
  const axeResult = await runAxeOnStaticHtml(hydratedHtml, { ruleSet })
  hydratedAnalysis.warnings = axeResult.warnings

  if (axeResult.incomplete.length > 0) {
    const ruleIds = axeResult.incomplete.map((r) => r.id).join(', ')
    throw new Error(
      `Accessibility test(s) returned inconclusive results in jsdom: ${ruleIds}\n` +
        `These rules require a browser and should be removed from JSDOM_SAFE_RULES in axe-static.ts`,
    )
  }

  const comparison = compareStructures(staticAnalysis, hydratedAnalysis)

  return {
    static: staticAnalysis,
    hydrated: hydratedAnalysis,
    comparison,
    timedOut,
    axeResult,
  }
}

/**
 * Fetch and compare static vs hydrated structure (comparison only).
 */
export async function fetchStructureCompare(
  target: string,
  timeoutMs: number,
): Promise<StructureCompareRunnerResult> {
  const [staticHtml, { html: hydratedHtml, timedOut }] = await Promise.all([
    fetchHtmlContent(target),
    fetchRenderedHtml(target, timeoutMs),
  ])

  const { document: staticDoc } = parseHTML(staticHtml)
  const { document: hydratedDoc } = parseHTML(hydratedHtml)

  const staticAnalysis = analyzeStructure(staticDoc, target)
  const hydratedAnalysis = analyzeStructure(hydratedDoc, target)

  const comparison = compareStructures(staticAnalysis, hydratedAnalysis)

  return { comparison, timedOut }
}

// ============================================================================
// Validate runners
// ============================================================================

/**
 * Run axe-core analysis on a URL.
 */
export async function runAxeAnalysis(
  url: string,
  level: WcagLevel,
  timeoutMs: number,
): Promise<AxeAnalysisResult> {
  return validateAccessibility(url, level, timeoutMs)
}

/**
 * Fetch and validate HTML from URL or file.
 */
export async function fetchValidateHtml(
  target: string,
): Promise<HtmlValidateReport> {
  return validateHtml(target)
}

/**
 * Fetch and validate schema data.
 */
export async function fetchSchemaValidation(
  target: string,
  presetsOption: string | undefined,
): Promise<SchemaValidationResult> {
  return validateStructuredData(target, presetsOption)
}
