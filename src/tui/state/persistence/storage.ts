/**
 * File-based storage for TUI state persistence.
 *
 * Uses Bun APIs for filesystem operations with throttled writes.
 */
import { createHash } from 'crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { homedir } from 'os'
import { join } from 'path'
import {
  DEFAULT_PERSISTED_STATE,
  PERSISTED_STATE_VERSION,
  type PersistedState,
} from './types.js'

/** Storage directory under user's home */
const STORAGE_DIR = join(homedir(), '.semantic-kit', 'tui-sessions')

/** Throttle delay for writes (ms) */
const WRITE_DELAY_MS = 500

/**
 * Generate a storage key from the initial URL.
 * Different initial URLs get different storage files.
 */
function getStorageKey(initialUrl: string | undefined): string {
  const input = initialUrl?.trim() || '__blank__'
  return createHash('sha256').update(input).digest('hex').slice(0, 12)
}

/**
 * Get the full path to the storage file for a given key.
 */
function getStoragePath(key: string): string {
  return join(STORAGE_DIR, `${key}.json`)
}

/**
 * Load persisted state from disk.
 * Returns default state if file doesn't exist or is invalid.
 */
export async function loadPersistedState(
  initialUrl: string | undefined,
): Promise<PersistedState> {
  const key = getStorageKey(initialUrl)
  const path = getStoragePath(key)

  try {
    const file = Bun.file(path)

    // Check if file exists
    if (!(await file.exists())) {
      return { ...DEFAULT_PERSISTED_STATE }
    }

    // Read and parse JSON
    const data = (await file.json()) as PersistedState

    // Validate version - if mismatch, return defaults
    if (data.version !== PERSISTED_STATE_VERSION) {
      return { ...DEFAULT_PERSISTED_STATE }
    }

    return data
  } catch {
    // File doesn't exist or is invalid JSON
    return { ...DEFAULT_PERSISTED_STATE }
  }
}

/** Pending state to write */
let pendingState: PersistedState | null = null

/** Write timeout handle */
let writeTimeout: Timer | null = null

/** Current storage path (set when writer is created) */
let currentStoragePath: string | null = null

/**
 * Create a throttled writer for the given initial URL.
 * Call this once at startup.
 */
export function createPersistedStateWriter(
  initialUrl: string | undefined,
): (state: PersistedState) => void {
  const key = getStorageKey(initialUrl)
  currentStoragePath = getStoragePath(key)

  return (state: PersistedState) => {
    pendingState = state

    // Clear existing timeout
    if (writeTimeout) {
      clearTimeout(writeTimeout)
    }

    // Schedule write
    writeTimeout = setTimeout(() => {
      if (pendingState && currentStoragePath) {
        writeStateToDisk(currentStoragePath, pendingState)
        pendingState = null
      }
    }, WRITE_DELAY_MS)
  }
}

/**
 * Write state to disk.
 */
async function writeStateToDisk(
  path: string,
  state: PersistedState,
): Promise<void> {
  try {
    // Ensure directory exists
    await mkdir(STORAGE_DIR, { recursive: true })

    // Write the state file
    await Bun.write(path, JSON.stringify(state, null, 2))
  } catch {
    // Silently fail - persistence is best-effort
  }
}

/**
 * Flush any pending writes immediately (sync).
 * Must be sync to guarantee completion before process exit.
 */
export function flushPersistedState(): void {
  if (writeTimeout) {
    clearTimeout(writeTimeout)
    writeTimeout = null
  }
  if (pendingState && currentStoragePath) {
    try {
      mkdirSync(STORAGE_DIR, { recursive: true })
      writeFileSync(currentStoragePath, JSON.stringify(pendingState, null, 2))
    } catch {
      // Silently fail
    }
    pendingState = null
  }
}
