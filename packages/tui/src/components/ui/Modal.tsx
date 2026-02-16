import { useTerminalDimensions } from '@opentui/react'
import { useSemanticColors } from '../../theme.js'

export const Modal = ({ children }: { children: React.ReactNode }) => {
  const colors = useSemanticColors()
  const { width, height } = useTerminalDimensions()

  return (
    <box
      position="absolute"
      width={width}
      height={height}
      justifyContent="center"
      alignItems="center"
    >
      <box
        position="absolute"
        width={width}
        height={height}
        backgroundColor={colors.modalBackground}
        opacity={0.3}
      />
      <box
        borderStyle="heavy"
        flexDirection="column"
        borderColor={colors.modalBorder}
        backgroundColor={colors.modalBackground}
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
        paddingRight={2}
      >
        {children}
      </box>
    </box>
  )
}
