/**
 * Schema View - Inspect structured data on a page.
 */
import { fetchSchema } from '@webspecs/core'
import type { SchemaResult } from '@webspecs/core'
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
