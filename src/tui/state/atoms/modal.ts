/**
 * Modal state management.
 */
import { atom } from 'jotai'
import type { ModalType } from '../types.js'

/**
 * The currently active modal, or null if no modal is open.
 */
export const activeModalAtom = atom<ModalType>(null)

/**
 * Derived atom: whether any modal is currently open.
 */
export const isModalOpenAtom = atom((get) => get(activeModalAtom) !== null)
