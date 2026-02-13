/**
 * Type definitions and type guards for TUI configuration.
 *
 * Re-exports Zod-inferred types and provides type guards for
 * discriminating between different entry types.
 */

// Re-export Zod-inferred types
export type { ConfigUrl, ConfigGroup, ConfigEntry, TuiConfig } from './schema.js'
import type { ConfigEntry, ConfigGroup, ConfigUrl } from './schema.js'

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a config entry is a group (has 'group' property).
 */
export function isConfigGroup(entry: ConfigEntry): entry is ConfigGroup {
  return 'group' in entry && typeof entry.group === 'string'
}

/**
 * Check if a config entry is a flat URL (has 'url' property but no 'group').
 */
export function isConfigUrl(entry: ConfigEntry): entry is ConfigUrl {
  return 'url' in entry && !('group' in entry)
}

// ============================================================================
// Result Types
// ============================================================================

/**
 * Successful config load result.
 */
export interface ConfigLoadSuccess {
  type: 'success'
  config: import('./schema.js').TuiConfig
  path: string
}

/**
 * Error result from config loading.
 */
export interface ConfigLoadError {
  type: 'error'
  errorType: 'file-not-found' | 'parse-error' | 'validation-error' | 'read-error'
  message: string
  path: string
  /** Detailed validation errors (for validation-error type) */
  details?: string[]
}

/**
 * Combined result type for config loading operations.
 */
export type ConfigLoadResult = ConfigLoadSuccess | ConfigLoadError
