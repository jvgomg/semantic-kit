/**
 * Test setup - defines build-time constants for test environment.
 * This file should be imported/preloaded before running tests.
 */

// Define build-time constant that's normally injected by build.ts
;(globalThis as unknown as Record<string, unknown>).__TARGET_BUN__ = true
