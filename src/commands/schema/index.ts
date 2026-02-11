// Public API
export { schemaCommand } from './command.js'
export { schemaJsCommand } from './command-js.js'
export { schemaCompareCommand } from './command-compare.js'
export { fetchSchema } from './runner.js'
export { fetchSchemaJs } from './runner-js.js'
export { fetchSchemaCompare } from './runner-compare.js'
export { formatSchemaOutput, formatSchemaCompareOutput } from './formatters.js'

// Types
export type { SchemaOptions, SchemaJsOptions, SchemaCompareOptions } from './types.js'
