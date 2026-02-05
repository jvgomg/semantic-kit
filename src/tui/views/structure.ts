import {
  fetchStructure,
  renderStructureLines,
  type TuiStructureResult,
} from '../../commands/structure.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const structureView: ViewDefinition<TuiStructureResult> = {
  id: 'structure',
  label: 'Structure',
  description:
    'Analyzes the semantic structure of the page including landmarks, headings hierarchy, links, skip links, and language attributes. Helps ensure proper document outline and navigation.',
  fetch: fetchStructure,
  render: renderStructureLines,
}

// Self-register
registerView(structureView)
