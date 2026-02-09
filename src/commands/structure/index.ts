// Public API - Commands
export { structureCommand } from './command.js'
export { structureJsCommand } from './command-js.js'
export { structureCompareCommand } from './command-compare.js'

// Public API - Runners (for TUI and programmatic use)
export { fetchStructure } from './runner.js'

// Types
export type {
  StructureOptions,
  StructureJsOptions,
  StructureCompareOptions,
  TuiStructureResult,
} from './types.js'
