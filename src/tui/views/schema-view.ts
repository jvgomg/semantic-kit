/**
 * Schema View - Inspect structured data on a page.
 */
import { fetchSchema } from '../../commands/schema/index.js'
import type { SchemaResult } from '../../lib/results.js'
import { SchemaViewContent } from './components/SchemaViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const schemaView: ViewDefinition<SchemaResult> = {
  id: 'schema',
  label: 'Schema',
  description:
    'Inspect structured data (JSON-LD, Microdata, RDFa, Open Graph, Twitter Cards) on a page.',
  category: 'tool',
  fetch: fetchSchema,
  Component: SchemaViewContent,
}

// Self-register
registerView(schemaView)
