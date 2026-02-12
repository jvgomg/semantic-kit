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
import './readability-view.js'
import './readability-js-view.js'
import './readability-compare-view.js'
import './structure.js'
import './structure-js-view.js'
import './structure-compare-view.js'
import './a11y-tree-view.js'
import './a11y-tree-js-view.js'
import './a11y-tree-compare-view.js'
import './schema-view.js'
import './schema-js-view.js'
import './schema-compare-view.js'
// Validation
import './validate-html-view.js'
import './validate-schema-view.js'
import './validate-a11y-view.js'

// Re-export registry functions
export { getGroupedMenuItems, getViewDefinition, getAllViews } from './registry.js'

// Re-export types
export type { ViewDefinition, ViewComponentProps, ViewCategory } from './types.js'
