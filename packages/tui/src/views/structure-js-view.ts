/**
 * Structure:js View - Shows page structure after JavaScript rendering.
 */
import {
  fetchStructureJs,
  type StructureJsInternalResult,
} from '@webspecs/cli/commands/structure/index.js'
import { StructureJsViewContent } from './components/StructureJsViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

const DEFAULT_TIMEOUT_MS = 30000

export const structureJsView: ViewDefinition<StructureJsInternalResult> = {
  id: 'structure-js',
  label: 'Structure:js',
  description:
    'Analyzes page structure after JavaScript rendering. Shows landmarks, headings, and links as modern bots see them.',
  category: 'tool',
  fetch: (url) =>
    fetchStructureJs(url, { timeoutMs: DEFAULT_TIMEOUT_MS, allRules: false }),
  Component: StructureJsViewContent,
}

// Self-register
registerView(structureJsView)
