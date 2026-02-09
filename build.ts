import { $ } from 'bun'
import pkg from './package.json'

await Bun.build({
  entrypoints: ['./src/cli.ts', './src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'bun',
  sourcemap: 'external',
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
  // External packages that should not be bundled
  external: [
    // All dependencies should be external - they're installed via bun
    '@axe-core/playwright',
    '@mozilla/readability',
    '@opentui/core',
    '@opentui/react',
    'axe-core',
    'commander',
    'emphasize',
    'html-validate',
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
