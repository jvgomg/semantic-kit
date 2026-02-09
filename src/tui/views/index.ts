/**
 * Views module - imports all views to trigger self-registration.
 * Import order determines menu order.
 */

// Import views to trigger registration (order determines menu order)
import './ai-view.js'
import './structure.js'

// Re-export registry functions
export { getMenuItems, getViewDefinition, getAllViews } from './registry.js'

// Re-export view atoms
export { viewAtomFamily, activeViewAtom, type View } from './atoms.js'

// Re-export types
export type { ViewDefinition, ViewComponentProps } from './types.js'
