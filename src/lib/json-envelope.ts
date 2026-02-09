/**
 * Standardized JSON envelope for all command outputs.
 * Provides consistent structure for programmatic consumption.
 */

import type { Issue } from './cli-formatting/index.js'
import { VERSION } from './version.js'

// ============================================================================
// Types
// ============================================================================

/**
 * Metadata about the command that was run.
 */
export interface CommandInfo {
  /** The command name (e.g., 'ai', 'structure', 'validate:html') */
  name: string
  /** The target URL or file path */
  target: string
  /** Timestamp when the command was run (ISO 8601) */
  timestamp: string
  /** Duration in milliseconds */
  durationMs: number
  /** semantic-kit version */
  version: string
}

/**
 * Standardized JSON envelope for all command outputs.
 * T is the command-specific result type.
 */
export interface JsonEnvelope<T> {
  command: CommandInfo
  result: T
  issues: Issue[]
}

// ============================================================================
// Factory Options
// ============================================================================

/**
 * Options for creating a JSON envelope.
 */
export interface CreateEnvelopeOptions<T> {
  commandName: string
  target: string
  durationMs: number
  result: T
  issues?: Issue[]
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a standardized JSON envelope for command output.
 *
 * @param options - Envelope creation options
 * @returns A JSON envelope containing command metadata, result, and issues
 *
 * @example
 * ```typescript
 * const envelope = createJsonEnvelope({
 *   commandName: 'ai',
 *   target: 'https://example.com',
 *   durationMs: 1234,
 *   result: { title: 'Example', markdown: '...' },
 *   issues: [{ type: 'warning', severity: 'high', title: 'Issue', description: '...' }]
 * })
 * ```
 */
export function createJsonEnvelope<T>(
  options: CreateEnvelopeOptions<T>,
): JsonEnvelope<T> {
  return {
    command: {
      name: options.commandName,
      target: options.target,
      timestamp: new Date().toISOString(),
      durationMs: options.durationMs,
      version: VERSION,
    },
    result: options.result,
    issues: options.issues ?? [],
  }
}

/**
 * Create and stringify a JSON envelope with pretty printing.
 *
 * @param options - Envelope creation options
 * @returns Pretty-printed JSON string
 *
 * @example
 * ```typescript
 * const json = formatJsonEnvelope({
 *   commandName: 'structure',
 *   target: 'https://example.com',
 *   durationMs: 567,
 *   result: { headings: [...] }
 * })
 * console.log(json)
 * ```
 */
export function formatJsonEnvelope<T>(
  options: CreateEnvelopeOptions<T>,
): string {
  return JSON.stringify(createJsonEnvelope(options), null, 2)
}
