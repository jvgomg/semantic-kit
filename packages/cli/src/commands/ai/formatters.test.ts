/**
 * Unit tests for AI command formatters.
 */

import type { AiResult } from '@webspecs/core'
import { describe, it, expect } from 'bun:test'
import { buildIssues, formatAiOutput } from './formatters.js'

// ============================================================================
// Test Fixtures
// ============================================================================

/**
 * Helper to create a minimal AiResult for testing
 */
function createAiResult(
  overrides?: Partial<AiResult>,
): AiResult {
  return {
    url: 'https://example.com',
    title: 'Example Page',
    byline: null,
    excerpt: 'This is an example',
    siteName: 'Example Site',
    wordCount: 100,
    isReaderable: true,
    markdown: '# Example\n\nThis is example content.',
    html: '<h1>Example</h1><p>This is example content.</p>',
    hiddenContentAnalysis: {
      hiddenWordCount: 0,
      visibleWordCount: 100,
      hiddenPercentage: 0,
      severity: 'none',
      framework: null,
      hasStreamingContent: false,
    },
    ...overrides,
  }
}

// ============================================================================
// buildIssues Tests
// ============================================================================

describe('buildIssues', () => {
  describe('streaming/hidden content detection', () => {
    it('creates high severity issue for high percentage hidden content with framework', () => {
      const result = createAiResult({
        wordCount: 20,
        hiddenContentAnalysis: {
          hiddenWordCount: 180,
          visibleWordCount: 20,
          hiddenPercentage: 90,
          severity: 'high',
          framework: {
            name: 'Next.js',
            confidence: 'detected',
          },
          hasStreamingContent: true,
        },
      })

      const issues = buildIssues(result)

      // Should have streaming issue as first issue
      expect(issues.length).toBeGreaterThan(0)
      const streamingIssue = issues[0]!
      expect(streamingIssue.type).toBe('warning')
      expect(streamingIssue.severity).toBe('high')
      expect(streamingIssue.title).toContain('Next.js')
      expect(streamingIssue.title).toContain('Streaming')
      expect(streamingIssue.description).toContain('90%')
      expect(streamingIssue.description).toContain('20')
      expect(streamingIssue.description).toContain('180')
    })

    it('creates low severity issue for low percentage hidden content', () => {
      const result = createAiResult({
        wordCount: 150,
        hiddenContentAnalysis: {
          hiddenWordCount: 50,
          visibleWordCount: 150,
          hiddenPercentage: 25,
          severity: 'low',
          framework: {
            name: 'Next.js',
            confidence: 'likely',
          },
          hasStreamingContent: true,
        },
      })

      const issues = buildIssues(result)

      const streamingIssue = issues[0]!
      expect(streamingIssue.severity).toBe('low')
      expect(streamingIssue.description).toContain('Most content is visible')
    })

    it('creates generic hidden content issue when no framework detected', () => {
      const result = createAiResult({
        wordCount: 20,
        hiddenContentAnalysis: {
          hiddenWordCount: 180,
          visibleWordCount: 20,
          hiddenPercentage: 90,
          severity: 'high',
          framework: null,
          hasStreamingContent: true,
        },
      })

      const issues = buildIssues(result)

      const streamingIssue = issues[0]!
      expect(streamingIssue.title).toBe('Hidden Content Detected')
      expect(streamingIssue.description).toContain('streaming SSR frameworks')
    })

    it('does not create streaming issue when severity is none', () => {
      const result = createAiResult({
        hiddenContentAnalysis: {
          hiddenWordCount: 0,
          visibleWordCount: 100,
          hiddenPercentage: 0,
          severity: 'none',
          framework: null,
          hasStreamingContent: false,
        },
      })

      const issues = buildIssues(result)

      // Should not have any streaming-related issues
      expect(issues.every((issue) => !issue.title.includes('Streaming'))).toBe(
        true,
      )
    })
  })

  describe('no content extracted', () => {
    it('creates high severity warning when word count is zero', () => {
      const result = createAiResult({
        wordCount: 0,
        markdown: '',
        html: '',
      })

      const issues = buildIssues(result)

      const noContentIssue = issues.find((i) =>
        i.title.includes('No Content Extracted'),
      )
      expect(noContentIssue).toBeDefined()
      expect(noContentIssue!.type).toBe('warning')
      expect(noContentIssue!.severity).toBe('high')
      expect(noContentIssue!.description).toContain('JavaScript')
      expect(noContentIssue!.tip).toContain('--raw')
    })

    it('does not create no-content issue when content exists', () => {
      const result = createAiResult({
        wordCount: 100,
      })

      const issues = buildIssues(result)

      const noContentIssue = issues.find((i) =>
        i.title.includes('No Content Extracted'),
      )
      expect(noContentIssue).toBeUndefined()
    })
  })

  describe('readability warnings', () => {
    it('creates warning when not readerable but has content', () => {
      const result = createAiResult({
        wordCount: 50,
        isReaderable: false,
      })

      const issues = buildIssues(result)

      const readerableIssue = issues.find((i) =>
        i.title.includes('Content Extraction Warning'),
      )
      expect(readerableIssue).toBeDefined()
      expect(readerableIssue!.type).toBe('warning')
      expect(readerableIssue!.severity).toBe('medium')
      expect(readerableIssue!.description).toContain('isProbablyReaderable')
      expect(readerableIssue!.tip).toContain('semantic HTML')
    })

    it('does not create readerable warning when word count is zero', () => {
      const result = createAiResult({
        wordCount: 0,
        isReaderable: false,
      })

      const issues = buildIssues(result)

      const readerableIssue = issues.find((i) =>
        i.title.includes('Content Extraction Warning'),
      )
      expect(readerableIssue).toBeUndefined()
    })

    it('does not create warning when readerable is true', () => {
      const result = createAiResult({
        wordCount: 50,
        isReaderable: true,
      })

      const issues = buildIssues(result)

      const readerableIssue = issues.find((i) =>
        i.title.includes('Content Extraction Warning'),
      )
      expect(readerableIssue).toBeUndefined()
    })
  })

  describe('short content warnings', () => {
    it('creates info issue for very short content', () => {
      const result = createAiResult({
        wordCount: 50,
        hiddenContentAnalysis: {
          hiddenWordCount: 0,
          visibleWordCount: 50,
          hiddenPercentage: 0,
          severity: 'none',
          framework: null,
          hasStreamingContent: false,
        },
      })

      const issues = buildIssues(result)

      const shortContentIssue = issues.find((i) =>
        i.title.includes('Short Content'),
      )
      expect(shortContentIssue).toBeDefined()
      expect(shortContentIssue!.type).toBe('info')
      expect(shortContentIssue!.severity).toBe('low')
      expect(shortContentIssue!.description).toContain('50 words')
    })

    it('does not create short content warning when streaming detected', () => {
      const result = createAiResult({
        wordCount: 50,
        hiddenContentAnalysis: {
          hiddenWordCount: 100,
          visibleWordCount: 50,
          hiddenPercentage: 67,
          severity: 'high',
          framework: null,
          hasStreamingContent: true,
        },
      })

      const issues = buildIssues(result)

      const shortContentIssue = issues.find((i) =>
        i.title.includes('Short Content'),
      )
      expect(shortContentIssue).toBeUndefined()
    })

    it('does not create short content warning when content is long enough', () => {
      const result = createAiResult({
        wordCount: 150,
      })

      const issues = buildIssues(result)

      const shortContentIssue = issues.find((i) =>
        i.title.includes('Short Content'),
      )
      expect(shortContentIssue).toBeUndefined()
    })

    it('does not create short content warning when word count is zero', () => {
      const result = createAiResult({
        wordCount: 0,
      })

      const issues = buildIssues(result)

      const shortContentIssue = issues.find((i) =>
        i.title.includes('Short Content'),
      )
      expect(shortContentIssue).toBeUndefined()
    })
  })

  describe('issue ordering', () => {
    it('orders issues by priority', () => {
      const result = createAiResult({
        wordCount: 50,
        isReaderable: false,
        hiddenContentAnalysis: {
          hiddenWordCount: 150,
          visibleWordCount: 50,
          hiddenPercentage: 75,
          severity: 'high',
          framework: {
            name: 'Next.js',
            confidence: 'detected',
          },
          hasStreamingContent: true,
        },
      })

      const issues = buildIssues(result)

      // Should have:
      // 1. Streaming (high severity)
      // 2. Readerable warning (medium severity)
      // NO short content warning (streaming is present)

      expect(issues).toHaveLength(2)
      expect(issues[0]!.title).toContain('Streaming')
      expect(issues[1]!.title).toContain('Content Extraction Warning')
    })
  })

  describe('complex scenarios', () => {
    it('handles page with all issues except streaming', () => {
      const result = createAiResult({
        wordCount: 50,
        isReaderable: false,
        hiddenContentAnalysis: {
          hiddenWordCount: 0,
          visibleWordCount: 50,
          hiddenPercentage: 0,
          severity: 'none',
          framework: null,
          hasStreamingContent: false,
        },
      })

      const issues = buildIssues(result)

      // Should have: readerable warning, short content info
      expect(issues).toHaveLength(2)

      const types = issues.map((i) => i.title)
      expect(types).toContain('Content Extraction Warning')
      expect(types).toContain('Short Content')
    })

    it('returns empty array for perfect page', () => {
      const result = createAiResult({
        wordCount: 500,
        isReaderable: true,
        hiddenContentAnalysis: {
          hiddenWordCount: 0,
          visibleWordCount: 500,
          hiddenPercentage: 0,
          severity: 'none',
          framework: null,
          hasStreamingContent: false,
        },
      })

      const issues = buildIssues(result)
      expect(issues).toHaveLength(0)
    })
  })
})

// ============================================================================
// formatAiOutput Tests
// ============================================================================

describe('formatAiOutput', () => {
  describe('full format', () => {
    it('includes all sections for normal result', () => {
      const result = createAiResult()
      const output = formatAiOutput(result, 'full', 'plain')

      // Should contain table sections
      expect(output).toContain('ANALYSIS')
      expect(output).toContain('META')
      expect(output).toContain('Word Count')
      expect(output).toContain('100')

      // Should contain metadata
      expect(output).toContain('Title')
      expect(output).toContain('Example Page')

      // Should contain markdown content
      expect(output).toContain('# Example')
      expect(output).toContain('This is example content')
    })

    it('shows hidden content metrics when streaming detected', () => {
      const result = createAiResult({
        wordCount: 50,
        hiddenContentAnalysis: {
          hiddenWordCount: 150,
          visibleWordCount: 50,
          hiddenPercentage: 75,
          severity: 'high',
          framework: null,
          hasStreamingContent: true,
        },
      })

      const output = formatAiOutput(result, 'full', 'plain')

      // Should contain hidden content metrics
      expect(output).toContain('Hidden')
      expect(output).toContain('150')
      expect(output).toContain('75%')
    })

    it('does not show hidden metrics when no streaming', () => {
      const result = createAiResult({
        hiddenContentAnalysis: {
          hiddenWordCount: 0,
          visibleWordCount: 100,
          hiddenPercentage: 0,
          severity: 'none',
          framework: null,
          hasStreamingContent: false,
        },
      })

      const output = formatAiOutput(result, 'full', 'plain')

      // Should NOT contain Hidden row
      expect(output).not.toContain('Hidden:')
    })

    it('stops after issues when word count is zero', () => {
      const result = createAiResult({
        wordCount: 0,
        markdown: '',
        html: '',
      })

      const output = formatAiOutput(result, 'full', 'plain')

      // Should contain issues section
      expect(output).toContain('ISSUES')
      expect(output).toContain('No Content Extracted')

      // Should NOT contain table sections or content
      expect(output).not.toContain('ANALYSIS')
      expect(output).not.toContain('META')
    })

    it('truncates long excerpts in metadata', () => {
      const longExcerpt = 'A'.repeat(100)
      const result = createAiResult({
        excerpt: longExcerpt,
      })

      const output = formatAiOutput(result, 'full', 'plain')

      // Excerpt should be truncated to 80 chars + "..."
      expect(output).toContain('...')
      // Should not contain full excerpt
      expect(output).not.toContain(longExcerpt)
    })
  })

  describe('compact format', () => {
    it('truncates markdown content', () => {
      const longContent = 'Word '.repeat(50) // 50 words
      const result = createAiResult({
        wordCount: 50,
        markdown: longContent,
      })

      const fullOutput = formatAiOutput(result, 'full', 'plain')
      const compactOutput = formatAiOutput(result, 'compact', 'plain')

      // Compact should be shorter
      expect(compactOutput.length).toBeLessThan(fullOutput.length)

      // Compact should contain "..." for truncation
      expect(compactOutput).toContain('...')
    })

    it('includes table sections in compact mode', () => {
      const result = createAiResult()
      const output = formatAiOutput(result, 'compact', 'plain')

      // Should still include tables
      expect(output).toContain('ANALYSIS')
      expect(output).toContain('META')
    })
  })

  describe('TTY vs plain mode', () => {
    it('applies different formatting for TTY mode', () => {
      const result = createAiResult()

      const ttyOutput = formatAiOutput(result, 'full', 'tty')
      const plainOutput = formatAiOutput(result, 'full', 'plain')

      // TTY should contain ANSI codes
      expect(ttyOutput).toContain('\x1b[')

      // Plain should not
      expect(plainOutput).not.toContain('\x1b[')
    })
  })

  describe('edge cases', () => {
    it('handles null metadata fields', () => {
      const result = createAiResult({
        title: null,
        byline: null,
        excerpt: null,
        siteName: null,
      })

      const output = formatAiOutput(result, 'full', 'plain')

      // Should not crash
      expect(output).toContain('ANALYSIS')
      // META section is omitted when all fields are null (table filtering)
      // This is expected behavior
    })

    it('handles empty markdown', () => {
      const result = createAiResult({
        wordCount: 0,
        markdown: '',
      })

      const output = formatAiOutput(result, 'full', 'plain')

      // Should not crash
      expect(output).toBeDefined()
    })

    it('shows readerable status correctly', () => {
      const readable = createAiResult({ isReaderable: true })
      const notReadable = createAiResult({ isReaderable: false })

      const readableOutput = formatAiOutput(readable, 'full', 'plain')
      const notReadableOutput = formatAiOutput(notReadable, 'full', 'plain')

      expect(readableOutput).toContain('Readerable: Yes')
      expect(notReadableOutput).toContain('Readerable: No')
    })
  })
})
