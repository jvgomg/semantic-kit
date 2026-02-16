/**
 * React hooks for section state management.
 *
 * Provides convenient hooks for components to interact with section state.
 * Uses SectionRegistryContext for section ordering and selection.
 */
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { SectionPriority } from '../../components/view-display/priorities.js'
import { activeViewIdAtom } from '../tool-navigation.js'
import { activeFocusDepthAtom, activeSelectedIndexAtom } from '../view/atoms.js'
import {
  collapseAllSectionsAtom,
  collapseSelectedSectionAtom,
  expandAllSectionsAtom,
  expandSelectedSectionAtom,
  selectNextSectionAtom,
  selectPrevSectionAtom,
  toggleSelectedSectionAtom,
} from './actions.js'
import { sectionExpandedAtom } from './atoms.js'
import { useSectionRegistration, useSectionRegistry } from './context.js'

// ============================================================================
// Static Fallback Atoms (for when no view is active)
// ============================================================================

/** Fallback for expanded state - always false, writes are no-op */
const INACTIVE_EXPANDED_ATOM = atom<
  boolean | undefined,
  [boolean | undefined],
  void
>(
  () => undefined,
  () => {},
)

// ============================================================================
// View-Level Hook
// ============================================================================

/**
 * Hook for ViewSections - manages the current view's sections.
 * Uses SectionRegistryContext for section ordering.
 */
export function useViewSections() {
  // Get section registry from context
  const { sections, sectionCount } = useSectionRegistry()

  // View UI state (from view primitive)
  const selectedIndex = useAtomValue(activeSelectedIndexAtom)
  const focusDepth = useAtomValue(activeFocusDepthAtom)

  // Get selected section info
  const selectedSection = sections[selectedIndex] ?? null
  const selectedSectionId = selectedSection?.id ?? null

  // Build section IDs array for expand/collapse all
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections])

  // Navigation actions - pass sectionCount
  const selectNextAction = useSetAtom(selectNextSectionAtom)
  const selectPrevAction = useSetAtom(selectPrevSectionAtom)

  const selectNext = useCallback(() => {
    selectNextAction(sectionCount)
  }, [selectNextAction, sectionCount])

  const selectPrev = useCallback(() => {
    selectPrevAction(sectionCount)
  }, [selectPrevAction, sectionCount])

  // Toggle/expand/collapse actions - pass section info
  const toggleSelectedAction = useSetAtom(toggleSelectedSectionAtom)
  const expandSelectedAction = useSetAtom(expandSelectedSectionAtom)
  const collapseSelectedAction = useSetAtom(collapseSelectedSectionAtom)
  const expandAllAction = useSetAtom(expandAllSectionsAtom)
  const collapseAllAction = useSetAtom(collapseAllSectionsAtom)

  const toggleSelected = useCallback(() => {
    if (selectedSection) {
      toggleSelectedAction({
        sectionId: selectedSection.id,
        defaultExpanded: selectedSection.defaultExpanded,
      })
    }
  }, [toggleSelectedAction, selectedSection])

  const expandSelected = useCallback(() => {
    expandSelectedAction(selectedSectionId)
  }, [expandSelectedAction, selectedSectionId])

  const collapseSelected = useCallback(() => {
    collapseSelectedAction(selectedSectionId)
  }, [collapseSelectedAction, selectedSectionId])

  const expandAll = useCallback(() => {
    expandAllAction(sectionIds)
  }, [expandAllAction, sectionIds])

  const collapseAll = useCallback(() => {
    collapseAllAction(sectionIds)
  }, [collapseAllAction, sectionIds])

  return {
    // State
    sectionCount,
    selectedIndex,
    selectedSectionId,
    focusDepth,

    // Actions
    selectNext,
    selectPrev,
    toggleSelected,
    expandSelected,
    collapseSelected,
    expandAll,
    collapseAll,
  }
}

// ============================================================================
// Section-Level Hook
// ============================================================================

/**
 * Hook for Section component - gets this section's state.
 * Registers the section on mount and returns its expanded/selected state.
 *
 * @param id - Unique section identifier
 * @param defaultExpanded - Whether section is expanded by default
 * @param priority - Priority for sorting (default: PRIMARY)
 */
export function useSection(
  id: string,
  defaultExpanded: boolean,
  priority: SectionPriority = SectionPriority.PRIMARY,
) {
  const viewId = useAtomValue(activeViewIdAtom)

  // Register this section (self-registering on mount)
  const sectionIndex = useSectionRegistration(id, defaultExpanded, priority)

  // Get selected index to determine if this section is selected
  const selectedIndex = useAtomValue(activeSelectedIndexAtom)
  const isSelected = sectionIndex >= 0 && sectionIndex === selectedIndex

  // Get expanded override atom (useMemo ensures stable reference)
  const expandedAtom = useMemo(
    () => (viewId ? sectionExpandedAtom(viewId, id) : INACTIVE_EXPANDED_ATOM),
    [viewId, id],
  )

  // Read expanded override value
  const expandedOverride = useAtomValue(expandedAtom)

  // Write function (stable for same atom)
  const setExpanded = useSetAtom(expandedAtom)

  // Compute actual expanded state: override ?? default
  const isExpanded = expandedOverride ?? defaultExpanded

  const toggle = useCallback(() => {
    setExpanded(!isExpanded)
  }, [setExpanded, isExpanded])

  return {
    isExpanded,
    isSelected,
    setExpanded,
    toggle,
  }
}
