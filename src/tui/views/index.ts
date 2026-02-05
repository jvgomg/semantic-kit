// Import all views to trigger self-registration
// Order of imports determines menu order
import './structure.js'
import './schema.js'
import './ai-view.js'
import './bot.js'
import './accessibility.js'
import './validation.js'

// Re-export registry functions
export { getMenuItems, getView, getAllViews } from './registry.js'
export type { ViewDefinition } from './types.js'
