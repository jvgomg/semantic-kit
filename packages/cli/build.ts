import { $ } from 'bun'
import pkg from './package.json'

const isWatch = process.argv.includes('--watch')

const buildConfig: Bun.BuildConfig = {
  entrypoints: ['./src/cli.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  sourcemap: 'external',
  // External packages that should not be bundled
  external: [
    // Workspace dependencies
    '@webspecs/core',
    // Direct dependencies
    'commander',
    'diff',
    'emphasize',
    'marked',
    'marked-terminal',
    // Transitive from core
    '@axe-core/playwright',
    '@mozilla/readability',
    'axe-core',
    'html-validate',
    'jsdom',
    'linkedom',
    'prettier',
    'playwright',
    'playwright-core',
    'sitemap',
    'structured-data-testing-tool',
    'turndown',
    'web-auto-extractor',
    'yaml',
    'zod',
  ],
}

await Bun.build(buildConfig)

// Generate type declarations
// Clean tsbuildinfo to ensure fresh build
await $`rm -f tsconfig.build.tsbuildinfo`.quiet()
await $`tsc --project tsconfig.build.json`

console.log(`@webspecs/cli v${pkg.version} built to ./dist/`)

if (isWatch) {
  console.log('Watching for changes...')
}
