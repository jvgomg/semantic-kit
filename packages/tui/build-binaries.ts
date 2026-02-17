import {
  buildBunBundle,
  prepareBinariesDir,
  reportSizes,
} from '@webspecs/binary-build'
import pkg from './package.json'

// Note: System binaries are not supported for TUI.
// OpenTUI uses dynamic template literal imports and Bun.dlopen() for native modules,
// which cannot be bundled or embedded. See docs/binary-distribution.md for details.

const config = {
  entry: `${import.meta.dir}/src/index.tsx`,
  outdir: `${import.meta.dir}/binaries`,
  namePrefix: 'webspecs-tui',
  // OpenTUI and workspace deps must be external (native dynamic imports)
  external: [
    '@webspecs/cli',
    '@webspecs/core',
    '@opentui/core',
    '@opentui/react',
    'playwright',
    'playwright-core',
    '@axe-core/playwright',
  ],
  define: { __TARGET_BUN__: 'true' },
  packageName: '@webspecs/tui',
  version: pkg.version,
}

console.log(
  `\n🔨 Building binaries for ${config.packageName} v${config.version}\n`,
)

await prepareBinariesDir(config.outdir)
await buildBunBundle(config)
await reportSizes(config.outdir)
