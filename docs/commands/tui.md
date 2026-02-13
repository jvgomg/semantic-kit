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

# Launch with a YAML config file
semantic-kit tui --config ./urls.yaml
```

---

## Arguments

| Argument | Description |
|----------|-------------|
| `[url]` | Optional. URL to analyze on startup |

---

## Options

| Option | Description |
|--------|-------------|
| `-c, --config <path>` | Path to YAML config file with URL collections |

**Note:** The URL argument and `--config` option are mutually exclusive.

---

## Config file format

Config files define URL collections that appear in a dedicated "Config" tab in the URL list panel (press `G`).

### Basic structure

```yaml
urls:
  - url: https://example.com
    title: Homepage
  - url: https://example.com/about
```

### Grouped URLs

URLs can be organized into collapsible groups:

```yaml
urls:
  # Flat URL at top level
  - url: https://example.com
    title: Homepage

  # Grouped URLs (collapsible in the browser)
  - group: Blog Posts
    urls:
      - url: https://example.com/blog/post-1
        title: First Post
      - url: https://example.com/blog/post-2

  - group: Documentation
    urls:
      - url: https://example.com/docs/getting-started
      - url: https://example.com/docs/api-reference
```

### Field reference

| Field | Required | Description |
|-------|----------|-------------|
| `urls` | Yes | Array of URL entries or groups |
| `url` | Yes (for entries) | Valid URL string |
| `title` | No | Display title (defaults to URL path) |
| `group` | Yes (for groups) | Group name |

---

## URL list panel

Press `G` to open the URL list panel with three tabs:

| Tab | Description |
|-----|-------------|
| **Recent URLs** | Previously analyzed URLs |
| **Config** | URLs from config file (disabled if no config loaded) |
| **Sitemap** | Browse site structure from sitemap.xml |

### Config tab navigation

- **Up/Down**: Navigate items
- **Left/Right**: Collapse/expand groups
- **Enter**: Select URL for analysis
- **Tab**: Switch between tabs

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
