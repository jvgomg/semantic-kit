/**
 * Global setup for integration tests
 * Configured via bunfig.toml preload
 */

import { afterAll } from 'bun:test'
import { startTestServer, stopTestServer } from './utils/server.js'

// Start server before all tests
await startTestServer()

// Stop server after all tests
afterAll(() => {
  stopTestServer()
})
