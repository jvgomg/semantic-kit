/**
 * View UI State Module
 *
 * Provides generic UI state primitives for views in the TUI.
 * This is the foundation layer that sections and other view types build on.
 *
 * @example
 * // For custom views that need selection/focus:
 * import { useViewUI } from './state/view/index.js'
 *
 * function MyListView({ items }) {
 *   const {
 *     selectedIndex,
 *     focusDepth,
 *     navigateSelection,
 *     increaseFocusDepth,
 *   } = useViewUI()
 *
 *   // Handle keyboard navigation...
 * }
 */

// Types
export type { ViewUIState } from './types.js'
export { DEFAULT_VIEW_UI_STATE } from './types.js'

// Atoms
export {
  viewUIStateAtomFamily,
  activeViewUIStateAtom,
  activeFocusDepthAtom,
  activeSelectedIndexAtom,
} from './atoms.js'

// Actions
export {
  navigateSelectionAtom,
  setSelectedIndexAtom,
  increaseFocusDepthAtom,
  decreaseFocusDepthAtom,
  setFocusDepthAtom,
} from './actions.js'

// Hooks
export { useViewUI } from './hooks.js'
