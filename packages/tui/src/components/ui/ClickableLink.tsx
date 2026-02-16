/**
 * ClickableLink component for the expandable sections framework.
 *
 * A link that opens URLs in the system browser.
 * Uses OpenTUI's built-in link support via the <a> element.
 */
import type { ReactNode } from 'react'
import { usePalette } from '../../theme.js'

export interface ClickableLinkProps {
  /** URL to open when clicked */
  href: string
  /** Link text (if not using children) */
  label?: string
  /** Link content */
  children?: ReactNode

  /** Use muted styling */
  muted?: boolean
  /** Show underline (default: true) */
  underline?: boolean
}

/**
 * ClickableLink component.
 *
 * Renders a link that opens in the system browser when clicked.
 * Uses OpenTUI's native `<a>` element support.
 */
export function ClickableLink({
  href,
  label,
  children,
  muted = false,
  underline = true,
}: ClickableLinkProps): ReactNode {
  const palette = usePalette()
  const color = muted ? palette.base03 : palette.base0D
  const content = children ?? label ?? href

  // OpenTUI's <a> element must be inside a <text> element
  return (
    <text>
      <a href={href}>
        {underline ? (
          <u>
            <span fg={color}>{content}</span>
          </u>
        ) : (
          <span fg={color}>{content}</span>
        )}
      </a>
    </text>
  )
}

/**
 * Helper to create a docs link action for cards.
 */
export function createDocsAction(href: string, label = 'Docs') {
  return {
    label,
    href,
  }
}
