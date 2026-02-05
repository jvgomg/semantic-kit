/**
 * Modal state atoms for managing modal visibility.
 */
import { atom } from 'jotai'
import type { ModalType } from '../types.js'

/** Currently active modal (null = no modal) */
export const activeModalAtom = atom<ModalType>(null)

/** Derived: is any modal currently open? */
export const isModalOpenAtom = atom((get) => get(activeModalAtom) !== null)
