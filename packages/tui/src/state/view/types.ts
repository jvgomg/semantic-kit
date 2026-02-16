/**
 * Type definitions for view UI state management.
 *
 * ViewUIState provides generic UI state that any view might need,
 * including selection and focus depth.
 */

/**
 * Generic UI state for a view.
 * This is the primitive layer that sections and other view types build on.
 */
export interface ViewUIState {
  /** Focus depth (0 = top level, 1+ = nested content) */
  focusDepth: number
  /** Currently selected index (-1 = none selected) */
  selectedIndex: number
}

/**
 * Default state for a new view.
 */
export const DEFAULT_VIEW_UI_STATE: ViewUIState = {
  focusDepth: 0,
  selectedIndex: 0,
}
