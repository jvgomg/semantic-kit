import { useTerminalDimensions } from '@opentui/react'
import { RGBA } from '@opentui/core'
import { useSemanticColors } from '../../theme.js'

export interface ModalProps {
  children: React.ReactNode
  /** Called when clicking the overlay background (outside modal content) */
  onClose?: () => void
}

/**
 * Modal component with semi-transparent overlay.
 *
 * Uses RGBA opacity overlay (like opencode) rather than semantic color dimming.
 * The overlay is rgba(0, 0, 0, ~0.59) which dims background content visually.
 */
export const Modal = ({ children, onClose }: ModalProps) => {
  const colors = useSemanticColors()
  const { width, height } = useTerminalDimensions()

  return (
    <box
      position="absolute"
      width={width}
      height={height}
      left={0}
      top={0}
      justifyContent="center"
      alignItems="center"
      backgroundColor={RGBA.fromInts(0, 0, 0, 150)}
      onMouseUp={() => onClose?.()}
    >
      <box
        borderStyle="heavy"
        flexDirection="column"
        borderColor={colors.borderActive}
        backgroundColor={colors.backgroundPanel}
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
        paddingRight={2}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {children}
      </box>
    </box>
  )
}
