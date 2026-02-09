/**
 * Core atoms for section state management.
 *
 * Section state only stores expanded overrides.
 * Section ordering and selection are managed by SectionRegistryContext.
 */
import { atom } from 'jotai'
import { atomFamily } from 'jotai-family'
import { focusAtom } from 'jotai-optics'
import { activeViewIdAtom } from '../atoms/menu.js'
import { DEFAULT_SECTIONS_STATE, type SectionsState } from './types.js'

/**
 * Per-view sections state atom family.
 * Each view gets its own independent sections state.
 * Only stores expanded overrides.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sectionsAtomFamily = atomFamily((_viewId: string) =>
  atom<SectionsState>({ ...DEFAULT_SECTIONS_STATE }),
)

/**
 * Derived atom that returns the current view's sections state.
 * Automatically tracks the active view from activeViewIdAtom.
 */
export const activeSectionsAtom = atom(
  (get) => {
    const viewId = get(activeViewIdAtom)
    if (!viewId) return DEFAULT_SECTIONS_STATE
    return get(sectionsAtomFamily(viewId))
  },
  (
    get,
    set,
    update: SectionsState | ((prev: SectionsState) => SectionsState),
  ) => {
    const viewId = get(activeViewIdAtom)
    if (!viewId) return
    const sectionsAtom = sectionsAtomFamily(viewId)
    if (typeof update === 'function') {
      set(sectionsAtom, update(get(sectionsAtom)))
    } else {
      set(sectionsAtom, update)
    }
  },
)

/**
 * Creates a focusAtom for a section's expanded state.
 * Provides granular subscription - only re-renders when this section's expanded state changes.
 */
export function sectionExpandedAtom(viewId: string, sectionId: string) {
  const sectionsAtom = sectionsAtomFamily(viewId)
  return focusAtom(sectionsAtom, (o) => o.prop('expanded').prop(sectionId))
}
