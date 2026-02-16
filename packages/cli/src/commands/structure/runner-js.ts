import {
  analyzeStructure,
  compareStructures,
  fetchHtmlContent,
  fetchRenderedHtml,
  runAxeOnStaticHtml,
  parseHTML,
  type RuleSet,
} from '@webspecs/core'
import type {
  FetchStructureJsOptions,
  StructureJsInternalResult,
} from './types.js'

/**
 * Fetch and compare static vs hydrated structure.
 */
export async function fetchStructureJs(
  target: string,
  options: FetchStructureJsOptions,
): Promise<StructureJsInternalResult> {
  const { timeoutMs, allRules } = options

  // Fetch both static and hydrated HTML in parallel
  const [staticHtml, { html: hydratedHtml, timedOut }] = await Promise.all([
    fetchHtmlContent(target),
    fetchRenderedHtml(target, timeoutMs),
  ])

  // Parse both
  const { document: staticDoc } = parseHTML(staticHtml)
  const { document: hydratedDoc } = parseHTML(hydratedHtml)

  // Analyze both
  const staticAnalysis = analyzeStructure(staticDoc, target)
  const hydratedAnalysis = analyzeStructure(hydratedDoc, target)

  // Determine which rule set to use
  const ruleSet: RuleSet = allRules ? 'all' : 'structure'

  // Run axe-core on hydrated HTML for authoritative warnings
  const axeResult = await runAxeOnStaticHtml(hydratedHtml, { ruleSet })
  hydratedAnalysis.warnings = axeResult.warnings

  // Fail if any tests returned inconclusive
  if (axeResult.incomplete.length > 0) {
    const ruleIds = axeResult.incomplete.map((r) => r.id).join(', ')
    throw new Error(
      `Accessibility test(s) returned inconclusive results in jsdom: ${ruleIds}\n` +
        `These rules require a browser and should be removed from JSDOM_SAFE_RULES in axe-static.ts`,
    )
  }

  // Compare
  const comparison = compareStructures(staticAnalysis, hydratedAnalysis)

  return {
    static: staticAnalysis,
    hydrated: hydratedAnalysis,
    comparison,
    timedOut,
    axeResult,
  }
}
