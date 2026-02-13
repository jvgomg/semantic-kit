/**
 * TUI Configuration Module
 *
 * Provides YAML-based configuration file support for the TUI.
 * Configs define URL collections that can be browsed in the TUI.
 *
 * @example
 * ```yaml
 * urls:
 *   - url: https://example.com
 *     title: Homepage
 *   - group: Blog
 *     urls:
 *       - url: https://example.com/blog/post-1
 *       - url: https://example.com/blog/post-2
 * ```
 */

// Schema (Zod schemas and inferred types)
export {
  TuiConfigSchema,
  ConfigUrlSchema,
  ConfigGroupSchema,
  ConfigEntrySchema,
  type ConfigUrl,
  type ConfigGroup,
  type ConfigEntry,
  type TuiConfig,
} from './schema.js'

// Types and type guards
export {
  isConfigGroup,
  isConfigUrl,
  type ConfigLoadSuccess,
  type ConfigLoadError,
  type ConfigLoadResult,
} from './types.js'

// Loader
export { loadTuiConfig, formatConfigError } from './loader.js'

// Tree building
export {
  buildConfigTree,
  flattenConfigTree,
  countConfigUrls,
  getAllConfigUrls,
  type ConfigTreeNode,
  type ConfigTreeUrlNode,
  type ConfigTreeGroupNode,
  type FlattenedConfigNode,
} from './tree.js'

// Templates
export {
  // Config data structures
  MINIMAL_CONFIG,
  FLAT_CONFIG,
  GROUPED_CONFIG,
  // Header comments
  DEFAULT_HEADER,
  DETAILED_HEADER,
  // Generation functions
  configToYaml,
  generateMinimalTemplate,
  generateFlatTemplate,
  generateGroupedTemplate,
  generateConfigTemplate,
  type GenerateConfigOptions,
  type ConfigTemplateOptions,
} from './template.js'
