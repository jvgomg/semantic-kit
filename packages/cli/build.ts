import { $ } from 'bun'
import pkg from './package.json'

const isWatch = process.argv.includes('--watch')

// Discover all command source files so each one gets its own output JS file,
// satisfying the "./commands/*" wildcard in the exports field.
const commandGlob = new Bun.Glob('src/commands/**/*.ts')
const commandEntrypoints = (
  await Array.fromAsync(commandGlob.scan({ cwd: import.meta.dir, onlyFiles: true }))
)
  .filter((f) => !f.endsWith('.test.ts'))
  .map((f) => `./${f}`)

const buildConfig: Bun.BuildConfig = {
  entrypoints: ['./src/cli.ts', ...commandEntrypoints],
  outdir: './dist',
  root: './src', // strip the src/ prefix so outputs land at dist/commands/*, not dist/src/commands/*
  format: 'esm',
  target: 'node',
  sourcemap: 'external',
  splitting: true, // shared code across entrypoints goes into chunks
  // External packages that should not be bundled
  external: [
    // Workspace dependencies
    '@webspecs/core',
    // Direct dependencies
    'commander',
    'diff',
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
