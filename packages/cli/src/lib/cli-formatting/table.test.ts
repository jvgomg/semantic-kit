/**
 * Unit tests for table formatting.
 */

import { describe, it, expect } from 'bun:test'
import { formatTable, formatTableGroups } from './table.js'
import type { FormatterContext, TableGroup, TableRow } from './types.js'

// ============================================================================
// Test Helpers
// ============================================================================

const ttyContext: FormatterContext = {
  mode: 'tty',
  width: 80,
}

const plainContext: FormatterContext = {
  mode: 'plain',
}

// ============================================================================
// formatTable Tests
// ============================================================================

describe('formatTable', () => {
  describe('TTY mode', () => {
    it('formats simple key-value pairs', () => {
      const rows: TableRow[] = [
        { key: 'Name', value: 'Example' },
        { key: 'Status', value: 'Active' },
      ]
      const output = formatTable(rows, ttyContext)

      // Should contain the keys and values
      expect(output).toContain('Name')
      expect(output).toContain('Example')
      expect(output).toContain('Status')
      expect(output).toContain('Active')
    })

    it('aligns keys to the longest key length', () => {
      const rows: TableRow[] = [
        { key: 'A', value: 'Short' },
        { key: 'Very Long Key', value: 'Value' },
        { key: 'B', value: 'Another' },
      ]
      const output = formatTable(rows, ttyContext)
      const lines = output.split('\n')

      // All lines should exist
      expect(lines).toHaveLength(3)

      // Each line should contain its key and value
      expect(lines[0]).toContain('A')
      expect(lines[0]).toContain('Short')
      expect(lines[1]).toContain('Very Long Key')
      expect(lines[1]).toContain('Value')
      expect(lines[2]).toContain('B')
      expect(lines[2]).toContain('Another')
    })

    it('formats numbers with locale formatting', () => {
      const rows: TableRow[] = [
        { key: 'Count', value: 1000 },
        { key: 'Large', value: 1000000 },
      ]
      const output = formatTable(rows, ttyContext)

      // Numbers should be formatted with commas
      expect(output).toContain('1,000')
      expect(output).toContain('1,000,000')
    })

    it('filters out undefined values', () => {
      const rows: TableRow[] = [
        { key: 'Present', value: 'Yes' },
        { key: 'Missing', value: undefined },
        { key: 'Also Present', value: 'Yes' },
      ]
      const output = formatTable(rows, ttyContext)

      expect(output).toContain('Present')
      expect(output).toContain('Also Present')
      expect(output).not.toContain('Missing')
    })

    it('filters out null values', () => {
      const rows: TableRow[] = [
        { key: 'Present', value: 'Yes' },
        { key: 'Null', value: null as unknown as string },
        { key: 'Also Present', value: 'Yes' },
      ]
      const output = formatTable(rows, ttyContext)

      expect(output).toContain('Present')
      expect(output).toContain('Also Present')
      expect(output).not.toContain('Null')
    })

    it('returns empty string when all values are filtered out', () => {
      const rows: TableRow[] = [
        { key: 'Missing', value: undefined },
        { key: 'Null', value: null as unknown as string },
      ]
      const output = formatTable(rows, ttyContext)
      expect(output).toBe('')
    })

    it('wraps long values at terminal width', () => {
      const longValue = 'This is a very long value that should wrap when it exceeds the terminal width minus the key column width'
      const rows: TableRow[] = [
        { key: 'Description', value: longValue },
      ]
      const output = formatTable(rows, { mode: 'tty', width: 50 })
      const lines = output.split('\n')

      // Should have multiple lines due to wrapping
      expect(lines.length).toBeGreaterThan(1)
    })

    it('respects custom gap option', () => {
      const rows: TableRow[] = [
        { key: 'A', value: 'Value' },
      ]
      const outputDefaultGap = formatTable(rows, ttyContext)
      const outputLargeGap = formatTable(rows, ttyContext, { gap: 10 })

      // Output with larger gap should be longer (more spaces)
      expect(outputLargeGap.length).toBeGreaterThan(outputDefaultGap.length)
    })
  })

  describe('Plain mode', () => {
    it('formats as "Key: Value"', () => {
      const rows: TableRow[] = [
        { key: 'Name', value: 'Example' },
        { key: 'Status', value: 'Active' },
      ]
      const output = formatTable(rows, plainContext)

      expect(output).toBe('Name: Example\nStatus: Active')
    })

    it('formats numbers with locale formatting', () => {
      const rows: TableRow[] = [
        { key: 'Count', value: 1000 },
      ]
      const output = formatTable(rows, plainContext)

      expect(output).toBe('Count: 1,000')
    })

    it('filters out undefined and null values', () => {
      const rows: TableRow[] = [
        { key: 'Present', value: 'Yes' },
        { key: 'Missing', value: undefined },
        { key: 'Null', value: null as unknown as string },
      ]
      const output = formatTable(rows, plainContext)

      expect(output).toBe('Present: Yes')
    })

    it('does not wrap text', () => {
      const longValue = 'This is a very long value that should NOT wrap in plain mode'
      const rows: TableRow[] = [
        { key: 'Description', value: longValue },
      ]
      const output = formatTable(rows, plainContext)
      const lines = output.split('\n')

      // Should be single line (no wrapping in plain mode)
      expect(lines).toHaveLength(1)
      expect(output).toContain(longValue)
    })
  })
})

// ============================================================================
// formatTableGroups Tests
// ============================================================================

describe('formatTableGroups', () => {
  describe('TTY mode', () => {
    it('formats multiple groups with headers', () => {
      const groups: TableGroup[] = [
        {
          header: 'Group 1',
          rows: [
            { key: 'Key1', value: 'Value1' },
          ],
        },
        {
          header: 'Group 2',
          rows: [
            { key: 'Key2', value: 'Value2' },
          ],
        },
      ]
      const output = formatTableGroups(groups, ttyContext)

      // Should contain uppercased headers
      expect(output).toContain('GROUP 1')
      expect(output).toContain('GROUP 2')

      // Should contain values
      expect(output).toContain('Value1')
      expect(output).toContain('Value2')

      // Groups should be separated by blank lines
      const sections = output.split('\n\n')
      expect(sections.length).toBeGreaterThanOrEqual(2)
    })

    it('formats groups without headers', () => {
      const groups: TableGroup[] = [
        {
          rows: [
            { key: 'Key1', value: 'Value1' },
          ],
        },
        {
          rows: [
            { key: 'Key2', value: 'Value2' },
          ],
        },
      ]
      const output = formatTableGroups(groups, ttyContext)

      // Should contain values
      expect(output).toContain('Value1')
      expect(output).toContain('Value2')
    })

    it('skips empty groups', () => {
      const groups: TableGroup[] = [
        {
          header: 'Empty Group',
          rows: [
            { key: 'Missing', value: undefined },
          ],
        },
        {
          header: 'Valid Group',
          rows: [
            { key: 'Present', value: 'Value' },
          ],
        },
      ]
      const output = formatTableGroups(groups, ttyContext)

      // Should not contain empty group header
      expect(output).not.toContain('EMPTY GROUP')

      // Should contain valid group
      expect(output).toContain('VALID GROUP')
      expect(output).toContain('Value')
    })

    it('returns empty string when all groups are empty', () => {
      const groups: TableGroup[] = [
        {
          rows: [
            { key: 'Missing', value: undefined },
          ],
        },
        {
          rows: [
            { key: 'Null', value: null as unknown as string },
          ],
        },
      ]
      const output = formatTableGroups(groups, ttyContext)
      expect(output).toBe('')
    })
  })

  describe('Plain mode', () => {
    it('formats groups with plain headers', () => {
      const groups: TableGroup[] = [
        {
          header: 'Group 1',
          rows: [
            { key: 'Key1', value: 'Value1' },
          ],
        },
      ]
      const output = formatTableGroups(groups, plainContext)

      // Header should be uppercase but no ANSI codes
      expect(output).toContain('GROUP 1')
      expect(output).not.toContain('\x1b')
    })
  })
})
