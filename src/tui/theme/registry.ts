/**
 * Theme Registry and Resolution
 *
 * Manages theme families (groupings of light/dark variants) and
 * provides resolution logic for selecting the appropriate variant.
 */

import { THEME_DEFINITIONS, type ThemeDefinition, type ThemeVariant } from './base16.js'

/**
 * A theme family groups related light and dark variants together.
 * A family may have one or both variants.
 */
export interface ThemeFamily {
  /** Unique identifier for the family */
  id: string
  /** Display name for the family */
  name: string
  /** Dark variant, if available */
  dark?: ThemeDefinition
  /** Light variant, if available */
  light?: ThemeDefinition
}

/**
 * The theme registry containing all available theme families.
 */
export interface ThemeRegistry {
  /** All registered theme families */
  families: ThemeFamily[]
  /** ID of the default theme family */
  defaultFamilyId: string
}

/**
 * User's preference for which variant to use.
 * - 'auto': Use terminal-detected variant
 * - 'dark': Always use dark variant
 * - 'light': Always use light variant
 */
export type VariantPreference = 'auto' | 'dark' | 'light'

/**
 * Result of resolving a theme with all computed values.
 */
export interface ResolvedTheme {
  /** The theme family that was resolved */
  family: ThemeFamily
  /** The variant that was selected */
  variant: ThemeVariant
  /** The full theme definition */
  definition: ThemeDefinition
}

// =============================================================================
// Theme Registry
// =============================================================================

export const THEME_REGISTRY: ThemeRegistry = {
  families: [
    {
      id: 'nord',
      name: 'Nord',
      dark: THEME_DEFINITIONS['nord-dark'],
      light: THEME_DEFINITIONS['nord-light'],
    },
    {
      id: 'twilight',
      name: 'Twilight',
      dark: THEME_DEFINITIONS['twilight'],
      // No light variant
    },
    {
      id: 'sakura',
      name: 'Sakura',
      // No dark variant
      light: THEME_DEFINITIONS['sakura'],
    },
  ],
  defaultFamilyId: 'nord',
}

// =============================================================================
// Resolution Logic
// =============================================================================

/**
 * Find a theme family by ID.
 */
export function getThemeFamily(familyId: string): ThemeFamily | undefined {
  return THEME_REGISTRY.families.find((f) => f.id === familyId)
}

/**
 * Get the default theme family.
 */
export function getDefaultThemeFamily(): ThemeFamily {
  const family = getThemeFamily(THEME_REGISTRY.defaultFamilyId)
  if (!family) {
    throw new Error(`Default theme family '${THEME_REGISTRY.defaultFamilyId}' not found`)
  }
  return family
}

/**
 * Resolve a theme based on family, user preference, and detected terminal mode.
 *
 * Resolution rules:
 * 1. If preference is 'dark' or 'light', use that variant
 * 2. If preference is 'auto' and detection is available, use detected variant
 * 3. Fall back to available variant if requested variant doesn't exist
 * 4. Default to dark if no variant is available (shouldn't happen with valid data)
 *
 * @param familyId - ID of the theme family to use
 * @param variantPreference - User's variant preference ('auto', 'dark', 'light')
 * @param detectedVariant - Terminal-detected variant (null if detection unavailable)
 */
export function resolveTheme(
  familyId: string,
  variantPreference: VariantPreference,
  detectedVariant: ThemeVariant | null,
): ResolvedTheme {
  // Find the family, falling back to default
  const family = getThemeFamily(familyId) ?? getDefaultThemeFamily()

  // Determine desired variant
  let desiredVariant: ThemeVariant
  if (variantPreference === 'auto') {
    // Use detection if available, otherwise default to dark
    desiredVariant = detectedVariant ?? 'dark'
  } else {
    desiredVariant = variantPreference
  }

  // Try to get the desired variant, fall back to whatever is available
  let definition: ThemeDefinition | undefined
  if (desiredVariant === 'dark') {
    definition = family.dark ?? family.light
  } else {
    definition = family.light ?? family.dark
  }

  // This should never happen if families are properly configured
  if (!definition) {
    throw new Error(`Theme family '${family.id}' has no variants`)
  }

  return {
    family,
    variant: definition.variant,
    definition,
  }
}

/**
 * Get all available theme families for UI display.
 */
export function getAllThemeFamilies(): ThemeFamily[] {
  return THEME_REGISTRY.families
}
