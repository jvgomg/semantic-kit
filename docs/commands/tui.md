# TUI

Launch an interactive terminal UI for exploring semantic data.

---

## What it does

The `tui` command opens an interactive terminal interface that lets you explore multiple analysis views without running separate commands. Navigate between views using keyboard shortcuts.

---

## Usage

```bash
# Launch the TUI
semantic-kit tui

# Launch with a URL pre-loaded
semantic-kit tui https://example.com
```

---

## Arguments

| Argument | Description |
|----------|-------------|
| `[url]` | Optional. URL to analyze on startup |

---

## Available views

The TUI provides access to the following analysis views:

| View | Description |
|------|-------------|
| Structure | Page landmarks, headings, and link structure |
| Schema | Structured data (JSON-LD, Open Graph, etc.) |
| AI | Content as AI crawlers see it |
| Bot | robots.txt and crawler permissions |
| Accessibility | WCAG violations and warnings |
| Validation | HTML and schema validation results |
