/**
 * Type definitions for section state management.
 *
 * SectionsState only stores user overrides (expanded states).
 * Section ordering and defaults come from the SectionRegistryContext.
 */

/**
 * State for section-specific data within a view.
 * Only stores user overrides for expanded state.
 */
export interface SectionsState {
  /** Section expanded state overrides: sectionId -> boolean */
  expanded: Record<string, boolean>
}

/**
 * Default state for a new view's sections.
 */
export const DEFAULT_SECTIONS_STATE: SectionsState = {
  expanded: {},
}
