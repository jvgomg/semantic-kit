/**
 * Table component for Ink
 * Based on ink-table by maticzav, adapted for ESM compatibility
 */
import React from 'react'
import { Box, Text } from 'ink'

/* Types */

type Scalar = string | number | boolean | null | undefined

type ScalarDict = {
  [key: string]: Scalar
}

export type CellProps = React.PropsWithChildren<{ column: number }>

export type TableProps<T extends ScalarDict> = {
  data: T[]
  columns?: (keyof T)[]
  padding?: number
  header?: (props: React.PropsWithChildren<object>) => React.ReactNode
  cell?: (props: CellProps) => React.ReactNode
  skeleton?: (props: React.PropsWithChildren<object>) => React.ReactNode
}

type Column<T> = {
  key: string
  column: keyof T
  width: number
}

type RowConfig = {
  cell: (props: CellProps) => React.ReactNode
  padding: number
  skeleton: {
    component: (props: React.PropsWithChildren<object>) => React.ReactNode
    left: string
    right: string
    cross: string
    line: string
  }
}

type RowProps<T extends ScalarDict> = {
  rowKey: string
  data: Partial<T>
  columns: Column<T>[]
}

/* Helper components */

function Header(props: React.PropsWithChildren<object>) {
  return (
    <Text bold color="blue">
      {props.children}
    </Text>
  )
}

function Cell(props: CellProps) {
  return <Text>{props.children}</Text>
}

function Skeleton(props: React.PropsWithChildren<object>) {
  return <Text bold>{props.children}</Text>
}

/* Utility functions */

function intersperse<T, I>(
  intersperser: (index: number) => I,
  elements: T[],
): (T | I)[] {
  const interspersed: (T | I)[] = elements.reduce(
    (acc, element, index) => {
      if (acc.length === 0) return [element]
      return [...acc, intersperser(index), element]
    },
    [] as (T | I)[],
  )
  return interspersed
}

/* Row builder */

function createRow<T extends ScalarDict>(config: RowConfig) {
  const { skeleton } = config

  return function Row(props: RowProps<T>) {
    return (
      <Box flexDirection="row">
        <skeleton.component>{skeleton.left}</skeleton.component>
        {intersperse(
          (i) => (
            <skeleton.component key={`${props.rowKey}-sep-${i}`}>
              {skeleton.cross}
            </skeleton.component>
          ),
          props.columns.map((column, colI) => {
            const value = props.data[column.column]

            if (value == undefined || value == null) {
              return (
                <config.cell
                  key={`${props.rowKey}-empty-${column.key}`}
                  column={colI}
                >
                  {skeleton.line.repeat(column.width)}
                </config.cell>
              )
            } else {
              const ml = config.padding
              const mr = column.width - String(value).length - config.padding

              return (
                <config.cell
                  key={`${props.rowKey}-cell-${column.key}`}
                  column={colI}
                >
                  {`${skeleton.line.repeat(ml)}${String(value)}${skeleton.line.repeat(mr)}`}
                </config.cell>
              )
            }
          }),
        )}
        <skeleton.component>{skeleton.right}</skeleton.component>
      </Box>
    )
  }
}

/* Main Table component */

export function Table<T extends ScalarDict>({
  data,
  columns: columnsProp,
  padding = 1,
  header = Header,
  cell = Cell,
  skeleton = Skeleton,
}: TableProps<T>) {
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

  // Calculate column widths
  const columnWidths: Column<T>[] = columns.map((key) => {
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

  // Create headings row data
  const headings: Partial<T> = columns.reduce(
    (acc, column) => ({ ...acc, [column]: column }),
    {},
  )

  // Row renderers
  const HeaderRow = createRow<T>({
    cell: skeleton,
    padding,
    skeleton: {
      component: skeleton,
      line: '─',
      left: '┌',
      right: '┐',
      cross: '┬',
    },
  })

  const HeadingRow = createRow<T>({
    cell: header,
    padding,
    skeleton: {
      component: skeleton,
      line: ' ',
      left: '│',
      right: '│',
      cross: '│',
    },
  })

  const SeparatorRow = createRow<T>({
    cell: skeleton,
    padding,
    skeleton: {
      component: skeleton,
      line: '─',
      left: '├',
      right: '┤',
      cross: '┼',
    },
  })

  const DataRow = createRow<T>({
    cell,
    padding,
    skeleton: {
      component: skeleton,
      line: ' ',
      left: '│',
      right: '│',
      cross: '│',
    },
  })

  const FooterRow = createRow<T>({
    cell: skeleton,
    padding,
    skeleton: {
      component: skeleton,
      line: '─',
      left: '└',
      right: '┘',
      cross: '┴',
    },
  })

  return (
    <Box flexDirection="column">
      <HeaderRow rowKey="header" columns={columnWidths} data={{}} />
      <HeadingRow rowKey="heading" columns={columnWidths} data={headings} />
      {data.map((row, index) => (
        <Box flexDirection="column" key={`row-${index}`}>
          <SeparatorRow
            rowKey={`sep-${index}`}
            columns={columnWidths}
            data={{}}
          />
          <DataRow rowKey={`data-${index}`} columns={columnWidths} data={row} />
        </Box>
      ))}
      <FooterRow rowKey="footer" columns={columnWidths} data={{}} />
    </Box>
  )
}
