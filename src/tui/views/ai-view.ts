/**
 * AI View - Shows how AI crawlers see the page content.
 */
import { fetchAi } from '../../commands/ai/index.js'
import type { AiResult } from '../../lib/results.js'
import { AiViewContent } from './components/AiViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const aiView: ViewDefinition<AiResult> = {
  id: 'ai-view',
  label: 'AI Bot',
  description:
    'Shows how AI crawlers see your page content. Extracts the main content as markdown.',
  category: 'lens',
  fetch: fetchAi,
  Component: AiViewContent,
}

// Self-register
registerView(aiView)
