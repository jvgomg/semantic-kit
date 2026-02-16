import { $ } from 'bun'
import pkg from './package.json'

await Bun.build({
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
})

// Generate type declarations
await $`tsc --project tsconfig.build.json`

console.log(`@webspecs/core v${pkg.version} built to ./dist/`)
