/**
 * A11y Tree View - Accessibility tree snapshot (static HTML).
 */
import { fetchA11y } from '@webspecs/cli/commands/a11y-tree/runner.js'
import type { A11yResult } from '@webspecs/core'
import { A11yTreeViewContent } from './components/A11yTreeViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

const DEFAULT_TIMEOUT_MS = 30000

export const a11yTreeView: ViewDefinition<A11yResult> = {
  id: 'a11y-tree',
  label: 'A11y Tree',
  description:
    'Accessibility tree from static HTML. Shows ARIA roles, names, and structure as screen readers see it.',
  category: 'tool',
  fetch: (url) => fetchA11y(url, DEFAULT_TIMEOUT_MS),
  Component: A11yTreeViewContent,
}

// Self-register
registerView(a11yTreeView)
