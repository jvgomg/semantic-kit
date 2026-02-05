/**
 * Global setup for integration tests
 * Configured via bunfig.toml preload
 */

import { startTestServer, stopTestServer } from './utils/server.js'

// Start server before all tests
await startTestServer()

// Cleanup when process exits
process.on('beforeExit', () => {
  stopTestServer()
})
