/**
 * AI command issue generation.
 */
import type { AiResult, HiddenContentAnalysis } from '../results.js'
import type { Issue } from '../types.js'

// ============================================================================
// Issue Codes
// ============================================================================

export const AI_CODES = {
  STREAMING_DETECTED: 'ai-streaming-detected',
  HIDDEN_CONTENT: 'ai-hidden-content',
  NO_CONTENT: 'ai-no-content',
  NOT_READERABLE: 'ai-not-readerable',
  SHORT_CONTENT: 'ai-short-content',
} as const

export type AiCode = (typeof AI_CODES)[keyof typeof AI_CODES]

// ============================================================================
// Input Types
// ============================================================================

export interface AiIssueInput {
  result: AiResult
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a streaming/hidden content issue based on detection results.
 */
function buildStreamingIssue(analysis: HiddenContentAnalysis): Issue | null {
  const {
    framework,
    severity,
    hiddenWordCount,
    visibleWordCount,
    hiddenPercentage,
  } = analysis

  if (severity === 'none') return null

  const isHighSeverity = severity === 'high'

  if (framework) {
    // Framework-specific message
    return {
      type: 'warning',
      severity: isHighSeverity ? 'high' : 'low',
      code: AI_CODES.STREAMING_DETECTED,
      title: `${framework.name} Streaming Detected`,
      description: `${hiddenPercentage}% of content is hidden. Visible: ~${visibleWordCount.toLocaleString()} words, Hidden: ~${hiddenWordCount.toLocaleString()} words.${isHighSeverity ? ' AI crawlers will NOT see the hidden content.' : ' Most content is visible to AI crawlers.'}`,
      tip: 'Disable JavaScript in your browser and reload to verify what crawlers see.',
    }
  }

  // Generic hidden content message
  return {
    type: 'warning',
    severity: isHighSeverity ? 'high' : 'low',
    code: AI_CODES.HIDDEN_CONTENT,
    title: 'Hidden Content Detected',
    description: `${hiddenPercentage}% of content is hidden. Visible: ~${visibleWordCount.toLocaleString()} words, Hidden: ~${hiddenWordCount.toLocaleString()} words.${isHighSeverity ? ' This pattern is common with streaming SSR frameworks (Next.js, Remix, Nuxt, SvelteKit).' : ''}`,
    tip: 'Disable JavaScript in your browser and reload to verify what crawlers see.',
  }
}

// ============================================================================
// Issue Builder
// ============================================================================

/**
 * Build an array of issues from the AI result.
 * Issues are ordered by priority (highest first):
 * 1. Framework/streaming detection (high severity first)
 * 2. No content extracted
 * 3. Readability warning
 * 4. Short content warning
 */
export function buildAiIssues(input: AiIssueInput): Issue[] {
  const { result } = input
  const issues: Issue[] = []
  const { hiddenContentAnalysis } = result

  // 1. Framework/streaming detection (high severity)
  if (hiddenContentAnalysis.hasStreamingContent) {
    const streamingIssue = buildStreamingIssue(hiddenContentAnalysis)
    if (streamingIssue) {
      issues.push(streamingIssue)
    }
  }

  // 2. No content extracted
  if (result.wordCount === 0) {
    issues.push({
      type: 'warning',
      severity: 'high',
      code: AI_CODES.NO_CONTENT,
      title: 'No Content Extracted',
      description:
        'No main content could be extracted from this page. The page may rely heavily on JavaScript, have an unusual structure, or contain very little text.',
      tip: 'Use --raw to see the static HTML that AI crawlers receive.',
    })
  }

  // 3. Readability warning (only if we have some content)
  if (!result.isReaderable && result.wordCount > 0) {
    issues.push({
      type: 'warning',
      severity: 'medium',
      code: AI_CODES.NOT_READERABLE,
      title: 'Content Extraction Warning',
      description:
        'This page may not be suitable for content extraction (isProbablyReaderable: false).',
      tip: 'Consider adding semantic HTML elements like <article>, <main>, or structured headings.',
    })
  }

  // 4. Short content warning (only if no streaming and has some content)
  if (
    result.wordCount > 0 &&
    result.wordCount < 100 &&
    !hiddenContentAnalysis.hasStreamingContent
  ) {
    issues.push({
      type: 'info',
      severity: 'low',
      code: AI_CODES.SHORT_CONTENT,
      title: 'Short Content',
      description: `Very short content extracted (${result.wordCount} words). The page may be JavaScript-heavy.`,
      tip: 'Use --raw to see the static HTML that AI crawlers receive.',
    })
  }

  return issues
}
