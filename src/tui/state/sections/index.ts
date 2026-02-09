/**
 * Section State Module
 *
 * Manages expandable section state for tool views in the TUI.
 * Uses SectionRegistryContext for self-registering sections.
 *
 * @example
 * // In a ViewSections component:
 * import { SectionRegistryProvider, useViewSections } from './state/sections/index.js'
 *
 * function ViewSections({ children }) {
 *   return (
 *     <SectionRegistryProvider>
 *       <ViewSectionsInner>{children}</ViewSectionsInner>
 *     </SectionRegistryProvider>
 *   )
 * }
 *
 * function ViewSectionsInner({ children }) {
 *   const {
 *     sectionCount,
 *     selectedSectionId,
 *     selectNext,
 *     selectPrev,
 *     toggleSelected,
 *   } = useViewSections()
 *
 *   // Handle keyboard navigation...
 * }
 *
 * @example
 * // In a Section component:
 * import { useSection } from './state/sections/index.js'
 * import { SectionPriority } from './components/view-display/priorities.js'
 *
 * function Section({ id, defaultExpanded, priority, children }) {
 *   const { isExpanded, isSelected, toggle } = useSection(id, defaultExpanded, priority)
 *
 *   return (
 *     <Box>
 *       <Header selected={isSelected} onClick={toggle} />
 *       {isExpanded && children}
 *     </Box>
 *   )
 * }
 */

// Types
export type { SectionsState } from './types.js'
export { DEFAULT_SECTIONS_STATE } from './types.js'

// Context
export {
  SectionRegistryProvider,
  useSectionRegistry,
  useSectionRegistration,
  type SectionRegistration,
} from './context.js'

// Atoms
export {
  sectionsAtomFamily,
  activeSectionsAtom,
  sectionExpandedAtom,
} from './atoms.js'

// Actions
export {
  // Navigation
  selectNextSectionAtom,
  selectPrevSectionAtom,
  // Expand/Collapse
  toggleSectionAtom,
  toggleSelectedSectionAtom,
  expandSectionAtom,
  expandSelectedSectionAtom,
  collapseSectionAtom,
  collapseSelectedSectionAtom,
  expandAllSectionsAtom,
  collapseAllSectionsAtom,
} from './actions.js'

// Hooks
export { useViewSections, useSection } from './hooks.js'
