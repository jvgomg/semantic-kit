/**
 * Readability:compare View - Compare static vs JS-rendered Readability extraction.
 */
import { fetchReadabilityCompare } from '@webspecs/cli/commands/readability/index.js'
import type { ReadabilityCompareResult } from '@webspecs/cli/commands/readability/types.js'
import { ReadabilityCompareViewContent } from './components/ReadabilityCompareViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const readabilityCompareView: ViewDefinition<ReadabilityCompareResult> = {
  id: 'readability-compare',
  label: 'Readability:compare',
  description:
    'Compare Readability extraction between static HTML and JS-rendered page. Shows what content requires JavaScript.',
  category: 'tool',
  fetch: fetchReadabilityCompare,
  Component: ReadabilityCompareViewContent,
}

// Self-register
registerView(readabilityCompareView)
