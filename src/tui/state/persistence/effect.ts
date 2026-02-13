/**
 * Jotai atomEffect for persisting TUI state changes.
 *
 * This effect watches relevant atoms and persists their values
 * to disk with throttling. It runs at the store level, not React level.
 */
import { atomEffect } from 'jotai-effect'
import {
  activeModalAtom,
  urlAtom,
  urlListActiveTabAtom,
  configExpandedGroupsAtom,
  configSelectedIndexAtom,
} from '../atoms/index.js'
import { themeFamilyIdAtom, variantPreferenceAtom } from '../../theme.js'
import { sectionsAtomFamily } from '../sections/atoms.js'
import { activeMenuIndexAtom } from '../tool-navigation.js'
import { viewDataIdsAtom } from '../view-data/index.js'
import { getPersistWriter } from './store.js'
import { PERSISTED_STATE_VERSION, type PersistedState } from './types.js'

/**
 * Effect atom that persists state changes to disk.
 *
 * Subscribe to this atom to activate persistence.
 * The effect automatically tracks dependencies and runs
 * whenever any persisted value changes.
 */
export const persistStateEffect = atomEffect((get) => {
  const writer = getPersistWriter()
  if (!writer) return

  // Track all atoms we want to persist
  // atomEffect automatically subscribes to these
  const url = get(urlAtom)
  const activeMenuIndex = get(activeMenuIndexAtom)
  const activeModal = get(activeModalAtom)
  const viewIds = get(viewDataIdsAtom)
  const urlListActiveTab = get(urlListActiveTabAtom)
  const configExpandedGroups = get(configExpandedGroupsAtom)
  const configSelectedIndex = get(configSelectedIndexAtom)
  const themeFamilyId = get(themeFamilyIdAtom)
  const variantPreference = get(variantPreferenceAtom)

  // Build the persisted state
  const state: PersistedState = {
    version: PERSISTED_STATE_VERSION,
    url,
    activeMenuIndex,
    activeModal,
    views: {},
    urlListActiveTab,
    configExpandedGroups: Array.from(configExpandedGroups),
    configSelectedIndex,
    themeFamilyId,
    variantPreference,
  }

  // Collect expanded states for all known views
  for (const viewId of viewIds) {
    const sectionsAtom = sectionsAtomFamily(viewId)
    const sectionsState = get(sectionsAtom)
    state.views[viewId] = {
      expanded: sectionsState.expanded,
    }
  }

  // Write (throttled by the writer)
  writer(state)
})
