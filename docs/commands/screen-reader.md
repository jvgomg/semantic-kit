# Screen Reader

Show how screen readers interpret your page for assistive technology users.

---

## What it does

The `screen-reader` lens shows the accessibility tree that screen readers (VoiceOver, NVDA, JAWS) use to present your page to users who rely on assistive technology. This helps you understand the actual user experience for people with visual impairments.

---

## Usage

```bash
# Show accessibility tree
semantic-kit screen-reader https://example.com

# Summary output
semantic-kit screen-reader https://example.com --format compact

# Machine-readable output
semantic-kit screen-reader https://example.com --format json

# Custom timeout for slow pages
semantic-kit screen-reader https://example.com --timeout 10000
```

---

## Options

| Option | Description |
|--------|-------------|
| `--format full` | Default. Full accessibility tree |
| `--format compact` | Summary with key landmarks and issues |
| `--format json` | Machine-readable JSON output |
| `--timeout <ms>` | Page load timeout (default: 5000) |

---

## Behavior

| What it does | Why |
|--------------|-----|
| Uses JavaScript rendering | Real screen readers see the rendered page |
| Extracts accessibility tree | Same tree browsers expose to assistive tech |
| Shows ARIA roles and names | What screen readers actually announce |
| Reports structure issues | Missing labels, unnamed elements |

---

## What it shows

### Accessibility Tree

The accessibility tree is a simplified representation of the DOM that browsers expose to assistive technology. Each node has:

| Property | Description |
|----------|-------------|
| Role | Semantic role (button, link, heading, etc.) |
| Name | Accessible name (text content, aria-label, etc.) |
| Description | Additional description (aria-describedby) |
| Children | Nested accessible elements |

### Common Roles

| Role | HTML Source |
|------|-------------|
| `banner` | `<header>` (top-level) |
| `navigation` | `<nav>` |
| `main` | `<main>` |
| `contentinfo` | `<footer>` (top-level) |
| `heading` | `<h1>` - `<h6>` |
| `button` | `<button>`, `role="button"` |
| `link` | `<a href="...">` |
| `textbox` | `<input type="text">` |
| `img` | `<img>` with alt text |

---

## Output

### Default output

```
semantic-kit v0.0.17

Screen reader analysis for https://example.com. Took 1.2s.

ACCESSIBILITY TREE

WebArea "Example Site - Home"
  banner
    navigation "Main"
      link "Home"
      link "About"
      link "Contact"
  main
    heading "Welcome to Example" (level 1)
    paragraph "This is the introduction..."
    button "Get Started"
  contentinfo
    link "Privacy Policy"
```

### Compact output

```
semantic-kit v0.0.17

Screen reader analysis for https://example.com. Took 1.2s.

LANDMARKS
banner: 1
navigation: 1
main: 1
contentinfo: 1

SUMMARY
Headings: 5 (1 h1, 2 h2, 2 h3)
Links: 12
Buttons: 3
Images: 4 (all with alt text)

ISSUES (1)
[warning] Button without accessible name at line 45
```

---

## Common problems

### Unnamed button

```
button (no name)
```

**Problem:** Screen readers will announce "button" with no context.

**Solution:** Add text content or an accessible name:
```html
<button>Submit</button>
<!-- or -->
<button aria-label="Submit form">
  <svg>...</svg>
</button>
```

### Image without alt text

```
img (no name)
```

**Problem:** Screen readers can't describe the image.

**Solution:** Add alt text:
```html
<img src="chart.png" alt="Sales growth chart showing 50% increase">
```

### Missing landmarks

```
LANDMARKS
main: 0
```

**Problem:** No `<main>` element helps users skip to content.

**Solution:** Add semantic landmarks:
```html
<header>...</header>
<main>...</main>
<footer>...</footer>
```

### Generic elements with interaction

```
StaticText "Click here"
```

**Problem:** Interactive text without semantic role.

**Solution:** Use semantic elements:
```html
<!-- Instead of -->
<span onclick="doSomething()">Click here</span>

<!-- Use -->
<button onclick="doSomething()">Click here</button>
```

---

## screen-reader vs a11y-tree

| Aspect | `screen-reader` | `a11y-tree` |
|--------|-----------------|-------------|
| Purpose | User experience preview | Developer debugging |
| Rendering | Always JS-rendered | Static or JS variants |
| Framing | "VoiceOver sees..." | Raw accessibility tree |
| Category | Lens | Utility |

Use `screen-reader` for user experience insight. Use `a11y-tree` commands for debugging with static/JS comparison.

---

## Requirements

This command requires Playwright for browser rendering:

```bash
bunx playwright install chromium
```

---

## TUI

The screen reader lens is available in the TUI under **Lenses > Screen Reader**.

```bash
semantic-kit tui
# Then select Screen Reader from the Lenses section
```

---

## Related

- [Accessibility Tree](./a11y-tree.md) - Raw accessibility tree analysis
- [Accessibility Validation](./validate-a11y.md) - WCAG compliance checking
- [Structure](./structure.md) - Page structure (landmarks, headings)
