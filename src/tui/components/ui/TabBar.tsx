/**
 * TabBar - A wrapper around ink-tab for consistent tab navigation.
 *
 * Uses the ink-tab library internally while maintaining our existing interface.
 */
import React from 'react'
import { Tabs, Tab } from 'ink-tab'
import type { SubTabDefinition } from '../../views/types.js'
import { colors } from '../../theme.js'

export interface TabBarProps {
  tabs: SubTabDefinition[]
  activeTab: string
  onSelect: (tabId: string) => void
  /** Whether this tab bar should respond to keyboard input */
  isFocused?: boolean
  /** Show tab index numbers */
  showIndex?: boolean
}

export function TabBar({
  tabs,
  activeTab,
  onSelect,
  isFocused = true,
  showIndex = false,
}: TabBarProps) {
  const handleChange = (name: string) => {
    onSelect(name)
  }

  return (
    <Tabs
      onChange={handleChange}
      defaultValue={activeTab}
      isFocused={isFocused}
      showIndex={showIndex}
      flexDirection="row"
      keyMap={{
        useNumbers: false,
        useTab: false,
        previous: ['left'],
        next: ['right'],
      }}
      colors={{
        activeTab: {
          color: colors.accent,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab key={tab.id} name={tab.id}>
          {tab.label}
        </Tab>
      ))}
    </Tabs>
  )
}
