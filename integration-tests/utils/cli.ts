/**
 * CLI test utilities for running semantic-kit commands
 */

import type { AiResult, StructureResult } from '../../src/lib/results.js'

interface CliResult<T> {
  data: T | null
  exitCode: number
  stderr: string
  stdout: string
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
  if (exitCode === 0 && stdout.trim()) {
    try {
      data = JSON.parse(stdout)
    } catch {
      // JSON parse failed, data stays null
    }
  }

  return {
    data,
    exitCode,
    stderr,
    stdout,
  }
}

// Type-safe command runners
export const runAi = (url: string, options: string[] = []) =>
  runCommand<AiResult>('ai', url, options)

export const runStructure = (url: string, options: string[] = []) =>
  runCommand<StructureResult>('structure', url, options)
