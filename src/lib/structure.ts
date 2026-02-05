/**
 * Core structure extraction logic for analyzing page semantic structure.
 * Works with any Document interface (linkedom, browser DOM, Playwright).
 */

// ============================================================================
// Types
// ============================================================================

export interface LandmarkSkeleton {
  /** Semantic role name (navigation, main, banner, etc.) */
  role: string
  /** Number of elements with this landmark type */
  count: number
}

export interface ElementCount {
  /** Element representation (e.g., "<header>" or "<div role=\"navigation\">") */
  element: string
  /** Number of occurrences */
  count: number
}

export interface LandmarkNode {
  /** HTML tag name as it appears in the DOM */
  tag: string
  /** ARIA role attribute if present */
  role?: string
  /** Child landmarks */
  children: LandmarkNode[]
}

export interface HeadingContentStats {
  /** Word count of content under this heading */
  wordCount: number
  /** Number of paragraph elements */
  paragraphs: number
  /** Number of list elements (ul, ol) */
  lists: number
}

export interface HeadingInfo {
  /** Heading level (1-6) */
  level: number
  /** Heading text content */
  text: string
  /** Child headings (for hierarchy) */
  children: HeadingInfo[]
  /** Content statistics for this section */
  content: HeadingContentStats
}

export interface HeadingAnalysis {
  /** Hierarchical outline of headings */
  outline: HeadingInfo[]
  /** Count of each heading level */
  counts: Record<string, number>
  /** Total number of headings */
  total: number
}

export interface LinkDetail {
  /** The full href value */
  href: string
  /** Link text content */
  text: string
  /** Whether target="_blank" is set */
  targetBlank: boolean
  /** Whether rel contains "noopener" */
  noopener: boolean
  /** Whether rel contains "noreferrer" */
  noreferrer: boolean
}

export interface LinkGroup {
  /** The destination (path for internal, domain for external) */
  destination: string
  /** Number of links to this destination */
  count: number
  /** Individual link details */
  links: LinkDetail[]
}

export interface LinkAnalysis {
  internal: {
    count: number
    groups: LinkGroup[]
  }
  external: {
    count: number
    groups: LinkGroup[]
  }
}

export interface SkipLinkInfo {
  /** Link text */
  text: string
  /** Target ID (e.g., "#main-content") */
  target: string
}

export interface LandmarkAnalysis {
  /** All landmark roles with counts and warnings */
  skeleton: LandmarkSkeleton[]
  /** Counts of structural HTML elements */
  elements: ElementCount[]
  /** Nested structure showing actual markup */
  outline: LandmarkNode[]
}

export interface StructureWarning {
  /** Warning identifier */
  id: string
  /** Severity: error for critical issues, warning for recommendations */
  severity: 'error' | 'warning'
  /** Human-readable message */
  message: string
  /** Optional details or fix suggestion */
  details?: string
}

export interface StructureAnalysis {
  /** Page title from <title> element */
  title: string | null
  /** Language from <html lang="..."> */
  language: string | null
  /** Skip links found at top of page */
  skipLinks: SkipLinkInfo[]
  /** Landmark counts and outline */
  landmarks: LandmarkAnalysis
  /** Heading hierarchy and counts */
  headings: HeadingAnalysis
  /** Internal and external links */
  links: LinkAnalysis
  /** Structural warnings detected */
  warnings: StructureWarning[]
}

// ============================================================================
// Constants
// ============================================================================

/** HTML landmark elements */
const LANDMARK_ELEMENTS = [
  'header',
  'nav',
  'main',
  'article',
  'section',
  'aside',
  'footer',
] as const

/** ARIA landmark roles (for detecting role attributes) */
const ARIA_LANDMARK_ROLES = [
  'banner',
  'navigation',
  'main',
  'complementary',
  'contentinfo',
  'search',
  'form',
  'region',
  'article', // Not technically ARIA but used with role attribute
] as const

/** Common skip link target patterns */
const SKIP_LINK_PATTERNS = [
  /^#(main|content|main-content|maincontent|skip|skip-content)$/i,
  /^#(navigation|nav|menu)$/i,
]

// ============================================================================
// Extraction Functions
// ============================================================================

/**
 * Extract page title from <title> element
 */
export function extractTitle(document: Document): string | null {
  const titleEl = document.querySelector('title')
  return titleEl?.textContent?.trim() || null
}

/**
 * Extract language from <html lang="..."> attribute
 */
export function extractLanguage(document: Document): string | null {
  const htmlEl = document.documentElement
  return htmlEl?.getAttribute('lang') || null
}

/**
 * Extract skip links from the beginning of the page
 */
export function extractSkipLinks(document: Document): SkipLinkInfo[] {
  const skipLinks: SkipLinkInfo[] = []
  const allLinks = document.querySelectorAll('a[href^="#"]')

  for (const link of Array.from(allLinks)) {
    const href = link.getAttribute('href')
    if (!href) continue

    const text = link.textContent?.trim() || ''
    const isSkipLink =
      SKIP_LINK_PATTERNS.some((pattern) => pattern.test(href)) ||
      /skip/i.test(text)

    if (isSkipLink) {
      skipLinks.push({ text, target: href })
    }
  }

  return skipLinks
}

/**
 * Check if an element is a landmark
 */
function isLandmarkElement(element: Element): boolean {
  const tag = element.tagName.toLowerCase()
  const role = element.getAttribute('role')

  // Check if it's a landmark HTML element
  if (LANDMARK_ELEMENTS.includes(tag as (typeof LANDMARK_ELEMENTS)[number])) {
    return true
  }

  // Check if it has a landmark role
  if (
    role &&
    ARIA_LANDMARK_ROLES.includes(role as (typeof ARIA_LANDMARK_ROLES)[number])
  ) {
    return true
  }

  return false
}

/**
 * Build landmark outline by walking the DOM tree
 */
function buildLandmarkOutline(element: Element): LandmarkNode[] {
  const landmarks: LandmarkNode[] = []

  for (const child of Array.from(element.children)) {
    if (isLandmarkElement(child)) {
      const tag = child.tagName.toLowerCase()
      const role = child.getAttribute('role')

      const node: LandmarkNode = {
        tag,
        children: buildLandmarkOutline(child),
      }

      // Only include role if it's explicitly set (not implicit from HTML element)
      if (role) {
        node.role = role
      }

      landmarks.push(node)
    } else {
      // Not a landmark, but check children
      landmarks.push(...buildLandmarkOutline(child))
    }
  }

  return landmarks
}

/** Sectioning elements that scope header/footer (removes implicit banner/contentinfo role) */
const SECTIONING_ELEMENTS = [
  'article',
  'aside',
  'main',
  'nav',
  'section',
] as const

/**
 * Check if element is inside sectioning content
 */
function isInsideSectioningContent(element: Element): boolean {
  let parent = element.parentElement
  while (parent) {
    const tag = parent.tagName.toLowerCase()
    if (
      SECTIONING_ELEMENTS.includes(tag as (typeof SECTIONING_ELEMENTS)[number])
    ) {
      return true
    }
    if (tag === 'body') break
    parent = parent.parentElement
  }
  return false
}

/** Order for displaying landmarks */
const LANDMARK_ORDER = [
  'banner',
  'navigation',
  'main',
  'complementary',
  'contentinfo',
  'search',
  'form',
  'region',
  'article',
]

/**
 * Build skeleton with all landmark roles, counts, and warnings
 */
function buildLandmarkSkeleton(document: Document): LandmarkSkeleton[] {
  const body = document.body || document.documentElement
  const counts = new Map<string, number>()

  // Initialize all landmarks with 0
  for (const role of LANDMARK_ORDER) {
    counts.set(role, 0)
  }

  // Count header/footer elements - only top-level ones are landmarks
  const headers = body.querySelectorAll('header')
  const footers = body.querySelectorAll('footer')

  for (const header of Array.from(headers)) {
    if (!isInsideSectioningContent(header)) {
      counts.set('banner', (counts.get('banner') || 0) + 1)
    }
  }

  for (const footer of Array.from(footers)) {
    if (!isInsideSectioningContent(footer)) {
      counts.set('contentinfo', (counts.get('contentinfo') || 0) + 1)
    }
  }

  // Count other HTML landmark elements
  const navs = body.querySelectorAll('nav')
  const mains = body.querySelectorAll('main')
  const articles = body.querySelectorAll('article')
  const asides = body.querySelectorAll('aside')
  const sections = body.querySelectorAll('section')

  counts.set('navigation', (counts.get('navigation') || 0) + navs.length)
  counts.set('main', (counts.get('main') || 0) + mains.length)
  counts.set('article', (counts.get('article') || 0) + articles.length)
  counts.set(
    'complementary',
    (counts.get('complementary') || 0) + asides.length,
  )
  counts.set('region', (counts.get('region') || 0) + sections.length)

  // Count explicit role attributes (on non-semantic elements)
  for (const role of LANDMARK_ORDER) {
    const elementsWithRole = body.querySelectorAll(`[role="${role}"]`)
    for (const el of Array.from(elementsWithRole)) {
      const tag = el.tagName.toLowerCase()
      // Don't double-count semantic elements
      if (role === 'banner' && tag === 'header') continue
      if (role === 'navigation' && tag === 'nav') continue
      if (role === 'main' && tag === 'main') continue
      if (role === 'complementary' && tag === 'aside') continue
      if (role === 'contentinfo' && tag === 'footer') continue
      if (role === 'region' && tag === 'section') continue
      if (role === 'article' && tag === 'article') continue

      counts.set(role, (counts.get(role) || 0) + 1)
    }
  }

  // Build skeleton
  return LANDMARK_ORDER.map((role) => ({
    role,
    count: counts.get(role) || 0,
  }))
}

/**
 * Count structural HTML elements and role attributes
 */
function countElements(document: Document): ElementCount[] {
  const body = document.body || document.documentElement
  const elements: ElementCount[] = []

  // Count HTML elements
  const htmlElements = [
    'header',
    'footer',
    'nav',
    'main',
    'article',
    'section',
    'aside',
  ]
  for (const tag of htmlElements) {
    const count = body.querySelectorAll(tag).length
    if (count > 0) {
      elements.push({ element: `<${tag}>`, count })
    }
  }

  // Count role attributes on non-semantic elements
  const roleElements = body.querySelectorAll('[role]')
  const roleCounts = new Map<string, { tag: string; count: number }>()

  for (const el of Array.from(roleElements)) {
    const tag = el.tagName.toLowerCase()
    const role = el.getAttribute('role')
    if (!role) continue

    // Skip semantic elements with matching implicit roles
    if (tag === 'header' && role === 'banner') continue
    if (tag === 'footer' && role === 'contentinfo') continue
    if (tag === 'nav' && role === 'navigation') continue
    if (tag === 'main' && role === 'main') continue
    if (tag === 'aside' && role === 'complementary') continue
    if (tag === 'section' && role === 'region') continue
    if (tag === 'article' && role === 'article') continue

    const key = `<${tag} role="${role}">`
    const existing = roleCounts.get(key)
    if (existing) {
      existing.count++
    } else {
      roleCounts.set(key, { tag, count: 1 })
    }
  }

  for (const [element, { count }] of roleCounts) {
    elements.push({ element, count })
  }

  // Sort by count descending
  return elements.sort((a, b) => b.count - a.count)
}

/**
 * Extract landmark elements and ARIA landmark roles
 */
export function extractLandmarks(document: Document): LandmarkAnalysis {
  const body = document.body || document.documentElement
  const outline = buildLandmarkOutline(body)
  const skeleton = buildLandmarkSkeleton(document)
  const elements = countElements(document)

  return { skeleton, elements, outline }
}

/**
 * Count words in a string
 */
function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/**
 * Calculate content stats for elements between two positions
 */
function calculateContentStats(
  elements: Element[],
  startIndex: number,
  endIndex: number,
): HeadingContentStats {
  let wordCount = 0
  let paragraphs = 0
  let lists = 0

  for (let i = startIndex; i < endIndex; i++) {
    const el = elements[i]
    const tag = el.tagName.toLowerCase()

    // Count paragraphs
    if (tag === 'p') {
      paragraphs++
      wordCount += countWords(el.textContent || '')
    }
    // Count lists
    else if (tag === 'ul' || tag === 'ol') {
      lists++
      wordCount += countWords(el.textContent || '')
    }
    // Count other text content (divs, spans, etc.)
    else if (
      !['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'style'].includes(tag)
    ) {
      // Only count direct text, not nested headings
      const clone = el.cloneNode(true) as Element
      // Remove nested headings from clone
      clone
        .querySelectorAll('h1, h2, h3, h4, h5, h6')
        .forEach((h) => h.remove())
      wordCount += countWords(clone.textContent || '')
    }
  }

  return { wordCount, paragraphs, lists }
}

/**
 * Build heading hierarchy from flat list of headings with content stats
 */
function buildHeadingHierarchy(
  headings: Array<{
    level: number
    text: string
    content: HeadingContentStats
  }>,
): HeadingInfo[] {
  const root: HeadingInfo[] = []
  const stack: Array<{
    level: number
    node: HeadingInfo
    children: HeadingInfo[]
  }> = []

  for (const { level, text, content } of headings) {
    const node: HeadingInfo = { level, text, children: [], content }

    // Pop stack until we find a parent with lower level
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop()
    }

    if (stack.length === 0) {
      // No parent, add to root
      root.push(node)
    } else {
      // Add as child of current parent
      stack[stack.length - 1].children.push(node)
    }

    // Push current node onto stack
    stack.push({ level, node, children: node.children })
  }

  return root
}

/**
 * Extract headings with hierarchy, counts, and content stats
 */
export function extractHeadings(document: Document): HeadingAnalysis {
  // Get all content elements in document order
  const body = document.body || document.documentElement
  const allElements = Array.from(body.querySelectorAll('*'))

  // Find heading elements and their positions
  const headingData: Array<{
    level: number
    text: string
    index: number
  }> = []
  const counts: Record<string, number> = {}

  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i]
    const tagName = el.tagName.toLowerCase()

    if (/^h[1-6]$/.test(tagName)) {
      const level = parseInt(tagName.charAt(1), 10)
      const text = el.textContent?.trim() || ''

      if (text) {
        headingData.push({ level, text, index: i })
        counts[tagName] = (counts[tagName] || 0) + 1
      }
    }
  }

  // Calculate content stats for each heading
  const headingsWithContent: Array<{
    level: number
    text: string
    content: HeadingContentStats
  }> = []

  for (let i = 0; i < headingData.length; i++) {
    const current = headingData[i]
    const nextIndex =
      i < headingData.length - 1 ? headingData[i + 1].index : allElements.length

    const content = calculateContentStats(
      allElements,
      current.index + 1,
      nextIndex,
    )
    headingsWithContent.push({
      level: current.level,
      text: current.text,
      content,
    })
  }

  return {
    outline: buildHeadingHierarchy(headingsWithContent),
    counts,
    total: headingData.length,
  }
}

/**
 * Classify a link as internal or external based on base URL
 */
function classifyLink(
  href: string,
  baseUrl: string | null,
): 'internal' | 'external' | 'other' {
  // Skip non-http links
  if (
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:') ||
    href.startsWith('#')
  ) {
    return 'other'
  }

  // Relative URLs are internal
  if (!href.startsWith('http://') && !href.startsWith('https://')) {
    return 'internal'
  }

  // Compare hostnames
  if (!baseUrl) return 'external'

  try {
    const linkUrl = new URL(href)
    const base = new URL(baseUrl)
    return linkUrl.hostname === base.hostname ? 'internal' : 'external'
  } catch {
    return 'other'
  }
}

/**
 * Extract link details from an anchor element
 */
function extractLinkDetail(el: Element, href: string): LinkDetail {
  const text = el.textContent?.trim() || ''
  const target = el.getAttribute('target')
  const rel = el.getAttribute('rel') || ''

  return {
    href,
    text: text.length > 50 ? text.slice(0, 50) + '...' : text,
    targetBlank: target === '_blank',
    noopener: rel.toLowerCase().includes('noopener'),
    noreferrer: rel.toLowerCase().includes('noreferrer'),
  }
}

/**
 * Extract and classify links as internal or external
 */
export function extractLinks(
  document: Document,
  baseUrl: string | null,
): LinkAnalysis {
  const linkElements = document.querySelectorAll('a[href]')

  const internalGroups = new Map<string, LinkDetail[]>()
  const externalGroups = new Map<string, LinkDetail[]>()

  for (const el of Array.from(linkElements)) {
    const href = el.getAttribute('href')
    if (!href) continue

    const classification = classifyLink(href, baseUrl)
    const detail = extractLinkDetail(el, href)

    if (classification === 'internal') {
      // Normalize internal URLs (remove query strings for grouping)
      let path = href
      try {
        if (href.startsWith('http')) {
          path = new URL(href).pathname
        } else {
          path = href.split('?')[0].split('#')[0]
        }
      } catch {
        // Keep original href if parsing fails
      }
      const existing = internalGroups.get(path) || []
      existing.push(detail)
      internalGroups.set(path, existing)
    } else if (classification === 'external') {
      try {
        const domain = new URL(href).hostname
        const existing = externalGroups.get(domain) || []
        existing.push(detail)
        externalGroups.set(domain, existing)
      } catch {
        // Skip malformed URLs
      }
    }
  }

  // Convert maps to sorted arrays
  const internalGroupList: LinkGroup[] = Array.from(internalGroups.entries())
    .map(([destination, links]) => ({
      destination,
      count: links.length,
      links,
    }))
    .sort((a, b) => b.count - a.count)

  const externalGroupList: LinkGroup[] = Array.from(externalGroups.entries())
    .map(([destination, links]) => ({
      destination,
      count: links.length,
      links,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    internal: {
      count: internalGroupList.reduce((sum, g) => sum + g.count, 0),
      groups: internalGroupList,
    },
    external: {
      count: externalGroupList.reduce((sum, g) => sum + g.count, 0),
      groups: externalGroupList,
    },
  }
}

/**
 * Extract complete page structure analysis.
 *
 * Note: The `warnings` array is populated separately by running axe-core
 * via `runAxeOnStaticHtml()` in the command layer. This keeps the core
 * analysis synchronous while warnings come from an authoritative source.
 */
export function analyzeStructure(
  document: Document,
  baseUrl: string | null,
): StructureAnalysis {
  return {
    title: extractTitle(document),
    language: extractLanguage(document),
    skipLinks: extractSkipLinks(document),
    landmarks: extractLandmarks(document),
    headings: extractHeadings(document),
    links: extractLinks(document, baseUrl),
    warnings: [], // Populated by axe-core in command layer
  }
}

// ============================================================================
// Comparison Types
// ============================================================================

export interface LandmarkDiff {
  role: string
  staticCount: number
  hydratedCount: number
  change: number
}

export interface HeadingDiff {
  level: number
  text: string
  status: 'added' | 'removed'
}

export interface LinkDiff {
  internalAdded: number
  internalRemoved: number
  externalAdded: number
  externalRemoved: number
  newInternalDestinations: string[]
  newExternalDomains: string[]
}

export interface MetadataDiff {
  title: { static: string | null; hydrated: string | null } | null
  language: { static: string | null; hydrated: string | null } | null
}

export interface StructureComparisonSummary {
  staticLandmarks: number
  hydratedLandmarks: number
  staticHeadings: number
  hydratedHeadings: number
  staticLinks: number
  hydratedLinks: number
}

export interface StructureComparison {
  /** High-level summary counts */
  summary: StructureComparisonSummary
  /** Whether there are any structural differences */
  hasDifferences: boolean
  /** Metadata changes (title, language) */
  metadata: MetadataDiff
  /** Landmarks that changed between static and hydrated */
  landmarks: LandmarkDiff[]
  /** Headings added or removed by JavaScript */
  headings: HeadingDiff[]
  /** Link changes */
  links: LinkDiff
}

// ============================================================================
// Comparison Functions
// ============================================================================

/**
 * Flatten heading outline to a list of text strings for comparison
 */
function flattenHeadings(
  outline: HeadingInfo[],
): Array<{ level: number; text: string }> {
  const result: Array<{ level: number; text: string }> = []

  function walk(headings: HeadingInfo[]) {
    for (const h of headings) {
      result.push({ level: h.level, text: h.text })
      walk(h.children)
    }
  }

  walk(outline)
  return result
}

/**
 * Compare two StructureAnalysis objects and return detailed differences
 */
export function compareStructures(
  staticAnalysis: StructureAnalysis,
  hydratedAnalysis: StructureAnalysis,
): StructureComparison {
  // Calculate summary counts
  const staticLandmarks = staticAnalysis.landmarks.skeleton.reduce(
    (sum, l) => sum + l.count,
    0,
  )
  const hydratedLandmarks = hydratedAnalysis.landmarks.skeleton.reduce(
    (sum, l) => sum + l.count,
    0,
  )
  const staticHeadings = staticAnalysis.headings.total
  const hydratedHeadings = hydratedAnalysis.headings.total
  const staticLinks =
    staticAnalysis.links.internal.count + staticAnalysis.links.external.count
  const hydratedLinks =
    hydratedAnalysis.links.internal.count +
    hydratedAnalysis.links.external.count

  // Compare metadata
  const metadata: MetadataDiff = {
    title:
      staticAnalysis.title !== hydratedAnalysis.title
        ? { static: staticAnalysis.title, hydrated: hydratedAnalysis.title }
        : null,
    language:
      staticAnalysis.language !== hydratedAnalysis.language
        ? {
            static: staticAnalysis.language,
            hydrated: hydratedAnalysis.language,
          }
        : null,
  }

  // Compare landmarks
  const landmarks: LandmarkDiff[] = []
  for (const hydrated of hydratedAnalysis.landmarks.skeleton) {
    const staticLandmark = staticAnalysis.landmarks.skeleton.find(
      (s) => s.role === hydrated.role,
    )
    const staticCount = staticLandmark?.count || 0
    const change = hydrated.count - staticCount

    if (change !== 0) {
      landmarks.push({
        role: hydrated.role,
        staticCount,
        hydratedCount: hydrated.count,
        change,
      })
    }
  }

  // Compare headings
  const staticHeadingList = flattenHeadings(staticAnalysis.headings.outline)
  const hydratedHeadingList = flattenHeadings(hydratedAnalysis.headings.outline)

  const staticHeadingTexts = new Set(
    staticHeadingList.map((h) => `${h.level}:${h.text}`),
  )
  const hydratedHeadingTexts = new Set(
    hydratedHeadingList.map((h) => `${h.level}:${h.text}`),
  )

  const headings: HeadingDiff[] = []

  // Find added headings
  for (const h of hydratedHeadingList) {
    const key = `${h.level}:${h.text}`
    if (!staticHeadingTexts.has(key)) {
      headings.push({ level: h.level, text: h.text, status: 'added' })
    }
  }

  // Find removed headings
  for (const h of staticHeadingList) {
    const key = `${h.level}:${h.text}`
    if (!hydratedHeadingTexts.has(key)) {
      headings.push({ level: h.level, text: h.text, status: 'removed' })
    }
  }

  // Compare links
  const staticInternalDests = new Set(
    staticAnalysis.links.internal.groups.map((g) => g.destination),
  )
  const hydratedInternalDests = new Set(
    hydratedAnalysis.links.internal.groups.map((g) => g.destination),
  )
  const staticExternalDomains = new Set(
    staticAnalysis.links.external.groups.map((g) => g.destination),
  )
  const hydratedExternalDomains = new Set(
    hydratedAnalysis.links.external.groups.map((g) => g.destination),
  )

  const newInternalDestinations = [...hydratedInternalDests].filter(
    (d) => !staticInternalDests.has(d),
  )
  const newExternalDomains = [...hydratedExternalDomains].filter(
    (d) => !staticExternalDomains.has(d),
  )

  const links: LinkDiff = {
    internalAdded: Math.max(
      0,
      hydratedAnalysis.links.internal.count -
        staticAnalysis.links.internal.count,
    ),
    internalRemoved: Math.max(
      0,
      staticAnalysis.links.internal.count -
        hydratedAnalysis.links.internal.count,
    ),
    externalAdded: Math.max(
      0,
      hydratedAnalysis.links.external.count -
        staticAnalysis.links.external.count,
    ),
    externalRemoved: Math.max(
      0,
      staticAnalysis.links.external.count -
        hydratedAnalysis.links.external.count,
    ),
    newInternalDestinations,
    newExternalDomains,
  }

  // Determine if there are any differences
  const hasDifferences =
    staticLandmarks !== hydratedLandmarks ||
    staticHeadings !== hydratedHeadings ||
    Math.abs(staticLinks - hydratedLinks) > 0 ||
    metadata.title !== null ||
    metadata.language !== null

  return {
    summary: {
      staticLandmarks,
      hydratedLandmarks,
      staticHeadings,
      hydratedHeadings,
      staticLinks,
      hydratedLinks,
    },
    hasDifferences,
    metadata,
    landmarks,
    headings,
    links,
  }
}
