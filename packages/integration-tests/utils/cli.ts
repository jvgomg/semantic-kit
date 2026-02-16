/**
 * CLI test utilities for running semantic-kit commands
 *
 * Primary API: `run()` — a cached, type-safe command runner.
 *
 *   const { data } = await run(`ai ${url}`)
 *   //    ^? AiResult
 *
 *   const { data } = await run(`screen-reader ${url}`)
 *   //    ^? ScreenReaderResult
 *
 * Calls with identical arguments share a single CLI invocation (promise-level
 * caching). This means 7 tests hitting `screen-reader` on the same URL only
 * spawn one subprocess. Each test file gets its own cache (bun:test runs
 * files in separate workers).
 */

import type { ReadabilityCompareResult } from '@webspecs/cli/commands/readability/types.js'
import type { SocialResult } from '@webspecs/cli/commands/social/types.js'
import type { JsonEnvelope } from '@webspecs/cli/lib/json-envelope.js'
import type {
  Issue,
  A11yCompareResult,
  A11yResult,
  AiResult,
  GoogleResult,
  ReaderResult,
  ReadabilityJsResult,
  ReadabilityUtilityResult,
  SchemaCompareResult,
  SchemaJsResult,
  SchemaResult,
  ScreenReaderResult,
  StructureCompareResult,
  StructureJsResult,
  StructureResult,
  ValidateA11yResult,
  ValidateHtmlResult,
  ValidateSchemaResult,
} from '@webspecs/core'

// ============================================================================
// Command → Result type mapping
// ============================================================================

/**
 * Maps every CLI command name to its result type.
 * Add new commands here — `run()` picks up the type automatically.
 */
interface CommandMap {
  ai: AiResult
  google: GoogleResult
  reader: ReaderResult
  readability: ReadabilityUtilityResult
  'readability:js': ReadabilityJsResult
  'readability:compare': ReadabilityCompareResult
  schema: SchemaResult
  'schema:js': SchemaJsResult
  'schema:compare': SchemaCompareResult
  social: SocialResult
  'screen-reader': ScreenReaderResult
  structure: StructureResult
  'structure:js': StructureJsResult
  'structure:compare': StructureCompareResult
  'a11y-tree': A11yResult
  'a11y-tree:js': A11yResult
  'a11y-tree:compare': A11yCompareResult
  'validate:html': ValidateHtmlResult
  'validate:schema': ValidateSchemaResult
  'validate:a11y': ValidateA11yResult
}

// ============================================================================
// Type-level command extraction
// ============================================================================

/** All known command names, ordered longest-first so greedy match works. */
type Command = keyof CommandMap

/**
 * Extract the command name from the leading portion of a string.
 *
 * Handles both `"ai <rest>"` and compound names like `"screen-reader <rest>"`.
 * Uses a cascading conditional so longer names match before shorter prefixes.
 */
type ExtractCommand<S extends string> =
  // 3-token compound commands (e.g. "readability:compare", "a11y-tree:compare")
  S extends `${infer A}:${infer B} ${string}`
    ? `${A}:${B}` extends Command
      ? `${A}:${B}`
      : string
    : // 2-token hyphenated commands (e.g. "screen-reader", "a11y-tree")
      S extends `${infer A}-${infer B} ${string}`
      ? `${A}-${B}` extends Command
        ? `${A}-${B}`
        : // 3-token hyphenated+colon (e.g. "a11y-tree:js")
          S extends `${infer C}:${string} ${string}`
          ? C extends Command
            ? C
            : string
          : string
      : // Simple single-word commands (e.g. "ai", "google")
        S extends `${infer Cmd} ${string}`
        ? Cmd extends Command
          ? Cmd
          : string
        : string

/** Resolve the result type for a command string. */
type ResultFor<S extends string> =
  ExtractCommand<S> extends Command ? CommandMap[ExtractCommand<S>] : unknown

// ============================================================================
// CLI result type
// ============================================================================

export interface CliResult<T> {
  data: T | null
  issues: Issue[]
  exitCode: number
  stderr: string
  stdout: string
}

// ============================================================================
// Implementation
// ============================================================================

/** Promise cache — keyed by the raw command string. Per-file (worker isolation). */
const cache = new Map<string, Promise<CliResult<unknown>>>()

/** All command names sorted longest-first for unambiguous runtime parsing. */
const COMMANDS: Command[] = Object.keys({
  'readability:compare': 1,
  'structure:compare': 1,
  'a11y-tree:compare': 1,
  'validate:schema': 1,
  'readability:js': 1,
  'screen-reader': 1,
  'structure:js': 1,
  'a11y-tree:js': 1,
  'validate:html': 1,
  'validate:a11y': 1,
  'schema:compare': 1,
  'schema:js': 1,
  readability: 1,
  'a11y-tree': 1,
  structure: 1,
  google: 1,
  reader: 1,
  schema: 1,
  social: 1,
  ai: 1,
} satisfies Record<Command, 1>) as Command[]

function isJsonEnvelope<T>(obj: unknown): obj is JsonEnvelope<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'command' in obj &&
    'result' in obj &&
    'issues' in obj
  )
}

/**
 * Parse a command string into (command, url, options).
 *
 * Accepts natural CLI-like strings:
 *   "ai http://localhost:4050/path"
 *   "screen-reader http://localhost:4050/path --verbose"
 *   "schema:compare http://localhost:4050/path --timeout 10000"
 */
function parseCommandString(input: string): {
  command: string
  url: string
  options: string[]
} {
  const trimmed = input.trim()

  // Find which command prefix matches
  const command = COMMANDS.find(
    (cmd) => trimmed === cmd || trimmed.startsWith(`${cmd} `),
  )
  if (!command) {
    throw new Error(
      `Unknown command in: "${input}". Expected one of: ${COMMANDS.join(', ')}`,
    )
  }

  const rest = trimmed.slice(command.length).trim()
  if (!rest) {
    throw new Error(`Missing URL in: "${input}"`)
  }

  // Split remaining tokens — first URL-like token is the url, rest are options
  const tokens = rest.split(/\s+/)
  const url = tokens[0]
  const options = tokens.slice(1)

  return { command, url, options }
}

/** Execute a single CLI command (no caching). */
async function exec<T>(
  command: string,
  url: string,
  options: string[],
): Promise<CliResult<T>> {
  const proc = Bun.spawn(
    ['bun', 'src/cli.ts', command, '--format', 'json', ...options, url],
    { stdout: 'pipe', stderr: 'pipe', cwd: process.cwd() },
  )

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])
  const exitCode = await proc.exited

  let data: T | null = null
  let issues: Issue[] = []
  if (exitCode === 0 && stdout.trim()) {
    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (isJsonEnvelope<T>(parsed)) {
          data = parsed.result
          issues = parsed.issues
        } else {
          data = parsed as T
        }
      }
    } catch {
      // JSON parse failed, data stays null
    }
  }

  return { data, issues, exitCode, stderr, stdout }
}

/**
 * Run a semantic-kit CLI command with automatic caching and type inference.
 *
 * The command name determines the return type — no generics needed:
 *
 * ```ts
 * const { data } = await run(`ai ${url}`)           // data: AiResult
 * const { data } = await run(`screen-reader ${url}`) // data: ScreenReaderResult
 * const { data } = await run(`schema:compare ${url}`)// data: SchemaCompareResult
 * ```
 *
 * Identical calls within the same test file share a single CLI invocation.
 */
export function run<S extends string>(
  command: S,
): Promise<CliResult<ResultFor<S>>> {
  if (!cache.has(command)) {
    const { command: cmd, url, options } = parseCommandString(command)
    cache.set(command, exec(cmd, url, options))
  }
  return cache.get(command)! as Promise<CliResult<ResultFor<S>>>
}

// ============================================================================
// Legacy wrappers (deprecated — prefer `run()`)
// ============================================================================

export async function runCommand<T>(
  command: string,
  url: string,
  options: string[] = [],
): Promise<CliResult<T>> {
  return exec<T>(command, url, options)
}

export const runAi = (url: string, options: string[] = []) =>
  runCommand<AiResult>('ai', url, options)

export const runGoogle = (url: string, options: string[] = []) =>
  runCommand<GoogleResult>('google', url, options)

export const runStructure = (url: string, options: string[] = []) =>
  runCommand<StructureResult>('structure', url, options)

export const runSocial = (url: string, options: string[] = []) =>
  runCommand<SocialResult>('social', url, options)

export const runReadability = (url: string, options: string[] = []) =>
  runCommand<ReadabilityUtilityResult>('readability', url, options)

export const runReadabilityJs = (url: string, options: string[] = []) =>
  runCommand<ReadabilityJsResult>('readability:js', url, options)

export const runReadabilityCompare = (url: string, options: string[] = []) =>
  runCommand<ReadabilityCompareResult>('readability:compare', url, options)

export const runSchema = (url: string, options: string[] = []) =>
  runCommand<SchemaResult>('schema', url, options)

export const runSchemaJs = (url: string, options: string[] = []) =>
  runCommand<SchemaJsResult>('schema:js', url, options)

export const runSchemaCompare = (url: string, options: string[] = []) =>
  runCommand<SchemaCompareResult>('schema:compare', url, options)

export const runReader = (url: string, options: string[] = []) =>
  runCommand<ReaderResult>('reader', url, options)

export const runScreenReader = (url: string, options: string[] = []) =>
  runCommand<ScreenReaderResult>('screen-reader', url, options)
