import { fetchSchema, renderSchemaLines } from '../../commands/schema.js'
import type { SchemaResult } from '../../lib/results.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const schemaView: ViewDefinition<SchemaResult> = {
  id: 'schema',
  label: 'Schema',
  description:
    'Extracts structured data from the page including JSON-LD, Microdata, RDFa, Open Graph, and Twitter Cards. Essential for SEO and rich search results.',
  fetch: fetchSchema,
  render: renderSchemaLines,
}

// Self-register
registerView(schemaView)
