/**
 * Test server lifecycle management for integration tests
 */

import type { Subprocess } from 'bun'

const TEST_PORT = 4050
let serverProcess: Subprocess | null = null
let serverReadyPromise: Promise<void> | null = null

export async function startTestServer(): Promise<void> {
  // If server is starting or running, return the existing promise
  if (serverReadyPromise) {
    return serverReadyPromise
  }

  // Create a new promise that all callers will await
  serverReadyPromise = (async () => {
    // Use 'inherit' so subprocess output flows to terminal and doesn't block
    serverProcess = Bun.spawn(['bun', 'run', 'test-server'], {
      stdout: 'inherit',
      stderr: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, TEST_SERVER_PORT: String(TEST_PORT) },
    })

    // Wait for main server to be ready
    await waitForReady(`http://localhost:${TEST_PORT}/`)

    // Wait for Next.js mount to be ready
    await waitForReady(`http://localhost:${TEST_PORT}/nextjs/`, 90000)
  })()

  return serverReadyPromise
}

async function waitForReady(url: string, timeout = 30000): Promise<void> {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // not ready yet
    }
    await Bun.sleep(500)
  }
  throw new Error(`Server not ready at ${url} within ${timeout}ms`)
}

export function stopTestServer(): void {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
  serverReadyPromise = null
}

export function getBaseUrl(): string {
  return `http://localhost:${TEST_PORT}`
}
