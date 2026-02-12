/**
 * A11y Tree:compare View - Compare accessibility trees between static and JS-rendered HTML.
 */
import { fetchA11yCompare } from '../../commands/a11y-tree/runner-compare.js'
import type { A11yCompareResult } from '../../lib/results.js'
import { A11yTreeCompareViewContent } from './components/A11yTreeCompareViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

const DEFAULT_TIMEOUT_MS = 30000

export const a11yTreeCompareView: ViewDefinition<A11yCompareResult> = {
  id: 'a11y-tree-compare',
  label: 'A11y Tree:compare',
  description:
    'Compare accessibility trees between static HTML and JS-rendered page. Shows what accessibility changes when JavaScript runs.',
  category: 'tool',
  fetch: (url) => fetchA11yCompare(url, DEFAULT_TIMEOUT_MS),
  Component: A11yTreeCompareViewContent,
}

// Self-register
registerView(a11yTreeCompareView)
