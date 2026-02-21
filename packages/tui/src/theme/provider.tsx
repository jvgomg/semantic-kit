/**
 * Color Mode Provider
 *
 * Provides a React context for switching between normal and dimmed color modes.
 * Used to dim content behind modals without using opacity overlays.
 *
 * This is part of the new OpenCode-style theme system.
 */

import { createContext, useContext, type ReactNode } from 'react'
import type { ColorMode } from './types.js'

/**
 * Context for the current color mode.
 * Defaults to 'normal' for standard rendering.
 */
export const ColorModeContext = createContext<ColorMode>('normal')

/**
 * Hook to get the current color mode from context.
 * Returns 'normal' or 'dimmed'.
 */
export function useColorModeContext(): ColorMode {
  return useContext(ColorModeContext)
}

/**
 * Props for the ColorModeProvider component.
 */
export interface ColorModeProviderProps {
  /** The color mode to provide to children */
  mode: ColorMode
  /** Child components */
  children: ReactNode
}

/**
 * Provider component for setting the color mode in a subtree.
 *
 * @example
 * // Used by Modal to dim background content
 * function Modal({ children }) {
 *   return (
 *     <>
 *       <ColorModeProvider mode="dimmed">
 *         <BackgroundContent />
 *       </ColorModeProvider>
 *       <ModalContent>{children}</ModalContent>
 *     </>
 *   )
 * }
 */
export function ColorModeProvider({
  mode,
  children,
}: ColorModeProviderProps): ReactNode {
  return (
    <ColorModeContext.Provider value={mode}>
      {children}
    </ColorModeContext.Provider>
  )
}
