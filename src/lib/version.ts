/**
 * Centralized version management.
 *
 * - Build phase: __VERSION__ is injected via Bun.build() define option
 * - Dev phase: reads from package.json and appends '-dev'
 */

// Declared by Bun.build() define option - replaced at build time
declare const __VERSION__: string | undefined

function getVersion(): string {
  // Build phase: __VERSION__ is replaced with the actual version string
  if (typeof __VERSION__ !== 'undefined') {
    return __VERSION__
  }

  // Dev phase: read from package.json dynamically
  // This code path is eliminated during build (dead code elimination)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pkg = require('../../package.json') as { version: string }
  return `${pkg.version}-dev`
}

export const VERSION = getVersion()
