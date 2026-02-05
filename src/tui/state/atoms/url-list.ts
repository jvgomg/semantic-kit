/**
 * URL list modal state atoms.
 */
import { atom } from 'jotai'
import type { UrlListTab } from '../types.js'

/** Selected index in the recent URLs list */
export const urlListIndexAtom = atom(0)

/** Currently active tab in the URL list modal */
export const urlListActiveTabAtom = atom<UrlListTab>('recent')
