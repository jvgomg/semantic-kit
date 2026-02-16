
import { runAxeOnStaticHtml, fetchHtmlContent , analyzeStructure  } from '@webspecs/core'
import { parseHTML } from 'linkedom'
import type { TuiStructureResult } from './types.js'

/**
 * Fetch and analyze page structure from a URL or file path.
 * This is the main entry point for programmatic use.
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
