/**
 * Schema:compare View - Compare static vs JS-rendered structured data.
 */
import { fetchSchemaCompare } from '@webspecs/cli/commands/schema/index.js'
import type { SchemaCompareResult } from '@webspecs/core'
import { SchemaCompareViewContent } from './components/SchemaCompareViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

const DEFAULT_TIMEOUT_MS = 30000

export const schemaCompareView: ViewDefinition<SchemaCompareResult> = {
  id: 'schema-compare',
  label: 'Schema:compare',
  description:
    'Compare structured data between static HTML and JS-rendered page. Shows what schemas require JavaScript.',
  category: 'tool',
  fetch: (url) => fetchSchemaCompare(url, { timeoutMs: DEFAULT_TIMEOUT_MS }),
  Component: SchemaCompareViewContent,
}

// Self-register
registerView(schemaCompareView)
