# Binary Distribution

This document covers the binary build strategy for `@webspecs/cli` and `@webspecs/tui`, including the limitations that drive the current approach for each package.

## Overview

| Package | System Binaries | Bun Bundle |
|---------|----------------|------------|
| `@webspecs/cli` | ✅ 5 platforms | ✅ |
| `@webspecs/tui` | ❌ (see below) | ✅ |

## CLI: System Binaries + Bun Bundle

The CLI package bundles cleanly into standalone executables because it has no dynamic native module imports. Most dependencies are bundled directly into the binary; only Playwright is externalized (it requires a separate browser install regardless).

**Outputs** (`packages/cli/binaries/`):
- `webspecs-darwin-arm64` (~75MB)
- `webspecs-darwin-x64` (~79MB)
- `webspecs-linux-x64` (~115MB)
- `webspecs-linux-arm64` (~112MB)
- `webspecs-windows-x64.exe` (~126MB)
- `webspecs-bun` (~10MB — requires Bun runtime)

## TUI: Bun Bundle Only

The TUI package cannot be compiled into standalone system binaries due to how OpenTUI loads its native layer.

**Output** (`packages/tui/binaries/`):
- `webspecs-tui-bun` (~70KB — requires Bun + OpenTUI installed)

### Why OpenTUI Can't Be Bundled

OpenTUI uses a two-layer architecture:

**1. TypeScript layer** (`@opentui/core`, `@opentui/react`)
The main package code in TypeScript/JavaScript.

**2. Native layer** — platform-specific packages with Zig-compiled native libraries:
- `@opentui/core-darwin-arm64` (macOS ARM, ~800KB)
- `@opentui/core-darwin-x64` (macOS Intel)
- `@opentui/core-linux-x64`
- `@opentui/core-linux-arm64`
- `@opentui/core-win32-x64`
- `@opentui/core-win32-arm64`

At runtime, OpenTUI bridges these layers with:

```javascript
// Dynamic import with template literal — cannot be statically analyzed
const mod = await import(`@opentui/core-${process.platform}-${process.arch}/index.ts`)

// Loads the native .dylib/.so/.dll via Bun's FFI
Bun.dlopen(nativeLibPath, ...)
```

This pattern has two properties that make bundling impossible:

1. **Template literal dynamic import**: Bundlers (including Bun) cannot statically resolve `\`@opentui/core-${platform}-${arch}\`` because the platform and arch are runtime values. Bun errors with `Could not resolve: "@opentui/core-darwin-x64/index.ts"`.

2. **Native library via `Bun.dlopen()`**: The `.dylib`/`.so`/`.dll` files must exist as separate files on disk at runtime — they cannot be embedded. This is a Bun limitation for the `--compile` target (see [bun#14676](https://github.com/oven-sh/bun/issues/14676)).

### What Would Need to Change

For TUI to support system binaries, one of the following would need to happen:

**Option A: OpenTUI refactors native loading** (upstream change)
Replace the dynamic template literal import with a pattern bundlers can statically analyze, and switch from `Bun.dlopen()` to a bundler-friendly native module approach. This would require changes to OpenTUI itself.

**Option B: Bun adds embedded native library support** (toolchain change)
Bun would need to support embedding platform-specific native libraries and their dynamic loaders inside a `--compile` binary. Tracked in [bun#15374](https://github.com/oven-sh/bun/issues/15374).

**Option C: Ship binary + node_modules bundle** (packaging change)
Distribute the binary alongside a minimal `node_modules/` containing only the OpenTUI packages and the platform-specific native package. This is less "standalone" but works today — it's effectively what the Bun bundle approach achieves.

### Current Approach

The TUI Bun bundle (`webspecs-tui-bun`) is the recommended distribution format. Since OpenTUI is Bun-native and TUI users are already in a Bun environment, requiring Bun as a runtime is a natural fit.

Distribution requirements for the Bun bundle:
- Bun runtime installed
- `@opentui/core` and `@opentui/react` available (installed via `bun install`)
- `@webspecs/cli` available (for the analysis commands)
- Playwright installed separately for `:js` and `:compare` commands

## Build Commands

```bash
# Build all binaries for all platforms (CLI system + bun, TUI bun)
bun run build:binaries

# Build for current platform (CLI only — TUI has no local variant)
bun run build:binaries:local
```

## Shared Build Package

Binary build logic is centralized in `packages/binary-build` (`@webspecs/binary-build`). This private workspace package exports utilities consumed by both CLI and TUI:

- `buildSystemBinaries(config)` — Compiles for all 5 platforms (CLI only)
- `buildBunBundle(config)` — Builds universal Bun bundle
- `reportSizes(outdir)` — Reports binary sizes after build
- `prepareBinariesDir(dir)` — Cleans and recreates output directory
