/**
 * Validate Schema View - Shows structured data validation results.
 */
import { fetchSchemaValidation } from '@webspecs/cli/commands/validate-schema/index.js'
import type { SchemaValidationResult } from '@webspecs/cli/commands/validate-schema/types.js'
import { ValidateSchemaViewContent } from './components/ValidateSchemaViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const validateSchemaView: ViewDefinition<SchemaValidationResult> = {
  id: 'validate-schema',
  label: 'Schema Validate',
  description:
    'Validates structured data (JSON-LD, Open Graph, Twitter Cards) against platform requirements.',
  category: 'tool',
  fetch: (url: string) => fetchSchemaValidation(url, undefined),
  Component: ValidateSchemaViewContent,
}

// Self-register
registerView(validateSchemaView)
