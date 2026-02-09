/**
 * Write-only action atoms for section state management.
 *
 * All actions automatically use the active view from activeViewIdAtom,
 * so callers don't need to pass viewId.
 *
 * Navigation actions receive sectionCount from the caller (via context).
 */
import { atom } from 'jotai'
import { activeViewIdAtom } from '../tool-navigation.js'
import { navigateSelectionAtom } from '../view/actions.js'
import { sectionsAtomFamily } from './atoms.js'

// ============================================================================
// Navigation Actions
// ============================================================================

/**
 * Select the next section (wraps around to first).
 * Delegates to view primitive's navigateSelectionAtom.
 * Receives sectionCount from caller.
 */
export const selectNextSectionAtom = atom(
  null,
  (_get, set, sectionCount: number) => {
    if (sectionCount === 0) return
    set(navigateSelectionAtom, { delta: 1, itemCount: sectionCount })
  },
)

/**
 * Select the previous section (wraps around to last).
 * Delegates to view primitive's navigateSelectionAtom.
 * Receives sectionCount from caller.
 */
export const selectPrevSectionAtom = atom(
  null,
  (_get, set, sectionCount: number) => {
    if (sectionCount === 0) return
    set(navigateSelectionAtom, { delta: -1, itemCount: sectionCount })
  },
)

// ============================================================================
// Expand/Collapse Actions
// ============================================================================

/**
 * Toggle a section's expanded state.
 * Receives sectionId and its current default from caller.
 */
export const toggleSectionAtom = atom(
  null,
  (get, set, payload: { sectionId: string; defaultExpanded: boolean }) => {
    const viewId = get(activeViewIdAtom)
    if (!viewId) return

    const { sectionId, defaultExpanded } = payload
    const sectionsAtom = sectionsAtomFamily(viewId)
    const current = get(sectionsAtom)

    // Get current state: use override if exists, otherwise use default
    const currentExpanded = current.expanded[sectionId] ?? defaultExpanded

    set(sectionsAtom, {
      ...current,
      expanded: {
        ...current.expanded,
        [sectionId]: !currentExpanded,
      },
    })
  },
)

/**
 * Toggle the currently selected section.
 * Receives section info from caller (via context).
 */
export const toggleSelectedSectionAtom = atom(
  null,
  (
    _get,
    set,
    payload: { sectionId: string; defaultExpanded: boolean } | null,
  ) => {
    if (!payload) return
    set(toggleSectionAtom, payload)
  },
)

/**
 * Expand a section.
 */
export const expandSectionAtom = atom(null, (get, set, sectionId: string) => {
  const viewId = get(activeViewIdAtom)
  if (!viewId) return

  const sectionsAtom = sectionsAtomFamily(viewId)
  const current = get(sectionsAtom)

  // Only update if not already expanded (or no override yet)
  if (current.expanded[sectionId] !== true) {
    set(sectionsAtom, {
      ...current,
      expanded: {
        ...current.expanded,
        [sectionId]: true,
      },
    })
  }
})

/**
 * Expand the currently selected section.
 */
export const expandSelectedSectionAtom = atom(
  null,
  (_get, set, sectionId: string | null) => {
    if (!sectionId) return
    set(expandSectionAtom, sectionId)
  },
)

/**
 * Collapse a section.
 */
export const collapseSectionAtom = atom(null, (get, set, sectionId: string) => {
  const viewId = get(activeViewIdAtom)
  if (!viewId) return

  const sectionsAtom = sectionsAtomFamily(viewId)
  const current = get(sectionsAtom)

  // Only update if not already collapsed (or no override yet)
  if (current.expanded[sectionId] !== false) {
    set(sectionsAtom, {
      ...current,
      expanded: {
        ...current.expanded,
        [sectionId]: false,
      },
    })
  }
})

/**
 * Collapse the currently selected section.
 */
export const collapseSelectedSectionAtom = atom(
  null,
  (_get, set, sectionId: string | null) => {
    if (!sectionId) return
    set(collapseSectionAtom, sectionId)
  },
)

/**
 * Expand all sections.
 * Receives section IDs from caller (via context).
 */
export const expandAllSectionsAtom = atom(
  null,
  (get, set, sectionIds: string[]) => {
    const viewId = get(activeViewIdAtom)
    if (!viewId) return

    if (sectionIds.length === 0) return

    const sectionsAtom = sectionsAtomFamily(viewId)
    const current = get(sectionsAtom)

    const newExpanded = { ...current.expanded }
    for (const sectionId of sectionIds) {
      newExpanded[sectionId] = true
    }

    set(sectionsAtom, {
      ...current,
      expanded: newExpanded,
    })
  },
)

/**
 * Collapse all sections.
 * Receives section IDs from caller (via context).
 */
export const collapseAllSectionsAtom = atom(
  null,
  (get, set, sectionIds: string[]) => {
    const viewId = get(activeViewIdAtom)
    if (!viewId) return

    if (sectionIds.length === 0) return

    const sectionsAtom = sectionsAtomFamily(viewId)
    const current = get(sectionsAtom)

    const newExpanded = { ...current.expanded }
    for (const sectionId of sectionIds) {
      newExpanded[sectionId] = false
    }

    set(sectionsAtom, {
      ...current,
      expanded: newExpanded,
    })
  },
)
