/**
 * Config-related atoms for TUI configuration file support.
 *
 * Manages the loaded config state, expanded groups, and selection
 * for the config tab in the URL list panel.
 */
import { atom } from 'jotai'
import {
  buildConfigTree,
  flattenConfigTree,
  type TuiConfig,
  type ConfigTreeNode,
  type FlattenedConfigNode,
} from '../../../lib/tui-config/index.js'

// ============================================================================
// Types
// ============================================================================

/**
 * Loaded config state.
 */
export interface ConfigState {
  /** Path to the config file */
  path: string
  /** Parsed config data */
  config: TuiConfig
}

// ============================================================================
// Base Atoms
// ============================================================================

/**
 * The loaded config state (null if no config loaded).
 */
export const configStateAtom = atom<ConfigState | null>(null)

/**
 * Selected index in the flattened config tree.
 */
export const configSelectedIndexAtom = atom(0)

/**
 * Set of expanded group IDs in the config tree.
 */
export const configExpandedGroupsAtom = atom<Set<string>>(new Set<string>())

// ============================================================================
// Derived Atoms
// ============================================================================

/**
 * Whether a config is currently loaded.
 */
export const hasConfigAtom = atom((get) => get(configStateAtom) !== null)

/**
 * The config tree built from loaded config.
 */
export const configTreeAtom = atom((get): ConfigTreeNode[] => {
  const state = get(configStateAtom)
  if (!state) return []
  return buildConfigTree(state.config)
})

/**
 * The flattened config tree for display.
 */
export const flattenedConfigTreeAtom = atom((get): FlattenedConfigNode[] => {
  const tree = get(configTreeAtom)
  const expandedGroups = get(configExpandedGroupsAtom)
  return flattenConfigTree(tree, expandedGroups)
})

// ============================================================================
// Action Atoms
// ============================================================================

/**
 * Toggle expansion of a config group.
 */
export const toggleConfigGroupAtom = atom(null, (get, set, groupId: string) => {
  const expanded = get(configExpandedGroupsAtom)
  const newExpanded = new Set(expanded)
  if (newExpanded.has(groupId)) {
    newExpanded.delete(groupId)
  } else {
    newExpanded.add(groupId)
  }
  set(configExpandedGroupsAtom, newExpanded)
})

/**
 * Reset config selection state.
 */
export const resetConfigSelectionAtom = atom(null, (_get, set) => {
  set(configSelectedIndexAtom, 0)
  set(configExpandedGroupsAtom, new Set())
})

/**
 * Initialize config state from loaded data.
 */
export const initConfigStateAtom = atom(
  null,
  (_get, set, configData: { path: string; config: TuiConfig } | undefined) => {
    if (configData) {
      set(configStateAtom, configData)
    } else {
      set(configStateAtom, null)
    }
  },
)
