/**
 * Focus tracking atom for knowing which region is currently focused.
 */
import { atom } from 'jotai'
import type { FocusRegion } from '../types.js'

/** Currently focused region */
export const focusedRegionAtom = atom<FocusRegion>('url')
