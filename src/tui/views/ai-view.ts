import { fetchAi, renderAiLines } from '../../commands/ai.js'
import type { AiResult } from '../../lib/results.js'
import { AiViewContent } from './components/AiViewContent.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const aiView: ViewDefinition<AiResult> = {
  id: 'ai-view',
  label: 'AI Bot',
  description:
    'Shows how AI crawlers see your page content. Extracts the main content as markdown, similar to how LLMs and AI assistants process web pages.',
  fetch: fetchAi,
  render: renderAiLines,
  Component: AiViewContent,
}

// Self-register
registerView(aiView)
