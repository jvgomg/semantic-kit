import { useTerminalDimensions } from '@opentui/react'
import { ColorModeContext, useSemanticColors } from '../../theme.js'

export const Modal = ({ children }: { children: React.ReactNode }) => {
  const colors = useSemanticColors()
  const { width, height } = useTerminalDimensions()

  return (
    <ColorModeContext.Provider value="normal">
      <box
        position="absolute"
        width={width}
        height={height}
        justifyContent="center"
        alignItems="center"
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
        >
          {children}
        </box>
      </box>
    </ColorModeContext.Provider>
  )
}
