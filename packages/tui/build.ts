import { $ } from 'bun'
import pkg from './package.json'

await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  format: 'esm',
  target: 'bun',
  sourcemap: 'external',
  define: {
    __TARGET_BUN__: 'true',
  },
  // External packages that should not be bundled
  external: [
    // Workspace dependencies
    '@webspecs/core',
    '@webspecs/cli',
    // OpenTUI (Bun-native)
    '@opentui/core',
    '@opentui/react',
    // React
    'react',
    // State management
    'jotai',
    'jotai-effect',
    'jotai-family',
    'jotai-optics',
    'optics-ts',
    // Markdown processing
    'marked',
    'marked-terminal',
    'emphasize',
    // Diff
    'diff',
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
})

// Generate type declarations
await $`tsc --project tsconfig.build.json`

console.log(`@webspecs/tui v${pkg.version} built to ./dist/`)
