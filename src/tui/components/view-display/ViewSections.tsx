/**
 * ViewSections component for the expandable sections framework.
 *
 * Manages a list of sections with:
 * - SectionRegistryProvider for self-registering sections
 * - Keyboard navigation (up/down, expand/collapse)
 * - Focus management
 * - Selection tracking
 *
 * Renamed from SectionContainer to better reflect its role in view-display.
 */
import { type ReactNode } from 'react'
import { useKeyboard } from '@opentui/react'
import {
  SectionRegistryProvider,
  useViewSections,
} from '../../state/sections/index.js'
import { useFocus } from '../../state/index.js'

export interface ViewSectionsProps {
  /** Section components */
  children: ReactNode
  /** Height for the container (fills available space if not provided) */
  height?: number
}

/**
 * Inner component that uses the section registry context.
 */
function ViewSectionsInner({
  children,
  height,
}: ViewSectionsProps): ReactNode {
  // Get focus state to determine if keyboard input is active
  const { isInputActive } = useFocus('main')

  // Get section state and actions from the hook
  const {
    selectNext,
    selectPrev,
    toggleSelected,
    expandSelected,
    collapseSelected,
    expandAll,
    collapseAll,
    focusDepth,
  } = useViewSections()

  // Keyboard handling
  useKeyboard((key) => {
    if (!isInputActive) return

    // At depth 0, handle section-level navigation
    if (focusDepth === 0) {
      switch (key.name) {
        case 'up':
        case 'k':
          selectPrev()
          break
        case 'down':
        case 'j':
          selectNext()
          break
        case 'right':
        case 'l':
          expandSelected()
          break
        case 'left':
        case 'h':
          collapseSelected()
          break
        case 'enter':
          toggleSelected()
          break
        case 'e':
          expandAll()
          break
        case 'c':
          collapseAll()
          break
      }
    }
  })

  // Render children directly - each Section self-registers via useSection
  return (
    <box flexDirection="column" flexGrow={1} height={height} gap={0}>
      {children}
    </box>
  )
}

/**
 * ViewSections component.
 *
 * Wraps children with SectionRegistryProvider and manages
 * keyboard navigation and selection state.
 *
 * Children should be Section components which will self-register.
 */
export function ViewSections({
  children,
  height,
}: ViewSectionsProps): ReactNode {
  return (
    <SectionRegistryProvider>
      <ViewSectionsInner height={height}>{children}</ViewSectionsInner>
    </SectionRegistryProvider>
  )
}

/**
 * Export SectionContainer as an alias for backwards compatibility.
 * @deprecated Use ViewSections instead
 */
export { ViewSections as SectionContainer }
export type { ViewSectionsProps as SectionContainerProps }
