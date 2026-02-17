/**
 * Structure View - Shows page structure (landmarks, headings, links).
 */
import { fetchStructure } from '@webspecs/core'
import type { TuiStructureResult } from '@webspecs/core'
import { StructureViewContent } from './components/StructureViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const structureView: ViewDefinition<TuiStructureResult> = {
  id: 'structure',
  label: 'Structure',
  description:
    'Analyzes page structure including landmarks, headings hierarchy, and navigation links.',
  category: 'tool',
  fetch: fetchStructure,
  Component: StructureViewContent,
}

// Self-register
registerView(structureView)
