import { $ } from 'bun'
import pkg from './package.json'

await Bun.build({
  entrypoints: ['./src/cli.ts', './src/index.ts'],
  outdir: './dist',
  format: 'esm',
  target: 'node',
  sourcemap: 'external',
  define: {
    __VERSION__: JSON.stringify(pkg.version),
    __TARGET_BUN__: 'false',
  },
  // External packages that should not be bundled
  external: [
    // All dependencies should be external - they're installed via npm
    '@axe-core/playwright',
    '@mozilla/readability',
    '@opentui/core',
    '@opentui/react',
    'axe-core',
    'commander',
    'diff',
    'emphasize',
    'html-validate',
    'jotai',
    'jotai-effect',
    'jotai-family',
    'jotai-optics',
    'jsdom',
    'linkedom',
    'marked',
    'marked-terminal',
    'optics-ts',
    'prettier',
    'react',
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

// Add shebang for npx support
const cliPath = './dist/cli.js'
const cliContent = await Bun.file(cliPath).text()
if (!cliContent.startsWith('#!/')) {
  await Bun.write(cliPath, '#!/usr/bin/env node\n' + cliContent)
}

console.log('Build complete: ./dist/')
