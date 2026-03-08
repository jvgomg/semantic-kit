---
id: TASK-050
title: 'Add og:image URL validation to core extractors'
status: Done
assignee: []
created_date: '2026-03-08 12:25'
updated_date: '2026-03-08 12:40'
labels:
  - feature
  - core
  - validation
dependencies:
  - TASK-041
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Context

When testing ASCII image preview (TASK-041) on real-world pages, we discovered pages with broken og:image URLs that return 404. For example:

- Page: `https://jvg.omg.lol/abc/the-work-is-in-the-fog-of-war`
- og:image: `https://jvg.omg.lol/james/abc/the-work-is-in-the-fog-of-war/og?v=1` (returns 404)

This is valuable validation that semantic-kit should surface - broken og:images mean social previews on Twitter, LinkedIn, Facebook etc. will fail.

## Proposed Change

**Affected package:** `@webspecs/core`

Add validation rules that check if og:image URLs actually resolve:

1. **HTTP HEAD request** to og:image URL to verify it exists
2. **Content-Type check** to verify it's actually an image
3. **Report validation issues** with severity (error for 404, warning for slow response, etc.)

## Implementation Approach

**Key files likely involved:**
- `packages/core/src/extractors/social.ts` - Social metadata extraction
- `packages/core/src/validators/` - New or existing validation module

**Considerations:**
- Network latency: Validation adds HTTP requests - make it opt-in or async
- Timeout handling: Don't hang on slow servers
- Redirect following: Some og:image URLs redirect
- Rate limiting: Be mindful when validating multiple URLs

## Output Format

Validation results should indicate:
- URL checked
- HTTP status code
- Content-Type (if successful)
- Whether it's a valid image type
- Error/warning message for issues
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 og:image URLs are validated via HTTP HEAD request automatically
- [x] #2 404 and other error responses are reported as validation errors
- [x] #3 Successful responses verify Content-Type is an image type
- [x] #4 Validation has configurable timeout (default ~5 seconds)
- [x] #5 Validation results include URL, status code, and error/warning message
- [x] #6 Validation runs automatically on every social command (always on, not opt-in)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Phase 1: Core Validation Module ✅

Created `packages/core/src/metadata/image-validation.ts` with:

1. **HTTP Validation**
   - HEAD request (with GET fallback for servers that don't support HEAD)
   - 404 → error severity (image not found)
   - 4xx → error severity (access issues)
   - 5xx → warning severity (server may be temporarily unavailable)
   - Timeout handling with configurable duration (default 5s)

2. **Content-Type Validation**
   - Verify response is `image/*` MIME type
   - Error if URL returns HTML, JSON, or other non-image content

3. **Format Validation**
   - Universal support: JPEG, PNG, GIF, WebP (no issues)
   - Partial support: AVIF (warning about compatibility)
   - Unknown formats: warning to use standard formats

4. **File Size Validation**
   - Platform limits from research:
     - Facebook: 8MB
     - LinkedIn: 5MB  
     - Twitter: 5MB
   - Universal limit: 5MB (strictest common denominator)
   - Warning when image exceeds platform-specific limits

### Phase 2: Test Coverage ✅

Created comprehensive test suite with 51 tests covering:
- All HTTP status codes (200, 404, 403, 401, 500, 502, 503)
- All image formats (JPEG, PNG, GIF, WebP, AVIF, BMP)
- File size scenarios (under/at/over limits)
- Network errors (timeout, DNS failure, connection refused)
- Edge cases (missing Content-Type, missing Content-Length)

### Phase 3: Integration ✅

- Integrated into `fetchSocial` in core runners
- Image validation runs automatically for og:image and twitter:image
- Issues merged into existing issues array
- Updated test fixtures to use port 4050 with real images
- Fixed test server to serve binary image files correctly
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implementation Notes (2026-03-08)

### Files Created
- `packages/core/src/metadata/image-validation.ts` - Main validation module
- `packages/core/src/metadata/image-validation.test.ts` - 51 unit tests

### Exported API
```typescript
// Constants
SUPPORTED_IMAGE_TYPES  // ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
PARTIAL_SUPPORT_IMAGE_TYPES  // ['image/avif']
PLATFORM_SIZE_LIMITS  // { facebook: 8MB, linkedin: 5MB, twitter: 5MB }
UNIVERSAL_SIZE_LIMIT  // 5MB
DEFAULT_TIMEOUT_MS  // 5000

// Functions
validateImageUrl(url, tag?, options?)  // Single URL validation
validateImageUrls(urls, options?)  // Batch validation
```

### Research Integration
All constants derived from `research/topics/social-metadata/open-graph-validation.md`:
- Platform size limits from Image Requirements table
- Supported formats from research findings
- Validation tiers (error/warning) from recommended validation strategy

### Design Decisions
1. **Async by design** - Network requests require async, kept separate from sync validation
2. **HEAD first, GET fallback** - Minimize bandwidth while handling servers that reject HEAD
3. **Opt-in validation** - Requires explicit call to avoid unexpected network requests
4. **Custom fetch support** - Allows dependency injection for testing

## Integration Complete (2026-03-08)

### Changes Made
1. **runners.ts** - Added `validateImageUrls` call in `fetchSocial`
2. **test-server/lib/fixtures.ts** - Added image MIME types and binary file support
3. **test-server/fixtures/images/** - Added preview.png and social-preview.png
4. **test fixtures** - Updated all localhost:4000 → localhost:4050
5. **integration tests** - Updated URL expectations

### Validation Now Automatic
Image validation runs on every `social` command:
- No opt-in flag needed
- Both og:image and twitter:image validated
- Issues sorted by severity (errors first)

### Test Results
- 51 unit tests for image-validation.ts
- 17 integration tests for social command
- All passing
<!-- SECTION:NOTES:END -->
