import { $ } from 'bun'

await Bun.build({
  entrypoints: ['./src/cli.ts', './src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'bun',
  sourcemap: 'external',
  // External packages that should not be bundled
  external: [
    // All dependencies should be external - they're installed via bun
    '@axe-core/playwright',
    '@mozilla/readability',
    'axe-core',
    'commander',
    'emphasize',
    'html-validate',
    'ink',
    'ink-text-input',
    'jsdom',
    'linkedom',
    'prettier',
    'react',
    'structured-data-testing-tool',
    'turndown',
    'web-auto-extractor',
    // Peer dependencies
    'playwright',
    'playwright-core',
  ],
})

// Generate type declarations
await $`tsc --emitDeclarationOnly --declaration --outDir dist`
