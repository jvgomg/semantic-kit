/**
 * Views module - imports all views to trigger self-registration.
 * Import order determines menu order.
 */

// Import views to trigger registration (order determines menu order)
// Lenses
import './ai-view.js'
import './reader-view.js'
import './google-view.js'
import './social-view.js'
import './screen-reader-view.js'
// Tools
import './structure.js'

// Re-export registry functions
export { getGroupedMenuItems, getViewDefinition, getAllViews } from './registry.js'

// Re-export types
export type { ViewDefinition, ViewComponentProps, ViewCategory } from './types.js'
