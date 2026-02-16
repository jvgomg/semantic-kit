/**
 * Zod schemas for TUI configuration file validation.
 *
 * These schemas define the structure of YAML config files that specify
 * URL collections for the TUI. The config can contain flat URLs or
 * grouped URLs for hierarchical organization.
 */
import { z } from 'zod'

// ============================================================================
// URL Entry Schemas
// ============================================================================

/**
 * Schema for a single URL entry.
 * Can have an optional title for display purposes.
 */
export const ConfigUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
  title: z.string().optional(),
})

/**
 * Schema for a group of URLs.
 * Groups have a name and contain at least one URL.
 */
export const ConfigGroupSchema = z.object({
  group: z.string().min(1, 'Group name cannot be empty'),
  urls: z.array(ConfigUrlSchema).min(1, 'Group must contain at least one URL'),
})

/**
 * Schema for a single entry in the config (either a URL or a group).
 */
export const ConfigEntrySchema = z.union([ConfigUrlSchema, ConfigGroupSchema])

// ============================================================================
// Root Config Schema
// ============================================================================

/**
 * Root schema for TUI configuration files.
 * Must contain at least one URL or group.
 */
export const TuiConfigSchema = z.object({
  urls: z.array(ConfigEntrySchema).min(1, 'Config must contain at least one URL or group'),
})

// ============================================================================
// Inferred Types
// ============================================================================

/** A single URL entry */
export type ConfigUrl = z.infer<typeof ConfigUrlSchema>

/** A group of URLs */
export type ConfigGroup = z.infer<typeof ConfigGroupSchema>

/** Either a URL entry or a group */
export type ConfigEntry = z.infer<typeof ConfigEntrySchema>

/** The complete TUI configuration */
export type TuiConfig = z.infer<typeof TuiConfigSchema>
