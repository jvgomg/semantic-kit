/**
 * TabBar - Tab navigation component for OpenTUI.
 *
 * A horizontal tab bar that displays tabs with visual indication of the active tab.
 * Uses <box> and <text> elements for rendering since <tab-select> doesn't support
 * controlled selectedIndex (needed to show external active state).
 */
import { useSemanticColors } from '../../theme.js'

export interface TabItem {
  id: string
  label: string
  /** Whether this tab is disabled (cannot be selected) */
  disabled?: boolean
}

export interface TabBarProps {
  tabs: TabItem[]
  activeTab: string
  onSelect: (tabId: string) => void
  /** Whether this tab bar should respond to keyboard input (reserved for future use) */
  isFocused?: boolean
  /** Show tab index numbers */
  showIndex?: boolean
}

/**
 * A horizontal tab bar component.
 *
 * Note: Keyboard navigation for tabs is handled by the parent component
 * using left/right arrow keys since <tab-select> doesn't support controlled state.
 */
export function TabBar({
  tabs,
  activeTab,
  onSelect,
  isFocused: _isFocused = false,
  showIndex = false,
}: TabBarProps) {
  const colors = useSemanticColors()

  return (
    <box flexDirection="row" paddingLeft={1}>
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab
        const isDisabled = tab.disabled ?? false
        const prefix = showIndex ? `${index + 1}. ` : ''
        const separator = index < tabs.length - 1 ? ' | ' : ''

        // Determine text color based on state
        const textColor = isDisabled
          ? colors.textHint // Muted/dimmed for disabled
          : isActive
            ? colors.accent
            : colors.muted

        const handleClick = () => {
          if (!isDisabled) {
            onSelect(tab.id)
          }
        }

        return (
          <box key={tab.id} flexDirection="row">
            <box onMouseDown={handleClick}>
              <text fg={textColor}>
                {isActive && !isDisabled ? (
                  <strong>
                    {prefix}
                    {tab.label}
                  </strong>
                ) : (
                  <>
                    {prefix}
                    {tab.label}
                  </>
                )}
              </text>
            </box>
            {separator && <text fg={colors.muted}>{separator}</text>}
          </box>
        )
      })}
    </box>
  )
}
