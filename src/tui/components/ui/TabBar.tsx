/**
 * TabBar - Tab navigation component for OpenTUI.
 *
 * A horizontal tab bar that displays tabs with visual indication of the active tab.
 * Uses <box> and <text> elements for rendering since <tab-select> doesn't support
 * controlled selectedIndex (needed to show external active state).
 */
import { colors } from '../../theme.js'

export interface TabItem {
  id: string
  label: string
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
  return (
    <box flexDirection="row" paddingLeft={1}>
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab
        const prefix = showIndex ? `${index + 1}. ` : ''
        const separator = index < tabs.length - 1 ? ' | ' : ''

        return (
          <box key={tab.id} flexDirection="row">
            <box onMouseDown={() => onSelect(tab.id)}>
              <text fg={isActive ? colors.accent : colors.muted}>
                {isActive ? (
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
