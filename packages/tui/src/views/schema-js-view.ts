/**
 * Schema:js View - Inspect structured data after JavaScript rendering.
 */
import { fetchSchemaJs } from '@webspecs/core'
import type { SchemaJsResult } from '@webspecs/core'
import { SchemaJsViewContent } from './components/SchemaJsViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

const DEFAULT_TIMEOUT_MS = 30000

export const schemaJsView: ViewDefinition<SchemaJsResult> = {
  id: 'schema-js',
  label: 'Schema:js',
  description:
    'Inspect structured data after JavaScript rendering. Shows what bots with JS support see.',
  category: 'tool',
  fetch: (url) => fetchSchemaJs(url, { timeoutMs: DEFAULT_TIMEOUT_MS }),
  Component: SchemaJsViewContent,
}

// Self-register
registerView(schemaJsView)
