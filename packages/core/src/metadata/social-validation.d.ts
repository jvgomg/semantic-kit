/**
 * Social metadata validation with tiered severity levels.
 *
 * Validation rules based on platform research:
 * - error: Breaks functionality (invalid URL format)
 * - warning: Affects quality (truncation, missing dimensions)
 * - info: Best practice (missing alt text, no twitter:card)
 *
 * @see research/topics/social-metadata/open-graph-validation.md
 */
import { type SocialValidationIssue } from './types.js';
/**
 * Safe character limit for og:title to avoid truncation on most platforms.
 * Facebook truncates at 88 chars, LinkedIn at 119, Twitter at ~70.
 */
export declare const TITLE_CHAR_LIMIT = 60;
/**
 * Safe character limit for og:description to avoid truncation.
 * Facebook shows 55-60 chars/line, LinkedIn shows 69 chars.
 */
export declare const DESCRIPTION_CHAR_LIMIT = 155;
/**
 * Options for configuring validation behavior.
 */
export interface ValidationOptions {
    /** Check for missing required/recommended tags (default: false) */
    checkPresence?: boolean;
    /** Check for quality issues like URL format, length, dimensions (default: true) */
    checkQuality?: boolean;
}
/**
 * Check if a URL is absolute (has protocol).
 */
export declare function isAbsoluteUrl(url: string): boolean;
/**
 * Validate og:url is absolute.
 * Per OGP spec, og:url must be a fully qualified URL with protocol.
 */
export declare function validateOgUrl(ogUrl: string | undefined): SocialValidationIssue | null;
/**
 * Validate og:title character length.
 * Titles over 60 characters will truncate on most platforms.
 */
export declare function validateOgTitleLength(ogTitle: string | undefined): SocialValidationIssue | null;
/**
 * Validate og:description character length.
 * Descriptions over 155 characters will truncate on most platforms.
 */
export declare function validateOgDescriptionLength(ogDescription: string | undefined): SocialValidationIssue | null;
/**
 * Validate image dimensions are provided when og:image is present.
 * Missing dimensions delay first-share rendering as platforms must fetch the image.
 */
export declare function validateImageDimensions(ogImage: string | undefined, ogImageWidth: string | undefined, ogImageHeight: string | undefined): SocialValidationIssue | null;
/**
 * Validate image alt text is provided.
 * Twitter uses twitter:image:alt for accessibility; Facebook ignores og:image:alt.
 */
export declare function validateImageAltText(ogImage: string | undefined, twitterImage: string | undefined, ogImageAlt: string | undefined, twitterImageAlt: string | undefined): SocialValidationIssue | null;
/**
 * Check if twitter:card is missing.
 * Without twitter:card, Twitter shows plain text with no preview card.
 */
export declare function validateTwitterCard(twitterCard: string | undefined): SocialValidationIssue | null;
/**
 * Input for validation - all relevant social tags.
 */
export interface ValidationInput {
    'og:url'?: string;
    'og:title'?: string;
    'og:type'?: string;
    'og:description'?: string;
    'og:image'?: string;
    'og:image:width'?: string;
    'og:image:height'?: string;
    'og:image:alt'?: string;
    'og:site_name'?: string;
    'og:locale'?: string;
    'twitter:card'?: string;
    'twitter:title'?: string;
    'twitter:description'?: string;
    'twitter:image'?: string;
    'twitter:image:alt'?: string;
    [key: string]: string | undefined;
}
/**
 * Run validation rules and return issues.
 *
 * @param input - Normalized metatags (single values, not arrays)
 * @param options - Validation options (defaults to quality checks only)
 */
export declare function validateSocialTags(input: ValidationInput, options?: ValidationOptions): SocialValidationIssue[];
/**
 * Sort issues by severity (errors first, then warnings, then info).
 */
export declare function sortIssuesBySeverity(issues: SocialValidationIssue[]): SocialValidationIssue[];
//# sourceMappingURL=social-validation.d.ts.map