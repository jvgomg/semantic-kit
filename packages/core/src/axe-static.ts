/**
 * Run axe-core accessibility checks on static HTML using jsdom.
 *
 * This provides authoritative WCAG rule coverage from Deque's axe-core engine
 * without requiring a browser. Some rules (like color-contrast) are disabled
 * as they require real rendering.
 *
 * Rule lists are based on empirical testing with axe-core 4.11 and JSDOM 27.x.
 * Run `bun test` to verify compatibility - tests will fail if any rule returns incomplete.
 */

import axe, { type AxeResults, type Result, type RunOptions } from 'axe-core'

// eslint-disable-next-line import-x/no-named-as-default-member
const runAxe = axe.run

import { JSDOM } from 'jsdom'

import type { StructureWarning } from './structure.js'

// ============================================================================
// Rule Configuration
// ============================================================================

/**
 * Comprehensive list of all axe-core rules that work reliably in JSDOM.
 * These rules return definitive pass/fail results without "incomplete" outcomes.
 *
 * Tested with axe-core 4.11 and JSDOM 27.x.
 * Run `bun test` to verify compatibility - tests will fail if any rule returns incomplete.
 */
export const JSDOM_SAFE_RULES = [
  // Document & Language
  'document-title', // Page must have a title
  'html-has-lang', // <html> must have lang attribute
  'html-lang-valid', // lang attribute must be valid
  'html-xml-lang-mismatch', // xml:lang and lang must match
  'valid-lang', // lang attributes must use valid language codes

  // Navigation & Bypass
  'bypass', // Page must have means to bypass repeated content
  'accesskeys', // accesskey values should be unique

  // Landmarks
  'landmark-banner-is-top-level', // Banner landmark should be top level
  'landmark-complementary-is-top-level', // Complementary landmark should be top level
  'landmark-contentinfo-is-top-level', // Contentinfo landmark should be top level
  'landmark-main-is-top-level', // Main landmark should be top level
  'landmark-no-duplicate-banner', // Only one banner landmark
  'landmark-no-duplicate-contentinfo', // Only one contentinfo landmark
  'landmark-no-duplicate-main', // Only one main landmark
  'landmark-unique', // Landmarks must have unique role/label combination
  'region', // All page content should be contained by landmarks

  // Headings
  'heading-order', // Heading levels should increase by one
  'empty-heading', // Headings must have content

  // Images
  'image-alt', // Images must have alt text
  'image-redundant-alt', // Alt text should not duplicate adjacent text
  'input-image-alt', // Image buttons must have alt text
  'area-alt', // Image map areas must have alt text
  'svg-img-alt', // SVG elements with img role must have alt text
  'role-img-alt', // Elements with role="img" must have alt text

  // Links
  'link-name', // Links must have discernible text

  // Buttons
  'button-name', // Buttons must have discernible text
  'input-button-name', // Input buttons must have discernible text

  // Forms
  'label', // Form elements must have labels
  'label-title-only', // Form elements should not only use title for label
  'select-name', // Select elements must have accessible name
  'autocomplete-valid', // autocomplete attribute must be valid

  // Tables
  'scope-attr-valid', // scope attribute must be valid
  'td-headers-attr', // td headers attribute must reference valid th
  'th-has-data-cells', // th elements must have data cells
  'table-duplicate-name', // Tables should not have duplicate captions
  'empty-table-header', // Table headers must have content

  // Lists
  'definition-list', // dl elements must contain proper structure
  'dlitem', // dt and dd must be in dl
  'list', // ul/ol must contain only li elements
  'listitem', // li must be in ul/ol

  // ARIA - Attributes
  'aria-allowed-attr', // ARIA attributes must be valid for role
  'aria-allowed-role', // ARIA role must be valid for element
  'aria-conditional-attr', // ARIA attributes must meet conditions
  'aria-deprecated-role', // Deprecated ARIA roles should not be used
  'aria-hidden-body', // aria-hidden should not be on body
  'aria-required-attr', // Required ARIA attributes must be present
  'aria-roles', // ARIA roles must be valid
  'aria-valid-attr', // ARIA attributes must be valid

  // ARIA - Names
  'aria-command-name', // ARIA commands must have accessible name
  'aria-input-field-name', // ARIA input fields must have accessible name
  'aria-meter-name', // ARIA meters must have accessible name
  'aria-progressbar-name', // ARIA progressbars must have accessible name
  'aria-toggle-field-name', // ARIA toggle fields must have accessible name
  'aria-tooltip-name', // ARIA tooltips must have accessible name
  'aria-treeitem-name', // ARIA treeitems must have accessible name

  // ARIA - Structure
  'aria-required-parent', // ARIA roles must have required parent

  // Interactive Elements
  'nested-interactive', // Interactive elements must not be nested
  'tabindex', // tabindex should not be greater than 0
  'presentation-role-conflict', // Elements with role="presentation" should not have focusable descendants

  // Frames
  'frame-title', // Frames must have title attribute
  'frame-title-unique', // Frame titles must be unique

  // Meta
  'meta-refresh', // meta refresh should not be used
  'meta-viewport', // meta viewport should not disable zoom
  'meta-viewport-large', // meta viewport should allow significant zoom
  'avoid-inline-spacing', // Inline text spacing should be adjustable

  // Deprecated Elements
  'blink', // blink element should not be used
  'marquee', // marquee element should not be used

  // Misc
  'summary-name', // summary elements must have accessible name
] as const

/**
 * Rules focused on document structure (subset for structure command).
 * These are the most relevant rules for analyzing page structure.
 */
export const STRUCTURE_RULES = [
  // Document metadata
  'document-title', // Page must have a title
  'html-has-lang', // <html> must have lang attribute
  'html-lang-valid', // lang attribute must be valid

  // Navigation & Bypass
  'bypass', // Skip links or landmarks for bypass

  // Landmarks - structure
  'landmark-no-duplicate-main', // Only one main landmark
  'landmark-no-duplicate-banner', // Only one banner landmark
  'landmark-no-duplicate-contentinfo', // Only one contentinfo landmark
  'landmark-banner-is-top-level', // Banner should be top level
  'landmark-main-is-top-level', // Main should be top level
  'landmark-contentinfo-is-top-level', // Contentinfo should be top level
  'landmark-complementary-is-top-level', // Complementary should be top level
  'region', // All content should be in landmarks

  // Headings
  'heading-order', // Heading levels should increase by one
  'empty-heading', // Headings must have content
] as const

/**
 * Rules that DO NOT work reliably in JSDOM (return "incomplete" results).
 * These rules require browser rendering or have other JSDOM limitations.
 *
 * DO NOT add these to STRUCTURE_RULES or JSDOM_SAFE_RULES.
 */
export const JSDOM_UNSAFE_RULES = [
  // Return "incomplete" in JSDOM
  'aria-hidden-focus', // Requires focus/visibility checks
  'aria-prohibited-attr', // Has JSDOM edge cases
  'aria-required-children', // Has JSDOM edge cases
  'aria-valid-attr-value', // Has JSDOM edge cases
  'duplicate-id-aria', // Has JSDOM edge cases
  'form-field-multiple-labels', // Has JSDOM edge cases
  'frame-tested', // Requires frame testing
  'landmark-one-main', // Requires visibility checks
  'object-alt', // Has JSDOM edge cases
  'page-has-heading-one', // Requires visibility checks
  'server-side-image-map', // Has JSDOM edge cases
  'video-caption', // Has JSDOM edge cases

  // Require browser rendering (color/visual)
  'color-contrast', // Requires computed styles
  'color-contrast-enhanced', // Requires computed styles
  'link-in-text-block', // Requires color computation
] as const

// ============================================================================
// Types
// ============================================================================

export type RuleSet = 'structure' | 'all'

export interface AxeStaticOptions {
  /**
   * Which rule set to run:
   * - 'structure': Only structure-related rules (default)
   * - 'all': All JSDOM-safe rules for comprehensive analysis
   */
  ruleSet?: RuleSet
  /** @deprecated Use ruleSet instead. Only run structure-related rules (default: true) */
  structureOnly?: boolean
  /** Additional rules to enable (from JSDOM_SAFE_RULES) */
  enableRules?: string[]
  /** Rules to disable */
  disableRules?: string[]
}

export interface AxeStaticResult {
  /** Violations found */
  violations: Result[]
  /** Rules that passed */
  passes: Result[]
  /** Incomplete checks (need manual review) */
  incomplete: Result[]
  /** Violations converted to StructureWarning format */
  violationWarnings: StructureWarning[]
  /** Incomplete checks converted to StructureWarning format (issues that need review) */
  issueWarnings: StructureWarning[]
  /** Combined warnings (violations + issues) - deprecated, use violationWarnings and issueWarnings */
  warnings: StructureWarning[]
}

// ============================================================================
// Severity Mapping
// ============================================================================

/**
 * Map axe-core impact to our severity levels
 */
function mapImpactToSeverity(
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | null,
): 'error' | 'warning' {
  switch (impact) {
    case 'critical':
    case 'serious':
      return 'error'
    case 'moderate':
    case 'minor':
    default:
      return 'warning'
  }
}

/**
 * Convert axe-core violation to StructureWarning
 */
function violationToWarning(violation: Result): StructureWarning {
  const nodeCount = violation.nodes.length
  const nodeInfo = nodeCount > 1 ? ` (${nodeCount} instances)` : ''

  return {
    id: violation.id,
    severity: mapImpactToSeverity(violation.impact ?? null),
    message: `${violation.help}${nodeInfo}`,
    details: violation.description,
  }
}

/**
 * Convert axe-core incomplete result to StructureWarning
 * Incomplete results need manual review - we surface them as warnings
 */
function incompleteToWarning(incomplete: Result): StructureWarning {
  const nodeCount = incomplete.nodes.length
  const nodeInfo = nodeCount > 1 ? ` (${nodeCount} instances)` : ''

  return {
    id: incomplete.id,
    severity: 'warning', // Incomplete items are always warnings (need review)
    message: `${incomplete.help}${nodeInfo}`,
    details: `${incomplete.description} (needs manual review)`,
  }
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Run axe-core on static HTML string using jsdom
 */
export async function runAxeOnStaticHtml(
  html: string,
  options: AxeStaticOptions = {},
): Promise<AxeStaticResult> {
  const {
    ruleSet,
    structureOnly = true, // deprecated, but still supported
    enableRules = [],
    disableRules = [],
  } = options

  // Create jsdom instance - don't run scripts as we only need the DOM structure
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })

  const { window } = dom
  const { document } = window

  // Set up globals that axe-core expects
  const originalWindow = globalThis.window
  const originalDocument = globalThis.document

  globalThis.window = window as unknown as Window & typeof globalThis
  globalThis.document = document as unknown as Document

  // Determine which rules to run based on ruleSet or legacy structureOnly
  let baseRules: readonly string[]
  if (ruleSet === 'all') {
    baseRules = JSDOM_SAFE_RULES
  } else if (ruleSet === 'structure' || structureOnly) {
    baseRules = STRUCTURE_RULES
  } else {
    // No restriction - but we still limit to safe rules
    baseRules = JSDOM_SAFE_RULES
  }

  // Combine base rules with any additional enabled rules
  // Filter enableRules to only include safe rules
  const safeEnableRules = enableRules.filter((rule) =>
    JSDOM_SAFE_RULES.includes(rule as (typeof JSDOM_SAFE_RULES)[number]),
  )
  const rulesToRun = [...new Set([...baseRules, ...safeEnableRules])]

  const axeConfig: RunOptions = {
    rules: {},
  }

  // Disable all unsafe rules explicitly
  for (const rule of JSDOM_UNSAFE_RULES) {
    axeConfig.rules![rule] = { enabled: false }
  }

  // Apply additional disabled rules
  for (const rule of disableRules) {
    axeConfig.rules![rule] = { enabled: false }
  }

  // Set runOnly to our safe rules
  axeConfig.runOnly = {
    type: 'rule',
    values: rulesToRun,
  }

  try {
    // Run axe-core on document.documentElement
    const results: AxeResults = await runAxe(
      document.documentElement,
      axeConfig,
    )

    // Convert violations and incomplete results to warnings
    // Violations are definite issues, incomplete items need manual review
    const violationWarnings = results.violations.map(violationToWarning)
    const issueWarnings = results.incomplete.map(incompleteToWarning)

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      violationWarnings,
      issueWarnings,
      warnings: [...violationWarnings, ...issueWarnings], // Combined for backwards compat
    }
  } finally {
    // Restore globals
    globalThis.window = originalWindow as Window & typeof globalThis
    globalThis.document = originalDocument as Document

    // Clean up jsdom
    window.close()
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get list of structure rules
 */
export function getStructureRuleIds(): string[] {
  return [...STRUCTURE_RULES]
}

/**
 * Get list of all JSDOM-safe rules
 */
export function getJsdomSafeRuleIds(): string[] {
  return [...JSDOM_SAFE_RULES]
}

/**
 * Get list of rules that are unsafe in JSDOM
 */
export function getJsdomUnsafeRuleIds(): string[] {
  return [...JSDOM_UNSAFE_RULES]
}

/**
 * Check if a rule is safe to use in JSDOM
 */
export function isRuleSafeForJsdom(ruleId: string): boolean {
  return JSDOM_SAFE_RULES.includes(ruleId as (typeof JSDOM_SAFE_RULES)[number])
}
