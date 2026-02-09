import type { ReactNode } from 'react'

/**
 * Global header component with slot props for navigation and user menu
 * Allows flexible composition of navigation and user menu components
 */
export function GlobalHeader({
  navigation,
  userMenu,
}: {
  navigation: ReactNode
  userMenu: ReactNode
}) {
  return (
    <header>
      <div>
        <span>Site Logo</span>
      </div>
      {navigation}
      {userMenu}
    </header>
  )
}
