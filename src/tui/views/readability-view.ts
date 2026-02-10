/**
 * Readability View - Raw Readability extraction with full metrics.
 */
import { fetchReadability } from '../../commands/readability/index.js'
import type { ReadabilityUtilityResult } from '../../lib/results.js'
import { ReadabilityViewContent } from './components/ReadabilityViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const readabilityView: ViewDefinition<ReadabilityUtilityResult> = {
  id: 'readability',
  label: 'Readability',
  description:
    'Raw Readability extraction with full metrics including link density.',
  category: 'tool',
  fetch: fetchReadability,
  Component: ReadabilityViewContent,
}

// Self-register
registerView(readabilityView)
