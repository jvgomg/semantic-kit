import { $ } from 'bun'
import pkg from './package.json'

const isWatch = process.argv.includes('--watch')

const buildConfig: Bun.BuildConfig = {
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
}

await Bun.build(buildConfig)

// Generate type declarations
// Clean tsbuildinfo to ensure fresh build
await $`rm -f tsconfig.build.tsbuildinfo`.quiet()
await $`tsc --project tsconfig.build.json`

console.log(`@webspecs/tui v${pkg.version} built to ./dist/`)

if (isWatch) {
  console.log('Watching for changes...')
}
