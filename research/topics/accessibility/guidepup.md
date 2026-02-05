---
title: "Guidepup"
lastVerified: 2026-02-03
lastUpdated: 2026-02-03
---

# Guidepup

A screen reader driver for test automation, enabling assertions on actual spoken output.

Guidepup takes a different approach from [[violation-detection-tools]]. Instead of checking DOM against rules, it drives real screen readers (VoiceOver, NVDA) programmatically and asserts on what users actually hear.

## Why Screen Reader Testing

Violation detection tools check for WCAG rule compliance but cannot verify:
- Whether announced content makes sense in context
- If navigation flows logically
- How custom components are actually experienced

Guidepup tests the real user experience by controlling actual assistive technology.

## Installation

```bash
npm install @guidepup/guidepup
```

## Supported Screen Readers

| Screen Reader | Platform | Versions |
|---------------|----------|----------|
| VoiceOver | macOS | Monterey, Ventura, Sonoma |
| NVDA | Windows | 10, Server 2019, 2022, 2025 |

## Basic Usage

### VoiceOver (macOS)

```javascript
const { voiceOver } = require('@guidepup/guidepup');

await voiceOver.start();

// Navigate to next element
await voiceOver.next();

// Get what was spoken
const phrase = await voiceOver.lastSpokenPhrase();
console.log(phrase); // e.g., "Main navigation, list, 5 items"

// Navigate by headings
await voiceOver.perform(voiceOver.keyboardCommands.findNextHeading);

// Get full log of spoken phrases
const log = await voiceOver.spokenPhraseLog();

await voiceOver.stop();
```

### NVDA (Windows)

```javascript
const { nvda } = require('@guidepup/guidepup');

await nvda.start();

await nvda.next();
const phrase = await nvda.lastSpokenPhrase();

await nvda.perform(nvda.keyboardCommands.moveToNextHeading);
const log = await nvda.spokenPhraseLog();

await nvda.stop();
```

## Key API Methods

Both screen readers expose similar APIs [^guidepup-repo]:

| Method | Purpose |
|--------|---------|
| `start()` / `stop()` | Control screen reader lifecycle |
| `next()` / `previous()` | Navigate between elements |
| `perform(command)` | Execute keyboard commands |
| `lastSpokenPhrase()` | Get most recent announcement |
| `spokenPhraseLog()` | Get all announcements |
| `itemText()` | Get current item's text |

## Virtual Screen Reader

For CI environments where real screen readers aren't available, use the Virtual Screen Reader [^virtual-screen-reader-repo]:

```bash
npm install @guidepup/virtual-screen-reader
```

```javascript
const { virtual } = require('@guidepup/virtual-screen-reader');

await virtual.start({ container: document.body });

while ((await virtual.lastSpokenPhrase()) !== 'end of document') {
  await virtual.next();
}

const log = await virtual.spokenPhraseLog();
expect(log).toContain('Submit button');

await virtual.stop();
```

### Virtual vs Real

The virtual screen reader [^virtual-screen-reader-repo]:

- **Runs anywhere** - No platform restrictions, works in CI
- **Fast** - No screen reader startup overhead
- **Spec-compliant** - Built against W3C accessibility specifications
- **Not a replacement** - Should supplement, not replace, real screen reader testing

## Playwright Integration

```bash
npm install @guidepup/playwright
```

```javascript
const { voiceOverTest as test } = require('@guidepup/playwright');

test('can navigate to search', async ({ page, voiceOver }) => {
  await page.goto('https://example.com');

  // Navigate until we find search
  while (!(await voiceOver.lastSpokenPhrase()).includes('Search')) {
    await voiceOver.next();
  }

  // Interact with the element
  await voiceOver.act();
});
```

## Environment Setup

Real screen reader automation requires system permissions:

```bash
npm install @guidepup/setup
npx @guidepup/setup
```

For GitHub Actions:

```yaml
- name: Setup Guidepup
  uses: guidepup/setup-action@v1
```

## Testing Patterns

### Assert on Announcements

```javascript
await voiceOver.next();
expect(await voiceOver.lastSpokenPhrase()).toMatch(/navigation/i);
```

### Navigate by Structure

```javascript
// Jump to next heading
await voiceOver.perform(voiceOver.keyboardCommands.findNextHeading);

// Jump to next landmark
await voiceOver.perform(voiceOver.keyboardCommands.findNextLandmark);
```

### Verify Flow

```javascript
const log = await voiceOver.spokenPhraseLog();
expect(log).toEqual([
  'Banner landmark',
  'Main navigation, list, 5 items',
  'Home, link',
  // ...
]);
```

## Comparison with Violation Detection

| Aspect | Guidepup | [[violation-detection-tools]] |
|--------|----------|-------------------------------|
| Tests | User experience | DOM compliance |
| Coverage | What users hear | WCAG rules |
| Speed | Slower (real AT) | Fast (DOM analysis) |
| False positives | Very low | Low (with axe-core) |
| Setup | More complex | Simple |

## When to Use

**Use Guidepup when:**
- You need to verify the actual screen reader experience
- Testing custom interactive components
- Ensuring navigation flow makes sense
- You have time for deeper testing

**Use Virtual Screen Reader when:**
- Running in CI without real screen readers
- Fast feedback during development
- Supplementing (not replacing) real testing

## Related Pages

- [[accessibility]] - Overview of accessibility testing
- [[violation-detection-tools]] - Rule-based testing approach
- [[axe-core]] - DOM-based testing engine

## References

[^guidepup-repo]:
  - **Source**: GitHub
  - **Title**: "guidepup/guidepup"
  - **URL**: https://github.com/guidepup/guidepup
  - **Accessed**: 2026-02-03
  - **Supports**: API methods, VoiceOver/NVDA support, Playwright integration

[^guidepup-docs]:
  - **Source**: Guidepup
  - **Title**: "Guidepup Documentation"
  - **URL**: https://www.guidepup.dev/
  - **Accessed**: 2026-02-03
  - **Supports**: Overview, ecosystem packages, getting started

[^virtual-screen-reader-repo]:
  - **Source**: GitHub
  - **Title**: "guidepup/virtual-screen-reader"
  - **URL**: https://github.com/guidepup/virtual-screen-reader
  - **Accessed**: 2026-02-03
  - **Supports**: Virtual screen reader usage, limitations, spec compliance
