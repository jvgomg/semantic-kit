/**
 * Silent TUI development watcher.
 *
 * Builds @webspecs/core and @webspecs/cli, then watches core for changes and
 * restarts the TUI process on each rebuild. The TUI process gets full terminal
 * ownership — no Turborepo status lines or orchestrator noise.
 *
 * @webspecs/cli only needs a one-time build because it externalises
 * @webspecs/core, so the TUI process picks up core changes at restart time
 * without needing to rebuild CLI.
 */

import { watch } from 'fs'
import { join, resolve, isAbsolute } from 'path'
import type { Subprocess } from 'bun'

const ROOT = join(import.meta.dir, '..')
const CORE_DIR = join(ROOT, 'packages/core')
const TUI_DIR = join(ROOT, 'packages/tui')
const CORE_DIST = join(CORE_DIR, 'dist/index.js')

// Forward CLI arguments to the TUI process, resolving relative paths to absolute.
// This is needed because the TUI runs from packages/tui, not the monorepo root.
const TUI_ARGS = process.argv.slice(2).map((arg, i, args) => {
  // Check if this arg follows --config or -c
  const prev = args[i - 1]
  if (prev === '--config' || prev === '-c') {
    // Resolve relative paths against cwd; absolute paths pass through unchanged
    return isAbsolute(arg) ? arg : resolve(process.cwd(), arg)
  }
  return arg
})

// ── Initial builds ───────────────────────────────────────────────────────────

async function buildPackage(dir: string, name: string): Promise<void> {
  process.stderr.write(`Building ${name}...\n`)
  const proc = Bun.spawn(['bun', 'run', 'build.ts'], {
    cwd: dir,
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const exitCode = await proc.exited
  if (exitCode !== 0) {
    const err = await new Response(proc.stderr).text()
    process.stderr.write(`${name} build failed:\n${err}\n`)
    process.exit(1)
  }
}

// Core must finish before CLI (CLI externalises core but tsc needs its types).
await buildPackage(CORE_DIR, '@webspecs/core')

// ── Background core watcher ──────────────────────────────────────────────────

// bun --watch restarts build.ts whenever source files change, silently.
const coreWatcher = Bun.spawn(['bun', '--watch', 'run', 'build.ts'], {
  cwd: CORE_DIR,
  stdout: 'pipe',
  stderr: 'pipe',
})

// ── TUI process ──────────────────────────────────────────────────────────────

let tuiProcess: Subprocess | null = null

function startTUI(): void {
  if (tuiProcess) {
    tuiProcess.kill()
  }
  // Use --preload to define __TARGET_BUN__ before any imports run.
  // This is needed because tsconfig paths resolve @webspecs/core to source,
  // not dist, so the build-time constant isn't defined.
  tuiProcess = Bun.spawn(
    ['bun', '--preload', './src/test-setup.ts', 'src/index.tsx', ...TUI_ARGS],
    {
      cwd: TUI_DIR,
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
    },
  )
}

startTUI()

// ── Watch core dist for rebuild completion ───────────────────────────────────
//
// When bun --watch finishes a rebuild of core, dist/index.js is updated.
// We debounce briefly to let the full write settle before restarting the TUI.

let restartTimer: Timer | null = null

watch(CORE_DIST, () => {
  if (restartTimer) clearTimeout(restartTimer)
  restartTimer = setTimeout(() => {
    restartTimer = null
    startTUI()
  }, 150)
})

// ── Cleanup on exit ──────────────────────────────────────────────────────────

function cleanup(): void {
  if (tuiProcess) tuiProcess.kill()
  coreWatcher.kill()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
