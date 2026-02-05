import { fetchBot, renderBotLines } from '../../commands/bot.js'
import type { BotResult } from '../../lib/results.js'
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

export const botView: ViewDefinition<BotResult> = {
  id: 'bot',
  label: 'Crawler Bot',
  description:
    'Compares static HTML content vs JavaScript-rendered content. Useful for understanding what search engine crawlers see before and after JavaScript execution.',
  fetch: fetchBot,
  render: renderBotLines,
}

// Self-register
registerView(botView)
