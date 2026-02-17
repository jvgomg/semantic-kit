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

import { watch } from "fs";
import { join } from "path";
import type { Subprocess } from "bun";

const ROOT = join(import.meta.dir, "..");
const CORE_DIR = join(ROOT, "packages/core");
const CLI_DIR = join(ROOT, "packages/cli");
const TUI_DIR = join(ROOT, "packages/tui");
const CORE_DIST = join(CORE_DIR, "dist/index.js");

// ── Initial builds ───────────────────────────────────────────────────────────

async function buildPackage(dir: string, name: string): Promise<void> {
  process.stderr.write(`Building ${name}...\n`);
  const proc = Bun.spawn(["bun", "run", "build.ts"], {
    cwd: dir,
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const err = await new Response(proc.stderr).text();
    process.stderr.write(`${name} build failed:\n${err}\n`);
    process.exit(1);
  }
}

// Core must finish before CLI (CLI externalises core but tsc needs its types).
await buildPackage(CORE_DIR, "@webspecs/core");
await buildPackage(CLI_DIR, "@webspecs/cli");

// ── Background core watcher ──────────────────────────────────────────────────

// bun --watch restarts build.ts whenever source files change, silently.
const coreWatcher = Bun.spawn(["bun", "--watch", "run", "build.ts"], {
  cwd: CORE_DIR,
  stdout: "pipe",
  stderr: "pipe",
});

// ── TUI process ──────────────────────────────────────────────────────────────

let tuiProcess: Subprocess | null = null;

function startTUI(): void {
  if (tuiProcess) {
    tuiProcess.kill();
  }
  tuiProcess = Bun.spawn(["bun", "src/index.tsx"], {
    cwd: TUI_DIR,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
}

startTUI();

// ── Watch core dist for rebuild completion ───────────────────────────────────
//
// When bun --watch finishes a rebuild of core, dist/index.js is updated.
// We debounce briefly to let the full write settle before restarting the TUI.

let restartTimer: Timer | null = null;

watch(CORE_DIST, () => {
  if (restartTimer) clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restartTimer = null;
    startTUI();
  }, 150);
});

// ── Cleanup on exit ──────────────────────────────────────────────────────────

function cleanup(): void {
  if (tuiProcess) tuiProcess.kill();
  coreWatcher.kill();
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
