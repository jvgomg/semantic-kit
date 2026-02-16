
import { fetchHtmlContent, fetchRenderedHtml , analyzeStructure, compareStructures  } from '@webspecs/core'
import { parseHTML } from 'linkedom'
import type { StructureCompareResult } from './types.js'

/**
 * Fetch and compare static vs hydrated structure (comparison only).
 */
export async function fetchStructureCompare(
  target: string,
  timeoutMs: number,
): Promise<StructureCompareResult> {
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

  // Compare
  const comparison = compareStructures(staticAnalysis, hydratedAnalysis)

  return { comparison, timedOut }
}
