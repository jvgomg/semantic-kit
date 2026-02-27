/**
 * Focus Scope Types
 *
 * Defines the types for the focus scope system which provides
 * stack-based focus management with automatic scope restoration.
 */

/**
 * Configuration for a focus scope.
 * Each component that owns a scope (dialogs, app) provides this config.
 */
export interface FocusScopeConfig {
  /** Unique identifier for this scope (e.g., 'app', 'sitemap-dialog') */
  id: string
  /** Ordered list of focusable regions within this scope (Tab order) */
  regions: readonly string[]
  /** Initial region to focus when scope is activated */
  initialRegion?: string
}

/**
 * An entry in the focus scope stack.
 * Tracks both the scope config and current focus state within that scope.
 */
export interface FocusScopeEntry {
  /** The scope configuration */
  config: FocusScopeConfig
  /** Current focused region within this scope */
  focusedRegion: string
}

/**
 * App-level focus regions (always at bottom of stack).
 */
export type AppFocusRegion = 'url' | 'menu' | 'main'

/**
 * The predefined app scope configuration.
 * This is the only "built-in" scope - all others are defined dynamically.
 */
export const APP_SCOPE: FocusScopeConfig = {
  id: 'app',
  regions: ['url', 'menu', 'main'] as const,
  initialRegion: 'menu',
}
