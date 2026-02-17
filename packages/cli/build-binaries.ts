import {
  buildBunBundle,
  buildSystemBinaries,
  prepareBinariesDir,
  reportSizes,
} from '@webspecs/binary-build'
import pkg from './package.json'

const config = {
  entry: `${import.meta.dir}/src/cli.ts`,
  outdir: `${import.meta.dir}/binaries`,
  namePrefix: 'webspecs',
  // Playwright requires separate browser install regardless, keep it external
  external: ['playwright', 'playwright-core', '@axe-core/playwright'],
  packageName: '@webspecs/cli',
  version: pkg.version,
}

console.log(
  `\n🔨 Building binaries for ${config.packageName} v${config.version}\n`,
)

await prepareBinariesDir(config.outdir)
await buildSystemBinaries(config)
await buildBunBundle(config)
await reportSizes(config.outdir)
