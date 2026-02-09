/**
 * Card component for the expandable sections framework.
 *
 * A structured item within a section, used for violations, schema items, etc.
 * Cards display a title, content rows, and optional actions.
 */
import type { ReactNode } from 'react'
import { sectionColors, getSeverityColor } from '../view-display/section-theme.js'
import { palette } from '../../theme.js'

/**
 * Action that can be performed on a card.
 */
export interface CardAction {
  /** Display label */
  label: string
  /** Keyboard shortcut (e.g., "d", "enter") */
  shortcut?: string
  /** URL to open in browser */
  href?: string
  /** Custom handler */
  onSelect?: () => void
}

export interface CardProps {
  /** Card title */
  title: string
  /** Severity level for styling */
  severity?: 'critical' | 'error' | 'warning' | 'info'
  /** Icon to display (e.g., "✗", "⚠") */
  icon?: string

  /** Content rows (CardRow components) */
  children?: ReactNode

  /** Actions available on this card */
  actions?: CardAction[]

  /** Whether this card is visually selected */
  selected?: boolean
  /** Whether this card has keyboard focus */
  focused?: boolean
}

/**
 * Props for a row within a card.
 */
export interface CardRowProps {
  /** Row label (e.g., "Element", "Line") */
  label: string
  /** Row value - can be string or component */
  value: ReactNode
  /** Use muted styling */
  muted?: boolean
}

/**
 * A key-value row within a card.
 */
export function CardRow({
  label,
  value,
  muted = false,
}: CardRowProps): ReactNode {
  const labelColor = muted ? palette.darkGray : palette.gray
  const valueColor = muted ? palette.gray : palette.white

  return (
    <box flexDirection="row">
      <text fg={labelColor}>{label}: </text>
      <text fg={valueColor}>{value}</text>
    </box>
  )
}

/**
 * Render the card header.
 */
function CardHeader({
  title,
  severity,
  icon,
}: {
  title: string
  severity?: 'critical' | 'error' | 'warning' | 'info'
  icon?: string
}): ReactNode {
  const titleColor = severity ? getSeverityColor(severity) : palette.white

  return (
    <text fg={titleColor}>
      {icon && <span>{icon} </span>}
      <strong>{title}</strong>
    </text>
  )
}

/**
 * Render card actions as buttons.
 */
function CardActions({ actions }: { actions: CardAction[] }): ReactNode {
  if (actions.length === 0) return null

  return (
    <box flexDirection="column" marginTop={1}>
      <text fg={palette.darkGray}>{'─'.repeat(40)}</text>
      <box flexDirection="row" gap={2} marginTop={1}>
        {actions.map((action, index) => (
          <text key={index} fg={palette.cyan}>
            [{action.label}]
            {action.shortcut && (
              <span fg={palette.gray}> {action.shortcut}</span>
            )}
          </text>
        ))}
      </box>
    </box>
  )
}

/**
 * Card component.
 *
 * Renders a bordered card with title, content rows, and actions.
 */
export function Card({
  title,
  severity,
  icon,
  children,
  actions = [],
  selected = false,
  focused = false,
}: CardProps): ReactNode {
  const borderColor = focused
    ? sectionColors.borderSelected
    : selected
      ? sectionColors.borderExpanded
      : sectionColors.borderCollapsed

  return (
    <box
      flexDirection="column"
      border
      borderStyle="rounded"
      borderColor={borderColor}
      paddingLeft={1}
      paddingRight={1}
    >
      <CardHeader title={title} severity={severity} icon={icon} />
      {children && (
        <box flexDirection="column" marginTop={1}>
          {children}
        </box>
      )}
      {actions.length > 0 && <CardActions actions={actions} />}
    </box>
  )
}
