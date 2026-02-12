// Public API - Commands
export { structureCommand } from './command.js'
export { structureJsCommand } from './command-js.js'
export { structureCompareCommand } from './command-compare.js'

// Public API - Runners (for TUI and programmatic use)
export { fetchStructure } from './runner.js'
export { fetchStructureJs } from './runner-js.js'
export { fetchStructureCompare } from './runner-compare.js'

// Types
export type {
  StructureOptions,
  StructureJsOptions,
  StructureCompareOptions,
  TuiStructureResult,
  StructureJsInternalResult,
  StructureCompareResult,
} from './types.js'
