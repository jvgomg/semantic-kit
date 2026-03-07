import { $ } from 'bun'
import pkg from './package.json'

const isWatch = process.argv.includes('--watch')

const buildConfig: Bun.BuildConfig = {
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  sourcemap: 'external',
  // External packages that should not be bundled
  external: ['chalk', 'jimp'],
}

await Bun.build(buildConfig)

// Generate type declarations
// Clean tsbuildinfo to ensure fresh build
await $`rm -f tsconfig.build.tsbuildinfo`.quiet()
await $`tsc --project tsconfig.build.json`

console.log(`@webspecs/image-ascii v${pkg.version} built to ./dist/`)

if (isWatch) {
  console.log('Watching for changes...')
}
