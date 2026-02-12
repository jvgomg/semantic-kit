/**
 * Structure:compare View - Compare static vs JS-rendered page structure.
 */
import {
  fetchStructureCompare,
  type StructureCompareResult,
} from '../../commands/structure/index.js'
import { StructureCompareViewContent } from './components/StructureCompareViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

const DEFAULT_TIMEOUT_MS = 30000

export const structureCompareView: ViewDefinition<StructureCompareResult> = {
  id: 'structure-compare',
  label: 'Structure:compare',
  description:
    'Compare page structure between static HTML and JS-rendered page. Shows what structural elements require JavaScript.',
  category: 'tool',
  fetch: (url) => fetchStructureCompare(url, DEFAULT_TIMEOUT_MS),
  Component: StructureCompareViewContent,
}

// Self-register
registerView(structureCompareView)
