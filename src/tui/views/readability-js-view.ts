/**
 * Readability:js View - Readability extraction after JavaScript rendering.
 */
import { fetchReadabilityJs } from '../../commands/readability/runner-js.js'
import type { ReadabilityJsResult } from '../../lib/results.js'
import { ReadabilityJsViewContent } from './components/ReadabilityJsViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

const DEFAULT_TIMEOUT_MS = 30000

export const readabilityJsView: ViewDefinition<ReadabilityJsResult> = {
  id: 'readability-js',
  label: 'Readability:js',
  description:
    'Readability extraction after JavaScript rendering. Shows content as bots with JS support see it.',
  category: 'tool',
  fetch: (url) => fetchReadabilityJs(url, { timeoutMs: DEFAULT_TIMEOUT_MS }),
  Component: ReadabilityJsViewContent,
}

// Self-register
registerView(readabilityJsView)
