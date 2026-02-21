/**
 * Built-in Theme Registry
 *
 * This module exports all built-in themes and the theme registry.
 */

import { SYSTEM_THEME } from '../system-theme.js'
import type { ThemeDefinition } from '../types.js'
import { DRACULA_THEME } from './dracula.js'
import { NORD_THEME } from './nord.js'
import { TOKYO_NIGHT_THEME } from './tokyo-night.js'

// Re-export individual themes
export { SYSTEM_THEME } from '../system-theme.js'
export { DRACULA_THEME } from './dracula.js'
export { NORD_THEME } from './nord.js'
export { TOKYO_NIGHT_THEME } from './tokyo-night.js'

/**
 * All built-in themes indexed by ID.
 */
export const BUILTIN_THEMES: Record<string, ThemeDefinition> = {
  system: SYSTEM_THEME,
  dracula: DRACULA_THEME,
  nord: NORD_THEME,
  'tokyo-night': TOKYO_NIGHT_THEME,
}

/**
 * Default theme ID.
 */
export const DEFAULT_THEME_ID = 'system'

/**
 * Get a theme by ID.
 */
export function getTheme(id: string): ThemeDefinition | undefined {
  return BUILTIN_THEMES[id]
}

/**
 * Get all available themes.
 */
export function getAllThemes(): ThemeDefinition[] {
  return Object.values(BUILTIN_THEMES)
}

/**
 * Get the default theme.
 */
export function getDefaultTheme(): ThemeDefinition {
  return BUILTIN_THEMES[DEFAULT_THEME_ID]
}
