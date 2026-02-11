/**
 * CLI test utilities for running semantic-kit commands
 */

import type { ReadabilityCompareResult } from '../../src/commands/readability/types.js'
import type { SocialResult } from '../../src/commands/social/types.js'
import type { Issue } from '../../src/lib/cli-formatting/index.js'
import type { JsonEnvelope } from '../../src/lib/json-envelope.js'
import type { AiResult, GoogleResult, ReadabilityJsResult, ReadabilityUtilityResult, StructureResult } from '../../src/lib/results.js'

interface CliResult<T> {
  data: T | null
  issues: Issue[]
  exitCode: number
  stderr: string
  stdout: string
}

/**
 * Type guard to check if parsed JSON is a JsonEnvelope
 */
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
 * Run any semantic-kit command with JSON output
 */
export async function runCommand<T>(
  command: string,
  url: string,
  options: string[] = [],
): Promise<CliResult<T>> {
  // Run bun directly for clean JSON output
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
      // Extract JSON from stdout (may include splash text before JSON)
      const jsonMatch = stdout.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        // Handle new JsonEnvelope format
        if (isJsonEnvelope<T>(parsed)) {
          data = parsed.result
          issues = parsed.issues
        } else {
          // Fallback for legacy format (if any)
          data = parsed as T
        }
      }
    } catch {
      // JSON parse failed, data stays null
    }
  }

  return {
    data,
    issues,
    exitCode,
    stderr,
    stdout,
  }
}

// Type-safe command runners
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
