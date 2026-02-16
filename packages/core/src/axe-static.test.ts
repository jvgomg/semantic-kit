/**
 * Tests for axe-core JSDOM compatibility.
 *
 * These tests verify that our JSDOM_SAFE_RULES list is accurate and complete.
 * If axe-core is updated and rules change behavior, these tests will catch it.
 */

import { type AxeResults, run as runAxe } from 'axe-core'
import { describe, it, expect } from 'bun:test'
import { JSDOM } from 'jsdom'

import {
  JSDOM_SAFE_RULES,
  JSDOM_UNSAFE_RULES,
  STRUCTURE_RULES,
  runAxeOnStaticHtml,
  getJsdomSafeRuleIds,
  getJsdomUnsafeRuleIds,
  getStructureRuleIds,
  isRuleSafeForJsdom,
} from './axe-static.js'

// Comprehensive HTML document that should trigger most rules
const COMPREHENSIVE_HTML = `
<!DOCTYPE html>
<html lang="en" xml:lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Page</title>
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <header role="banner">
    <h1>Site Title</h1>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>
  <main id="main" role="main">
    <article>
      <h2>Article Title</h2>
      <p>Content paragraph.</p>
      <h3>Sub Section</h3>
      <p>More content.</p>
      <img src="test.jpg" alt="Test image">
      <form aria-label="Test form">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" autocomplete="name">
        <button type="submit">Submit</button>
      </form>
      <table>
        <caption>Test Table</caption>
        <thead>
          <tr>
            <th scope="col">Column 1</th>
            <th scope="col">Column 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Data 1</td>
            <td>Data 2</td>
          </tr>
        </tbody>
      </table>
      <dl>
        <dt>Term</dt>
        <dd>Definition</dd>
      </dl>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <div role="button" tabindex="0">Custom Button</div>
      <div role="checkbox" aria-checked="false" tabindex="0">Checkbox</div>
      <div role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" aria-label="Progress">Progress</div>
      <div role="meter" aria-valuenow="3" aria-valuemin="0" aria-valuemax="5" aria-label="Rating">Rating</div>
      <details>
        <summary>More info</summary>
        <p>Details content</p>
      </details>
      <iframe src="frame.html" title="Embedded content"></iframe>
    </article>
    <aside aria-label="Related">
      <h2>Related</h2>
      <ul><li><a href="/related">Link</a></li></ul>
    </aside>
  </main>
  <footer role="contentinfo">
    <p>Footer content</p>
  </footer>
</body>
</html>
`

// HTML with violations to test that rules properly detect issues
const INVALID_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1></h1>
  <h3>Skipped h2</h3>
  <main></main>
  <main></main>
  <header role="banner"></header>
  <header role="banner"></header>
  <img src="test.jpg">
  <a href="/page"></a>
  <button></button>
  <input type="text">
  <div role="invalid-role">Invalid</div>
  <ul><div>Not a li</div></ul>
  <dl><div>Not dt/dd</div></dl>
</body>
</html>
`

/**
 * Helper to run axe-core directly on HTML with specific rules
 */
async function runAxeDirectly(
  html: string,
  rules: string[],
): Promise<AxeResults> {
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })

  const { window } = dom
  const { document } = window

  const originalWindow = globalThis.window
  const originalDocument = globalThis.document

  globalThis.window = window as unknown as Window & typeof globalThis
  globalThis.document = document as unknown as Document

  try {
    return await runAxe(document.documentElement, {
      runOnly: {
        type: 'rule',
        values: rules,
      },
    })
  } finally {
    globalThis.window = originalWindow as Window & typeof globalThis
    globalThis.document = originalDocument as Document
    window.close()
  }
}

describe('axe-static', () => {
  describe('JSDOM_SAFE_RULES', () => {
    it('should not return incomplete results for any safe rule', async () => {
      // Run all safe rules against comprehensive HTML
      const results = await runAxeDirectly(COMPREHENSIVE_HTML, [
        ...JSDOM_SAFE_RULES,
      ])

      // Check for incomplete results
      const incompleteRuleIds = results.incomplete.map((r) => r.id)

      expect(incompleteRuleIds).toEqual([])
    }, 30000)

    it('should not return incomplete results for any safe rule with invalid HTML', async () => {
      // Run all safe rules against invalid HTML
      const results = await runAxeDirectly(INVALID_HTML, [...JSDOM_SAFE_RULES])

      // Check for incomplete results
      const incompleteRuleIds = results.incomplete.map((r) => r.id)

      expect(incompleteRuleIds).toEqual([])
    }, 30000)

    it('should detect violations in invalid HTML', async () => {
      const results = await runAxeDirectly(INVALID_HTML, [...JSDOM_SAFE_RULES])

      // Should have some violations
      expect(results.violations.length).toBeGreaterThan(0)

      // These specific rules should detect violations
      const violationIds = results.violations.map((r) => r.id)
      expect(violationIds).toContain('document-title')
      expect(violationIds).toContain('html-has-lang')
      expect(violationIds).toContain('empty-heading')
      expect(violationIds).toContain('heading-order')
    }, 30000)
  })

  describe('STRUCTURE_RULES', () => {
    it('should be a subset of JSDOM_SAFE_RULES', () => {
      for (const rule of STRUCTURE_RULES) {
        expect(JSDOM_SAFE_RULES).toContain(rule)
      }
    })

    it('should not return incomplete results', async () => {
      const results = await runAxeDirectly(COMPREHENSIVE_HTML, [
        ...STRUCTURE_RULES,
      ])

      const incompleteRuleIds = results.incomplete.map((r) => r.id)
      expect(incompleteRuleIds).toEqual([])
    }, 30000)
  })

  describe('JSDOM_UNSAFE_RULES', () => {
    it('should not overlap with JSDOM_SAFE_RULES', () => {
      for (const rule of JSDOM_UNSAFE_RULES) {
        expect(JSDOM_SAFE_RULES).not.toContain(rule)
      }
    })

    it('should include known problematic rules', () => {
      // These rules are known to return incomplete in JSDOM
      expect(JSDOM_UNSAFE_RULES).toContain('landmark-one-main')
      expect(JSDOM_UNSAFE_RULES).toContain('page-has-heading-one')
      expect(JSDOM_UNSAFE_RULES).toContain('color-contrast')
    })
  })

  describe('runAxeOnStaticHtml', () => {
    it('should run structure rules by default', async () => {
      const result = await runAxeOnStaticHtml(COMPREHENSIVE_HTML)

      // Should have no incomplete results with default structure rules
      expect(result.incomplete).toEqual([])

      // Should have passes (the HTML is valid)
      expect(result.passes.length).toBeGreaterThan(0)
    })

    it('should run all safe rules with ruleSet="all"', async () => {
      const result = await runAxeOnStaticHtml(COMPREHENSIVE_HTML, {
        ruleSet: 'all',
      })

      // Should have no incomplete results
      expect(result.incomplete).toEqual([])

      // Should have more passes than structure-only
      const structureResult = await runAxeOnStaticHtml(COMPREHENSIVE_HTML, {
        ruleSet: 'structure',
      })

      expect(result.passes.length).toBeGreaterThan(
        structureResult.passes.length,
      )
    })

    it('should detect violations in invalid HTML', async () => {
      const result = await runAxeOnStaticHtml(INVALID_HTML, { ruleSet: 'all' })

      // Should have no incomplete results
      expect(result.incomplete).toEqual([])

      // Should have violations
      expect(result.violations.length).toBeGreaterThan(0)

      // Should have converted violations to warnings
      expect(result.violationWarnings.length).toBe(result.violations.length)
    })
  })

  describe('utility functions', () => {
    it('getStructureRuleIds should return STRUCTURE_RULES', () => {
      const ids = getStructureRuleIds()
      expect(ids).toEqual([...STRUCTURE_RULES])
    })

    it('getJsdomSafeRuleIds should return JSDOM_SAFE_RULES', () => {
      const ids = getJsdomSafeRuleIds()
      expect(ids).toEqual([...JSDOM_SAFE_RULES])
    })

    it('getJsdomUnsafeRuleIds should return JSDOM_UNSAFE_RULES', () => {
      const ids = getJsdomUnsafeRuleIds()
      expect(ids).toEqual([...JSDOM_UNSAFE_RULES])
    })

    it('isRuleSafeForJsdom should correctly identify safe rules', () => {
      expect(isRuleSafeForJsdom('document-title')).toBe(true)
      expect(isRuleSafeForJsdom('image-alt')).toBe(true)
      expect(isRuleSafeForJsdom('color-contrast')).toBe(false)
      expect(isRuleSafeForJsdom('landmark-one-main')).toBe(false)
      expect(isRuleSafeForJsdom('nonexistent-rule')).toBe(false)
    })
  })
})
