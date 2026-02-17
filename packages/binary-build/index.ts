import { existsSync } from 'fs'
import { mkdir, rm } from 'fs/promises'

export interface BinaryBuildConfig {
  /** Entry point, e.g. './src/cli.ts' */
  entry: string
  /** Output directory, e.g. './binaries' */
  outdir: string
  /** Binary filename prefix, e.g. 'webspecs' or 'webspecs-tui' */
  namePrefix: string
  /** External packages to exclude from bundle */
  external?: string[]
  /** Define constants to inject, e.g. { __TARGET_BUN__: 'true' } */
  define?: Record<string, string>
  /** Package name for log output */
  packageName: string
  /** Package version for log output */
  version: string
}

const COMPILED_TARGETS = [
  { target: 'bun-darwin-arm64', suffix: 'darwin-arm64' },
  { target: 'bun-darwin-x64', suffix: 'darwin-x64' },
  { target: 'bun-linux-x64', suffix: 'linux-x64' },
  { target: 'bun-linux-arm64', suffix: 'linux-arm64' },
  { target: 'bun-windows-x64', suffix: 'windows-x64', ext: '.exe' },
] as const

/**
 * Clean and recreate the binaries output directory.
 */
export async function prepareBinariesDir(outdir: string): Promise<void> {
  if (existsSync(outdir)) {
    await rm(outdir, { recursive: true })
  }
  await mkdir(outdir, { recursive: true })
}

/**
 * Build compiled system binaries for all 5 platforms.
 * Each binary embeds the Bun runtime and bundles all non-external dependencies.
 */
export async function buildSystemBinaries(
  config: BinaryBuildConfig,
): Promise<void> {
  const { entry, outdir, namePrefix, external = [], define } = config

  console.log('Building compiled binaries (standalone executables)...')

  for (const { target, suffix, ext = '' } of COMPILED_TARGETS) {
    const outfile = `${namePrefix}-${suffix}${ext}`
    console.log(`  • ${outfile} (${target})`)

    await Bun.build({
      entrypoints: [entry],
      outdir,
      target,
      compile: { target, outfile },
      external,
      ...(define ? { define } : {}),
    })
  }
}

/**
 * Build a universal Bun bundle (requires Bun runtime at run time).
 * Smaller than compiled binaries; works on any platform.
 */
export async function buildBunBundle(
  config: BinaryBuildConfig,
): Promise<void> {
  const { entry, outdir, namePrefix, external = [], define } = config
  const outfile = `${namePrefix}-bun`

  console.log('\nBuilding universal Bun bundle (requires Bun runtime)...')
  console.log(`  • ${outfile}`)

  const result = await Bun.build({
    entrypoints: [entry],
    target: 'bun',
    external,
    minify: true,
    ...(define ? { define } : {}),
  })

  if (!result.success) {
    console.error('Failed to build Bun bundle:')
    for (const log of result.logs) {
      console.error(log)
    }
    process.exit(1)
  }

  await Bun.write(`${outdir}/${outfile}`, result.outputs[0])
}

/**
 * Report the sizes of all files in the binaries directory.
 */
export async function reportSizes(outdir: string): Promise<void> {
  console.log('\n✅ Build complete!\n')
  console.log('Output files:')

  const files = await Array.fromAsync(new Bun.Glob('*').scan({ cwd: outdir }))

  let totalBytes = 0
  for (const file of files.sort()) {
    const size = await Bun.file(`${outdir}/${file}`).size
    totalBytes += size
    const sizeMB = (size / 1024 / 1024).toFixed(2)
    console.log(`  ${file.padEnd(35)} ${sizeMB.padStart(8)} MB`)
  }

  const totalMB = (totalBytes / 1024 / 1024).toFixed(2)
  console.log(`\nTotal size: ${totalMB} MB`)
  console.log(`Location: ${outdir}/\n`)
}
