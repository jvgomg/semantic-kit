/**
 * A11y Tree:js View - Accessibility tree snapshot after JavaScript rendering.
 */
import { fetchA11yJs } from '@webspecs/cli/commands/a11y-tree/runner-js.js'
import type { A11yResult } from '@webspecs/core'
import { A11yTreeViewContent } from './components/A11yTreeViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

const DEFAULT_TIMEOUT_MS = 30000

export const a11yTreeJsView: ViewDefinition<A11yResult> = {
  id: 'a11y-tree-js',
  label: 'A11y Tree:js',
  description:
    'Accessibility tree after JavaScript rendering. Shows how dynamic content appears to assistive technologies.',
  category: 'tool',
  fetch: (url) => fetchA11yJs(url, DEFAULT_TIMEOUT_MS),
  Component: A11yTreeViewContent,
}

// Self-register
registerView(a11yTreeJsView)
