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
import { type Result } from 'axe-core';
import type { StructureWarning } from './structure.js';
/**
 * Comprehensive list of all axe-core rules that work reliably in JSDOM.
 * These rules return definitive pass/fail results without "incomplete" outcomes.
 *
 * Tested with axe-core 4.11 and JSDOM 27.x.
 * Run `bun test` to verify compatibility - tests will fail if any rule returns incomplete.
 */
export declare const JSDOM_SAFE_RULES: readonly ["document-title", "html-has-lang", "html-lang-valid", "html-xml-lang-mismatch", "valid-lang", "bypass", "accesskeys", "landmark-banner-is-top-level", "landmark-complementary-is-top-level", "landmark-contentinfo-is-top-level", "landmark-main-is-top-level", "landmark-no-duplicate-banner", "landmark-no-duplicate-contentinfo", "landmark-no-duplicate-main", "landmark-unique", "region", "heading-order", "empty-heading", "image-alt", "image-redundant-alt", "input-image-alt", "area-alt", "svg-img-alt", "role-img-alt", "link-name", "button-name", "input-button-name", "label", "label-title-only", "select-name", "autocomplete-valid", "scope-attr-valid", "td-headers-attr", "th-has-data-cells", "table-duplicate-name", "empty-table-header", "definition-list", "dlitem", "list", "listitem", "aria-allowed-attr", "aria-allowed-role", "aria-conditional-attr", "aria-deprecated-role", "aria-hidden-body", "aria-required-attr", "aria-roles", "aria-valid-attr", "aria-command-name", "aria-input-field-name", "aria-meter-name", "aria-progressbar-name", "aria-toggle-field-name", "aria-tooltip-name", "aria-treeitem-name", "aria-required-parent", "nested-interactive", "tabindex", "presentation-role-conflict", "frame-title", "frame-title-unique", "meta-refresh", "meta-viewport", "meta-viewport-large", "avoid-inline-spacing", "blink", "marquee", "summary-name"];
/**
 * Rules focused on document structure (subset for structure command).
 * These are the most relevant rules for analyzing page structure.
 */
export declare const STRUCTURE_RULES: readonly ["document-title", "html-has-lang", "html-lang-valid", "bypass", "landmark-no-duplicate-main", "landmark-no-duplicate-banner", "landmark-no-duplicate-contentinfo", "landmark-banner-is-top-level", "landmark-main-is-top-level", "landmark-contentinfo-is-top-level", "landmark-complementary-is-top-level", "region", "heading-order", "empty-heading"];
/**
 * Rules that DO NOT work reliably in JSDOM (return "incomplete" results).
 * These rules require browser rendering or have other JSDOM limitations.
 *
 * DO NOT add these to STRUCTURE_RULES or JSDOM_SAFE_RULES.
 */
export declare const JSDOM_UNSAFE_RULES: readonly ["aria-hidden-focus", "aria-prohibited-attr", "aria-required-children", "aria-valid-attr-value", "duplicate-id-aria", "form-field-multiple-labels", "frame-tested", "landmark-one-main", "object-alt", "page-has-heading-one", "server-side-image-map", "video-caption", "color-contrast", "color-contrast-enhanced", "link-in-text-block"];
export type RuleSet = 'structure' | 'all';
export interface AxeStaticOptions {
    /**
     * Which rule set to run:
     * - 'structure': Only structure-related rules (default)
     * - 'all': All JSDOM-safe rules for comprehensive analysis
     */
    ruleSet?: RuleSet;
    /** @deprecated Use ruleSet instead. Only run structure-related rules (default: true) */
    structureOnly?: boolean;
    /** Additional rules to enable (from JSDOM_SAFE_RULES) */
    enableRules?: string[];
    /** Rules to disable */
    disableRules?: string[];
}
export interface AxeStaticResult {
    /** Violations found */
    violations: Result[];
    /** Rules that passed */
    passes: Result[];
    /** Incomplete checks (need manual review) */
    incomplete: Result[];
    /** Violations converted to StructureWarning format */
    violationWarnings: StructureWarning[];
    /** Incomplete checks converted to StructureWarning format (issues that need review) */
    issueWarnings: StructureWarning[];
    /** Combined warnings (violations + issues) - deprecated, use violationWarnings and issueWarnings */
    warnings: StructureWarning[];
}
/**
 * Run axe-core on static HTML string using jsdom
 */
export declare function runAxeOnStaticHtml(html: string, options?: AxeStaticOptions): Promise<AxeStaticResult>;
/**
 * Get list of structure rules
 */
export declare function getStructureRuleIds(): string[];
/**
 * Get list of all JSDOM-safe rules
 */
export declare function getJsdomSafeRuleIds(): string[];
/**
 * Get list of rules that are unsafe in JSDOM
 */
export declare function getJsdomUnsafeRuleIds(): string[];
/**
 * Check if a rule is safe to use in JSDOM
 */
export declare function isRuleSafeForJsdom(ruleId: string): boolean;
//# sourceMappingURL=axe-static.d.ts.map