#!/usr/bin/env bun
/**
 * Test HTTP server for semantic-kit
 *
 * Serves HTML fixtures with configurable response behaviors
 * for testing semantic-kit commands.
 */

import { join, dirname } from 'path'
import { parseArgs } from 'util'
import { getMounts, type MountConfig } from './config'
import { discoverFixtures, serveFixture } from './lib/fixtures'
import { proxyRequest, matchesMount } from './lib/proxy'
import { generateSitemap } from './lib/sitemap'
import { SubprocessManager } from './lib/subprocess'

const __dirname = dirname(new URL(import.meta.url).pathname)

// Parse CLI arguments
const { values: args } = parseArgs({
  options: {
    port: { type: 'string', short: 'p', default: process.env['TEST_SERVER_PORT'] || '4000' },
    host: { type: 'string', short: 'h', default: 'localhost' },
    delay: { type: 'string', short: 'd', default: process.env['TEST_SERVER_DELAY'] || '3000' },
    'no-mount': { type: 'boolean', default: false },
    fixtures: { type: 'string', default: join(__dirname, 'fixtures') },
    verbose: { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
})

if (args.help) {
  console.log(`
semantic-kit test server

Usage: bun test-server/server.ts [options]

Options:
  -p, --port <number>     Port (default: 4000, env: TEST_SERVER_PORT)
  -h, --host <string>     Host (default: localhost)
  -d, --delay <ms>        Response delay in ms (default: 3000, env: TEST_SERVER_DELAY)
  --no-mount              Skip app mounting
  --fixtures <path>       Custom fixtures path
  --verbose               Log requests
  --help                  Show this help
`)
  process.exit(0)
}

const port = parseInt(args.port as string, 10)
const host = args.host as string
const defaultDelay = parseInt(args.delay as string, 10)
const mounts: MountConfig[] = getMounts(port)
const fixturesPath = args.fixtures as string
const verbose = args.verbose as boolean
const enableMounts = !args['no-mount']

// Subprocess manager for mounted apps
const subprocessManager = new SubprocessManager()

/**
 * Generate HTML index page listing all fixtures
 */
async function generateIndexPage(baseUrl: string): Promise<string> {
  const fixtures = await discoverFixtures(fixturesPath)

  const fixtureRows = fixtures
    .map((f) => {
      const description = f.meta?.description || ''
      const testCases = f.meta?.testCases?.join(', ') || ''
      return `    <tr>
      <td><a href="/${f.relativePath}">${f.relativePath}</a></td>
      <td>${escapeHtml(description)}</td>
      <td>${escapeHtml(testCases)}</td>
    </tr>`
    })
    .join('\n')

  const mountRows = mounts
    .map((m) => {
      return `    <tr>
      <td><a href="${m.path}">${m.path}</a></td>
      <td>${escapeHtml(m.command)}</td>
      <td>:${m.port}</td>
    </tr>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>semantic-kit Test Server</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
    a { color: #0066cc; }
    .section { margin: 2rem 0; }
    code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>semantic-kit Test Server</h1>
  <p>Base URL: <code>${baseUrl}</code></p>

  <div class="section">
    <h2>Fixtures</h2>
    <table>
      <thead>
        <tr>
          <th>Path</th>
          <th>Description</th>
          <th>Test Cases</th>
        </tr>
      </thead>
      <tbody>
${fixtureRows || '        <tr><td colspan="3">No fixtures found</td></tr>'}
      </tbody>
    </table>
  </div>

  ${
    mounts.length > 0
      ? `
  <div class="section">
    <h2>Mounted Apps</h2>
    <table>
      <thead>
        <tr>
          <th>Path</th>
          <th>Command</th>
          <th>Port</th>
        </tr>
      </thead>
      <tbody>
${mountRows}
      </tbody>
    </table>
  </div>
  `
      : ''
  }

  <div class="section">
    <h2>Special Endpoints</h2>
    <ul>
      <li><a href="/sitemap.xml">/sitemap.xml</a> - Dynamic sitemap</li>
    </ul>
  </div>

  <div class="section">
    <h2>Query Parameter Overrides</h2>
    <ul>
      <li><code>?delay=ms</code> - Response delay (overrides default: ${defaultDelay}ms)</li>
      <li><code>?status=code</code> - HTTP status code</li>
      <li><code>?header-Name=value</code> - Add header</li>
      <li><code>?redirect=url</code> - Force redirect</li>
      <li><code>?contentType=type</code> - Override content type</li>
    </ul>
  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Start mounted apps
async function startMounts(): Promise<void> {
  if (!enableMounts || mounts.length === 0) return

  console.log(`[server] Starting ${mounts.length} mounted app(s)...`)

  for (const mount of mounts) {
    try {
      await subprocessManager.spawn(mount.path, {
        command: mount.command,
        port: mount.port,
        readyPattern: mount.readyPattern,
        cwd: mount.cwd,
        timeout: mount.timeout,
      })
    } catch (error) {
      console.error(`[server] Failed to start mount ${mount.path}:`, error)
    }
  }
}

// Request handler
async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const baseUrl = `http://${host}:${port}`

  if (verbose) {
    console.log(`[${request.method}] ${url.pathname}`)
  }

  // Index page
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const html = await generateIndexPage(baseUrl)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Sitemap
  if (url.pathname === '/sitemap.xml') {
    const xml = await generateSitemap({ fixturesPath, baseUrl })
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  }

  // Check mounted apps
  for (const mount of mounts) {
    if (matchesMount(url.pathname, mount.path)) {
      const subprocess = subprocessManager.get(mount.path)
      if (!subprocess) {
        return new Response(`Mount ${mount.path} not running`, { status: 503 })
      }
      return proxyRequest(request, {
        targetHost: 'localhost',
        targetPort: mount.port,
        stripPrefix: mount.path,
        verbose,
      })
    }
  }

  // Try to serve fixture
  const fixtureResponse = await serveFixture(request, fixturesPath, { verbose, defaultDelay })
  if (fixtureResponse) {
    return fixtureResponse
  }

  // 404
  return new Response('Not Found', { status: 404 })
}

// Start server
async function main(): Promise<void> {
  await startMounts()

  const server = Bun.serve({
    port,
    hostname: host,
    fetch: handleRequest,
  })

  console.log(`[server] Listening on http://${host}:${port}`)
  console.log(`[server] Fixtures: ${fixturesPath}`)
  console.log(`[server] Default delay: ${defaultDelay}ms`)
  if (verbose) {
    console.log('[server] Verbose logging enabled')
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[server] Shutting down...')
    subprocessManager.killAll()
    server.stop()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\n[server] Shutting down...')
    subprocessManager.killAll()
    server.stop()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
