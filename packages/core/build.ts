import { $ } from 'bun'
import pkg from './package.json'

const isWatch = process.argv.includes('--watch')

const buildConfig: Bun.BuildConfig = {
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  sourcemap: 'external',
  define: {
    __TARGET_BUN__: 'false',
  },
  // External packages that should not be bundled
  external: [
    '@axe-core/playwright',
    '@mozilla/readability',
    'axe-core',
    'html-validate',
    'jsdom',
    'linkedom',
    'prettier',
    'sitemap',
    'structured-data-testing-tool',
    'turndown',
    'web-auto-extractor',
    'yaml',
    'zod',
    // Peer dependencies
    'playwright',
    'playwright-core',
  ],
}

await Bun.build(buildConfig)

// Generate type declarations
// Clean tsbuildinfo to ensure fresh build
await $`rm -f tsconfig.build.tsbuildinfo`.quiet()
await $`tsc --project tsconfig.build.json`

console.log(`@webspecs/core v${pkg.version} built to ./dist/`)

if (isWatch) {
  console.log('Watching for changes...')
}
