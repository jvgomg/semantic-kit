/**
 * Table component for OpenTUI
 *
 * Renders data as a simple bordered table with headers.
 */
import type { ReactNode } from 'react'
import { useSemanticColors } from '../../theme.js'

type Scalar = string | number | boolean | null | undefined

type ScalarDict = {
  [key: string]: Scalar
}

export type TableVariant = 'bordered' | 'borderless'

export interface TableProps<T extends ScalarDict> {
  data: T[]
  columns?: (keyof T)[]
  padding?: number
  /** Table style variant: 'bordered' (default) or 'borderless' */
  variant?: TableVariant
  /** Width of the first column (for borderless variant with 2 columns) */
  labelWidth?: number
}

interface Column<T> {
  key: string
  column: keyof T
  width: number
}

/**
 * Calculate column widths based on content
 */
function calculateColumnWidths<T extends ScalarDict>(
  data: T[],
  columns: (keyof T)[],
  padding: number,
): Column<T>[] {
  return columns.map((key) => {
    const headerWidth = String(key).length
    const dataWidths = data.map((row) => {
      const value = row[key]
      if (value == undefined || value == null) return 0
      return String(value).length
    })
    const width = Math.max(...dataWidths, headerWidth) + padding * 2

    return {
      column: key,
      width,
      key: String(key),
    }
  })
}

/**
 * Generate a row of the table
 */
function generateRow<T extends ScalarDict>(
  columns: Column<T>[],
  data: Partial<T>,
  padding: number,
  left: string,
  right: string,
  cross: string,
  fill: string,
): string {
  const cells = columns.map((column) => {
    const value = data[column.column]
    if (value == undefined || value == null) {
      return fill.repeat(column.width)
    }
    const ml = padding
    const mr = column.width - String(value).length - padding
    return `${fill.repeat(ml)}${String(value)}${fill.repeat(mr)}`
  })
  return `${left}${cells.join(cross)}${right}`
}

/**
 * Table component
 */
export function Table<T extends ScalarDict>({
  data,
  columns: columnsProp,
  padding = 1,
  variant = 'bordered',
  labelWidth,
}: TableProps<T>): ReactNode {
  const colors = useSemanticColors()

  // Get all keys from data if columns not provided
  const columns =
    columnsProp ??
    (() => {
      const keys = new Set<keyof T>()
      for (const row of data) {
        for (const key in row) {
          keys.add(key)
        }
      }
      return Array.from(keys)
    })()

  const columnWidths = calculateColumnWidths(data, columns, padding)

  // Create headings row data
  const headings: Partial<T> = columns.reduce(
    (acc, column) => ({ ...acc, [column]: column }),
    {},
  )

  // Borderless variant: flex layout with text wrapping
  if (variant === 'borderless') {
    // Calculate label width from first column if not provided
    const effectiveLabelWidth = labelWidth ?? columnWidths[0]?.width ?? 10

    return (
      <box flexDirection="column">
        {data.map((row, index) => {
          const values = columns.map((col) => row[col])
          const label = String(values[0] ?? '')
          const value = String(values[1] ?? '')

          return (
            <box key={index} flexDirection="row">
              <text width={effectiveLabelWidth} fg={colors.muted}>
                {label.padEnd(effectiveLabelWidth)}
              </text>
              <text flexShrink={1}>{value}</text>
            </box>
          )
        })}
      </box>
    )
  }

  // Bordered variant (default): full box drawing
  const topBorder = generateRow(columnWidths, {}, padding, '┌', '┐', '┬', '─')
  const headingRow = generateRow(
    columnWidths,
    headings,
    padding,
    '│',
    '│',
    '│',
    ' ',
  )
  const separator = generateRow(columnWidths, {}, padding, '├', '┤', '┼', '─')
  const bottomBorder = generateRow(
    columnWidths,
    {},
    padding,
    '└',
    '┘',
    '┴',
    '─',
  )

  return (
    <box flexDirection="column">
      <text>{topBorder}</text>
      <text fg={colors.accent}>
        <strong>{headingRow}</strong>
      </text>
      {data.map((row, index) => (
        <box key={index} flexDirection="column">
          <text>{separator}</text>
          <text>
            {generateRow(columnWidths, row, padding, '│', '│', '│', ' ')}
          </text>
        </box>
      ))}
      <text>{bottomBorder}</text>
    </box>
  )
}
