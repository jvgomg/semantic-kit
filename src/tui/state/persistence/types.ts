/**
 * Type definitions for persisted TUI state.
 *
 * To add new persisted state:
 * 1. Add the field to PersistedState interface
 * 2. Add default value to DEFAULT_PERSISTED_STATE
 * 3. Add restoration logic in store.ts createPersistedStore()
 * 4. Add tracking in effect.ts persistStateEffect (get the atom)
 */
import type { ModalType } from '../types.js'

/**
 * Schema version for migration support.
 * Increment when making breaking changes to the schema.
 */
export const PERSISTED_STATE_VERSION = 1

/**
 * Per-view UI state that gets persisted.
 */
export interface PersistedViewState {
  /** Section expanded states: sectionId -> boolean */
  expanded: Record<string, boolean>
}

/**
 * The complete persisted state schema.
 */
export interface PersistedState {
  /** Schema version for migration support */
  version: typeof PERSISTED_STATE_VERSION
  /** Current URL being analyzed */
  url: string
  /** Active menu/view index */
  activeMenuIndex: number
  /** Active modal (null if none) */
  activeModal: ModalType
  /** Per-view state: viewId -> PersistedViewState */
  views: Record<string, PersistedViewState>
}

/**
 * Default values for persisted state.
 * Used when no persisted state exists or on schema mismatch.
 */
export const DEFAULT_PERSISTED_STATE: PersistedState = {
  version: PERSISTED_STATE_VERSION,
  url: '',
  activeMenuIndex: 0,
  activeModal: null,
  views: {},
}
