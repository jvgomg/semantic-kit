/**
 * Unit tests for issue formatting.
 */

import { describe, it, expect } from 'bun:test'
import { formatIssue, formatIssues } from './issues.js'
import type { FormatterContext, Issue } from './types.js'

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

const sampleError: Issue = {
  type: 'error',
  severity: 'high',
  title: 'Critical Error',
  description: 'This is a critical error that needs attention.',
  tip: 'Try fixing the issue by doing X.',
}

const sampleWarning: Issue = {
  type: 'warning',
  severity: 'medium',
  title: 'Warning Title',
  description: 'This is a warning message.',
  tip: 'Consider addressing this warning.',
}

const sampleInfo: Issue = {
  type: 'info',
  severity: 'low',
  title: 'Information',
  description: 'This is informational.',
}

// ============================================================================
// formatIssue Tests
// ============================================================================

describe('formatIssue', () => {
  describe('TTY mode', () => {
    it('formats error with all fields', () => {
      const output = formatIssue(sampleError, ttyContext)

      // Should contain issue type and severity
      expect(output).toContain('error/high')

      // Should contain title
      expect(output).toContain('Critical Error')

      // Should contain description
      expect(output).toContain('This is a critical error')

      // Should contain tip
      expect(output).toContain('Tip:')
      expect(output).toContain('Try fixing the issue')
    })

    it('formats warning with all fields', () => {
      const output = formatIssue(sampleWarning, ttyContext)

      expect(output).toContain('warning/medium')
      expect(output).toContain('Warning Title')
      expect(output).toContain('This is a warning')
      expect(output).toContain('Tip:')
    })

    it('formats info with all fields', () => {
      const output = formatIssue(sampleInfo, ttyContext)

      expect(output).toContain('info/low')
      expect(output).toContain('Information')
      expect(output).toContain('This is informational')
    })

    it('includes icon in output', () => {
      const output = formatIssue(sampleError, ttyContext)

      // Error icon is ✗ (\u2717)
      expect(output).toContain('✗')
    })

    it('formats without tip when tip is missing', () => {
      const output = formatIssue(sampleInfo, ttyContext)

      // Should not contain "Tip:" since sampleInfo has no tip
      expect(output).not.toContain('Tip:')
    })

    it('omits tip in compact mode', () => {
      const output = formatIssue(sampleError, ttyContext, { compact: true })

      // Should contain title and description
      expect(output).toContain('Critical Error')
      expect(output).toContain('This is a critical error')

      // Should NOT contain tip
      expect(output).not.toContain('Tip:')
    })

    it('wraps long descriptions', () => {
      const longIssue: Issue = {
        type: 'warning',
        severity: 'high',
        title: 'Long Issue',
        description:
          'This is a very long description that should wrap when it exceeds the terminal width and continue on subsequent lines with proper indentation',
      }

      const output = formatIssue(longIssue, { mode: 'tty', width: 50 })
      const lines = output.split('\n')

      // Should have multiple lines
      expect(lines.length).toBeGreaterThan(1)

      // Should contain the description text
      expect(output).toContain('This is a very long description')
    })

    it('applies ANSI color codes', () => {
      const output = formatIssue(sampleError, ttyContext)

      // Should contain ANSI escape codes
      expect(output).toContain('\x1b[')
    })
  })

  describe('Plain mode', () => {
    it('formats error in plain text', () => {
      const output = formatIssue(sampleError, plainContext)

      // Should start with type/severity
      expect(output).toMatch(/^error\/high:/)

      // Should contain title on first line
      expect(output).toContain('Critical Error')

      // Should contain description
      expect(output).toContain('This is a critical error')

      // Should contain tip
      expect(output).toContain('Tip:')
    })

    it('formats warning in plain text', () => {
      const output = formatIssue(sampleWarning, plainContext)

      expect(output).toMatch(/^warning\/medium:/)
      expect(output).toContain('Warning Title')
    })

    it('omits tip in compact mode', () => {
      const output = formatIssue(sampleError, plainContext, { compact: true })

      expect(output).toContain('Critical Error')
      expect(output).not.toContain('Tip:')
    })

    it('does not include ANSI codes', () => {
      const output = formatIssue(sampleError, plainContext)

      // Should NOT contain ANSI escape codes
      expect(output).not.toContain('\x1b[')
    })

    it('does not wrap long text', () => {
      const longIssue: Issue = {
        type: 'warning',
        severity: 'high',
        title: 'Long Issue',
        description:
          'This is a very long description that should NOT wrap in plain mode',
      }

      const output = formatIssue(longIssue, plainContext)

      // Description should be on a single line
      const lines = output.split('\n')
      const descLine = lines.find((line) =>
        line.includes('This is a very long'),
      )
      expect(descLine).toBeDefined()
    })
  })

  describe('All severity levels', () => {
    it('formats high severity', () => {
      const issue: Issue = {
        type: 'error',
        severity: 'high',
        title: 'High',
        description: 'High severity',
      }
      const output = formatIssue(issue, plainContext)
      expect(output).toContain('error/high')
    })

    it('formats medium severity', () => {
      const issue: Issue = {
        type: 'warning',
        severity: 'medium',
        title: 'Medium',
        description: 'Medium severity',
      }
      const output = formatIssue(issue, plainContext)
      expect(output).toContain('warning/medium')
    })

    it('formats low severity', () => {
      const issue: Issue = {
        type: 'info',
        severity: 'low',
        title: 'Low',
        description: 'Low severity',
      }
      const output = formatIssue(issue, plainContext)
      expect(output).toContain('info/low')
    })
  })
})

// ============================================================================
// formatIssues Tests
// ============================================================================

describe('formatIssues', () => {
  describe('Multiple issues', () => {
    it('formats multiple issues with headers (TTY)', () => {
      const issues: Issue[] = [sampleError, sampleWarning, sampleInfo]
      const output = formatIssues(issues, ttyContext)

      // Should contain header
      expect(output).toContain('ISSUES')

      // Should contain all issue titles
      expect(output).toContain('Critical Error')
      expect(output).toContain('Warning Title')
      expect(output).toContain('Information')

      // Issues should be separated by blank lines
      const doubleNewlines = output.match(/\n\n/g)
      expect(doubleNewlines).toBeTruthy()
    })

    it('formats multiple issues with headers (Plain)', () => {
      const issues: Issue[] = [sampleError, sampleWarning]
      const output = formatIssues(issues, plainContext)

      // Should contain plain header
      expect(output).toContain('ISSUES')

      // Should not contain ANSI codes
      expect(output).not.toContain('\x1b[')

      // Should contain both issues
      expect(output).toContain('Critical Error')
      expect(output).toContain('Warning Title')
    })

    it('passes compact option to individual issues', () => {
      const issues: Issue[] = [sampleError, sampleWarning]
      const output = formatIssues(issues, ttyContext, { compact: true })

      // Should contain titles
      expect(output).toContain('Critical Error')
      expect(output).toContain('Warning Title')

      // Should NOT contain tips
      expect(output).not.toContain('Tip:')
    })
  })

  describe('Empty issues', () => {
    it('returns empty string when no issues and no successMessage', () => {
      const output = formatIssues([], ttyContext)
      expect(output).toBe('')
    })

    it('shows success message in TTY mode', () => {
      const output = formatIssues([], ttyContext, {
        successMessage: 'All checks passed',
      })

      // Should contain header
      expect(output).toContain('ISSUES')

      // Should contain checkmark (✓ \u2713)
      expect(output).toContain('✓')

      // Should contain success message
      expect(output).toContain('All checks passed')
    })

    it('shows success message in plain mode', () => {
      const output = formatIssues([], plainContext, {
        successMessage: 'All checks passed',
      })

      // Should contain header
      expect(output).toContain('ISSUES')

      // Should contain OK prefix
      expect(output).toContain('OK:')

      // Should contain success message
      expect(output).toContain('All checks passed')

      // Should not contain ANSI codes
      expect(output).not.toContain('\x1b[')
    })
  })

  describe('Single issue', () => {
    it('formats single issue with header', () => {
      const output = formatIssues([sampleError], ttyContext)

      expect(output).toContain('ISSUES')
      expect(output).toContain('Critical Error')
    })
  })

  describe('Issue icons', () => {
    it('uses correct icon for error', () => {
      const output = formatIssues([sampleError], ttyContext)
      expect(output).toContain('✗') // \u2717
    })

    it('uses correct icon for warning', () => {
      const output = formatIssues([sampleWarning], ttyContext)
      expect(output).toContain('⚠') // \u26A0
    })

    it('uses correct icon for info', () => {
      const output = formatIssues([sampleInfo], ttyContext)
      expect(output).toContain('ℹ') // \u2139
    })
  })
})
