/**
 * Theme State Atoms
 *
 * Jotai atoms for managing theme state. Provides both primitive atoms
 * for direct state access and derived atoms for computed values.
 */

import { atom } from 'jotai'
import type { ThemeVariant } from './base16.js'
import {
  THEME_REGISTRY,
  resolveTheme,
  type ResolvedTheme,
  type VariantPreference,
} from './registry.js'

// =============================================================================
// Primitive Atoms
// =============================================================================

/**
 * The currently selected theme family ID.
 * Defaults to the registry's default family.
 */
export const themeFamilyIdAtom = atom<string>(THEME_REGISTRY.defaultFamilyId)

/**
 * User's variant preference: 'auto', 'dark', or 'light'.
 * 'auto' uses the detected terminal theme mode.
 */
export const variantPreferenceAtom = atom<VariantPreference>('auto')

/**
 * The terminal's detected theme variant.
 * null when detection hasn't run or isn't available.
 */
export const detectedVariantAtom = atom<ThemeVariant | null>(null)

// =============================================================================
// Derived Atoms
// =============================================================================

/**
 * The fully resolved theme based on current settings.
 * Combines family selection, user preference, and detection.
 */
export const resolvedThemeAtom = atom<ResolvedTheme>((get) => {
  return resolveTheme(
    get(themeFamilyIdAtom),
    get(variantPreferenceAtom),
    get(detectedVariantAtom),
  )
})

/**
 * Convenience atom for direct access to the current palette.
 * Use this when you only need the colors, not family/variant info.
 */
export const currentPaletteAtom = atom((get) => {
  return get(resolvedThemeAtom).definition.palette
})

// =============================================================================
// Action Atoms
// =============================================================================

/**
 * Action atom to change the theme family.
 * Usage: const setFamily = useSetAtom(setThemeFamilyAtom)
 */
export const setThemeFamilyAtom = atom(null, (_get, set, familyId: string) => {
  set(themeFamilyIdAtom, familyId)
})

/**
 * Action atom to change the variant preference.
 * Usage: const setPreference = useSetAtom(setVariantPreferenceAtom)
 */
export const setVariantPreferenceAtom = atom(
  null,
  (_get, set, preference: VariantPreference) => {
    set(variantPreferenceAtom, preference)
  },
)

/**
 * Action atom to update the detected variant from terminal detection.
 * Called internally by the theme detection system.
 */
export const setDetectedVariantAtom = atom(
  null,
  (_get, set, variant: ThemeVariant | null) => {
    set(detectedVariantAtom, variant)
  },
)
