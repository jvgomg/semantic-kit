/**
 * Config template generation for TUI configuration files.
 *
 * Uses Zod-typed data structures as the source of truth,
 * then converts to YAML for output.
 */
import { stringify as stringifyYaml } from 'yaml'
import type { TuiConfig } from './schema.js'

// ============================================================================
// Template Data Structures
// ============================================================================

/**
 * Minimal config with a single URL.
 */
export const MINIMAL_CONFIG: TuiConfig = {
  urls: [{ url: 'https://example.com' }],
}

/**
 * Simple config with flat URLs only.
 */
export const FLAT_CONFIG: TuiConfig = {
  urls: [
    { url: 'https://example.com', title: 'Example Homepage' },
    { url: 'https://example.com/about', title: 'About Page' },
  ],
}

/**
 * Config with grouped URLs demonstrating all features.
 */
export const GROUPED_CONFIG: TuiConfig = {
  urls: [
    // Flat URL at top level
    { url: 'https://example.com', title: 'Homepage' },
    // Grouped URLs
    {
      group: 'Blog Posts',
      urls: [
        { url: 'https://example.com/blog/post-1', title: 'First Post' },
        { url: 'https://example.com/blog/post-2', title: 'Second Post' },
      ],
    },
    {
      group: 'Documentation',
      urls: [
        { url: 'https://example.com/docs/getting-started' },
        { url: 'https://example.com/docs/api-reference' },
      ],
    },
  ],
}

// ============================================================================
// Header Comments
// ============================================================================

/**
 * Default header comment for config files.
 */
export const DEFAULT_HEADER = `# TUI Configuration
# Add URLs to analyze in the TUI
`

/**
 * Header comment with usage instructions.
 */
export const DETAILED_HEADER = `# TUI Configuration
#
# URLs can be flat or organized into collapsible groups.
# Each URL can have an optional title for display.
#
# Usage: semantic-kit tui --config <path>
`

// ============================================================================
// Template Generation
// ============================================================================

export interface GenerateConfigOptions {
  /** Header comment to prepend (use null for no header) */
  header?: string | null
}

/**
 * Convert a TuiConfig to YAML string with optional header.
 *
 * @param config - The typed config data
 * @param options - Generation options
 * @returns YAML string ready to write to file
 */
export function configToYaml(
  config: TuiConfig,
  options: GenerateConfigOptions = {},
): string {
  const { header = DEFAULT_HEADER } = options

  const yaml = stringifyYaml(config, {
    indent: 2,
    lineWidth: 0, // Disable line wrapping
  })

  if (header === null) {
    return yaml
  }

  return header + '\n' + yaml
}

/**
 * Generate a minimal config template.
 */
export function generateMinimalTemplate(
  options: GenerateConfigOptions = {},
): string {
  return configToYaml(MINIMAL_CONFIG, { header: null, ...options })
}

/**
 * Generate a flat URL config template.
 */
export function generateFlatTemplate(
  options: GenerateConfigOptions = {},
): string {
  return configToYaml(FLAT_CONFIG, options)
}

/**
 * Generate a grouped URL config template.
 */
export function generateGroupedTemplate(
  options: GenerateConfigOptions = {},
): string {
  return configToYaml(GROUPED_CONFIG, { header: DETAILED_HEADER, ...options })
}

export interface ConfigTemplateOptions {
  /** Include header comment */
  includeHeader?: boolean
  /** Include example groups */
  includeGroups?: boolean
}

/**
 * Generate a config template based on options.
 *
 * TODO: This will be used by a future `semantic-kit config init` command
 * to generate a starter config file.
 *
 * @param options - Template generation options
 * @returns The template string
 */
export function generateConfigTemplate(
  options: ConfigTemplateOptions = {},
): string {
  const { includeHeader = true, includeGroups = false } = options

  const genOptions: GenerateConfigOptions = {
    header: includeHeader ? undefined : null,
  }

  if (includeGroups) {
    return generateGroupedTemplate(genOptions)
  }

  return generateFlatTemplate(genOptions)
}
