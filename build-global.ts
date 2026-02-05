import { resolve } from 'node:path'
import { $ } from 'bun'

const stubsDir = resolve(import.meta.dir, 'stubs')

// Build standalone executable using Bun.build with module aliases
// This replaces optional dependencies with empty stubs so they can be bundled
const result = await Bun.build({
  entrypoints: ['./src/cli.ts'],
  outdir: './dist',
  naming: 'semantic-kit-temp.js',
  target: 'bun',
  minify: true,
  // Replace optional dependencies with stub modules
  plugins: [
    {
      name: 'stub-optional-deps',
      setup(build) {
        // Stub react-devtools-core (optional Ink devtools)
        build.onResolve({ filter: /^react-devtools-core$/ }, () => ({
          path: resolve(stubsDir, 'react-devtools-core.js'),
        }))
        // Stub electron (optional Playwright loader)
        build.onResolve({ filter: /^electron$/ }, () => ({
          path: resolve(stubsDir, 'electron.js'),
        }))
      },
    },
  ],
})

if (!result.success) {
  console.error('Build failed:')
  for (const log of result.logs) {
    console.error(log)
  }
  process.exit(1)
}

// Now compile the bundled output into a standalone executable
await $`bun build --compile ./dist/semantic-kit-temp.js --outfile ./dist/semantic-kit`

// Clean up temp file
await $`rm ./dist/semantic-kit-temp.js`

console.log('Built: ./dist/semantic-kit')
console.log('')
console.log('To install globally, run:')
console.log('  cp ./dist/semantic-kit ~/.local/bin/semantic-kit')
console.log('')
console.log('Or create a symlink to always use the latest build:')
console.log('  ln -sf $(pwd)/dist/semantic-kit ~/.local/bin/semantic-kit')
