/**
 * Focus Scope Atoms
 *
 * Stack-based focus management with automatic scope restoration.
 * The stack always has at least the app scope at the bottom.
 */
import { atom } from 'jotai'
import type { FocusScopeConfig, FocusScopeEntry } from './types.js'
import { APP_SCOPE } from './types.js'

// =============================================================================
// Core State
// =============================================================================

/**
 * The focus scope stack.
 * Bottom of stack (index 0) is always the app scope.
 * Top of stack (last element) is the active scope.
 */
export const focusScopeStackAtom = atom<FocusScopeEntry[]>([
  {
    config: APP_SCOPE,
    focusedRegion: APP_SCOPE.initialRegion ?? APP_SCOPE.regions[0],
  },
])

// =============================================================================
// Derived Atoms (Read-only)
// =============================================================================

/**
 * The active (top) scope entry.
 * Always returns a valid entry since the app scope is always present.
 */
export const activeScopeAtom = atom((get): FocusScopeEntry => {
  const stack = get(focusScopeStackAtom)
  return stack[stack.length - 1]
})

/**
 * The currently focused region in the active scope.
 */
export const focusedRegionAtom = atom((get): string => {
  return get(activeScopeAtom).focusedRegion
})

/**
 * Whether the app scope is active (no dialogs/overlays open).
 */
export const isAppScopeActiveAtom = atom((get): boolean => {
  const stack = get(focusScopeStackAtom)
  return stack.length === 1 && stack[0].config.id === 'app'
})

/**
 * Get a specific scope entry by ID.
 * Returns null if the scope is not in the stack.
 */
export const getScopeByIdAtom = atom((get) => {
  return (scopeId: string): FocusScopeEntry | null => {
    const stack = get(focusScopeStackAtom)
    return stack.find((entry) => entry.config.id === scopeId) ?? null
  }
})

// =============================================================================
// Action Atoms (Write-only)
// =============================================================================

/**
 * Push a new scope onto the stack.
 * Saves the current focus state in the previous scope for restoration.
 */
export const pushScopeAtom = atom(
  null,
  (get, set, config: FocusScopeConfig) => {
    const stack = get(focusScopeStackAtom)

    // Determine initial region
    const initialRegion = config.initialRegion ?? config.regions[0]

    const newEntry: FocusScopeEntry = {
      config,
      focusedRegion: initialRegion,
    }

    set(focusScopeStackAtom, [...stack, newEntry])
  },
)

/**
 * Pop the current scope from the stack.
 * The app scope (bottom) is never popped.
 * Focus automatically returns to the previous scope's focused region.
 */
export const popScopeAtom = atom(null, (get, set) => {
  const stack = get(focusScopeStackAtom)

  // Never pop the app scope
  if (stack.length <= 1) {
    return
  }

  set(focusScopeStackAtom, stack.slice(0, -1))
})

/**
 * Set focus to a specific region in the current scope.
 * Validates that the region exists in the current scope.
 */
export const setFocusAtom = atom(null, (get, set, region: string) => {
  const stack = get(focusScopeStackAtom)
  if (stack.length === 0) return

  const activeIndex = stack.length - 1
  const activeScope = stack[activeIndex]

  // Validate the region exists in the current scope
  if (!activeScope.config.regions.includes(region)) {
    console.warn(
      `Focus region "${region}" not found in scope "${activeScope.config.id}". ` +
        `Valid regions: ${activeScope.config.regions.join(', ')}`,
    )
    return
  }

  // Update the focused region in the active scope
  const updatedEntry: FocusScopeEntry = {
    ...activeScope,
    focusedRegion: region,
  }

  set(focusScopeStackAtom, [...stack.slice(0, activeIndex), updatedEntry])
})

/**
 * Focus the next region in the current scope (Tab forward).
 * Wraps around to the first region after the last.
 */
export const focusNextAtom = atom(null, (get, set) => {
  const stack = get(focusScopeStackAtom)
  if (stack.length === 0) return

  const activeIndex = stack.length - 1
  const activeScope = stack[activeIndex]
  const { regions } = activeScope.config
  const currentIndex = regions.indexOf(activeScope.focusedRegion)
  const nextIndex = (currentIndex + 1) % regions.length
  const nextRegion = regions[nextIndex]

  const updatedEntry: FocusScopeEntry = {
    ...activeScope,
    focusedRegion: nextRegion,
  }

  set(focusScopeStackAtom, [...stack.slice(0, activeIndex), updatedEntry])
})

/**
 * Focus the previous region in the current scope (Tab backward).
 * Wraps around to the last region before the first.
 */
export const focusPreviousAtom = atom(null, (get, set) => {
  const stack = get(focusScopeStackAtom)
  if (stack.length === 0) return

  const activeIndex = stack.length - 1
  const activeScope = stack[activeIndex]
  const { regions } = activeScope.config
  const currentIndex = regions.indexOf(activeScope.focusedRegion)
  const prevIndex = (currentIndex - 1 + regions.length) % regions.length
  const prevRegion = regions[prevIndex]

  const updatedEntry: FocusScopeEntry = {
    ...activeScope,
    focusedRegion: prevRegion,
  }

  set(focusScopeStackAtom, [...stack.slice(0, activeIndex), updatedEntry])
})

/**
 * Update focus in a specific scope by ID.
 * Used when a component needs to set focus in its own scope
 * (e.g., dialog with multiple regions).
 */
export const setFocusInScopeAtom = atom(
  null,
  (get, set, payload: { scopeId: string; region: string }) => {
    const { scopeId, region } = payload
    const stack = get(focusScopeStackAtom)

    const scopeIndex = stack.findIndex((entry) => entry.config.id === scopeId)
    if (scopeIndex === -1) {
      console.warn(`Scope "${scopeId}" not found in stack`)
      return
    }

    const scope = stack[scopeIndex]

    // Validate the region exists in the scope
    if (!scope.config.regions.includes(region)) {
      console.warn(
        `Focus region "${region}" not found in scope "${scopeId}". ` +
          `Valid regions: ${scope.config.regions.join(', ')}`,
      )
      return
    }

    const updatedEntry: FocusScopeEntry = {
      ...scope,
      focusedRegion: region,
    }

    set(focusScopeStackAtom, [
      ...stack.slice(0, scopeIndex),
      updatedEntry,
      ...stack.slice(scopeIndex + 1),
    ])
  },
)
