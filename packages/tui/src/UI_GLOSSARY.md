# Semantic-Kit TUI Glossary

This document defines the standard terminology for discussing the Semantic-Kit TUI interface. Use these terms consistently in code, documentation, and discussions.

---

## Layout Regions

The TUI is divided into distinct **regions** - persistent areas of the screen that serve specific purposes.

```
┌─────────────────────────────────────────────────────────────────┐
│ URL Bar                                                         │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│   Sidebar    │              Main Content                        │
│    (Menu)    │                                                  │
│              │                                                  │
│              │                                                  │
├──────────────┴──────────────────────────────────────────────────┤
│ Status Bar                                                      │
└─────────────────────────────────────────────────────────────────┘
```

### URL Bar

- **Location**: Top of screen, full width
- **Purpose**: Input field for entering the URL to analyze
- **Height**: Fixed (3 rows including border)
- **States**: Focused (editable), Unfocused (display only)

### Sidebar (Menu)

- **Location**: Left side, below URL Bar
- **Purpose**: Navigation between analysis views
- **Width**: Auto-sized to fit longest menu item label
- **Contains**: List of selectable menu items

### Main Content

- **Location**: Center, fills remaining horizontal space
- **Purpose**: Displays the currently selected view's output
- **Height**: Fills vertical space between URL Bar and Status Bar
- **Features**: Scrollable content area with header

### Status Bar

- **Location**: Bottom of screen, full width
- **Purpose**: Contextual hints and global action shortcuts
- **Height**: Fixed (1 row)
- **Content**: Left side shows context-specific hints, right side shows global shortcuts

---

## Overlay Elements

**Overlays** are temporary UI elements that appear on top of the main layout.

### Info Panel

- **Type**: Contextual overlay
- **Visibility**: Only shown when Sidebar (Menu) is focused; hidden otherwise
- **Position**: Adjacent to the currently selected menu item, connected by a visual indicator
- **Purpose**: Shows description/documentation for the selected menu item
- **Visual**: Connected to menu item with a horizontal line (─)
- **Note**: Does not block input to other regions (it's informational, not a modal)

### Help Modal

- **Type**: Modal overlay
- **Trigger**: Press `?` key
- **Position**: Centered over content
- **Purpose**: Displays all keyboard shortcuts
- **Dismiss**: Press `?`, `Esc`, or `q`

### URL List Modal

- **Type**: Modal overlay
- **Trigger**: Press `G` (Shift+g)
- **Position**: Centered on screen
- **Purpose**: Quick selection from recent/saved URLs
- **Dismiss**: Press `Esc` or `q`, or select a URL
- **Note**: Blocks input to all other regions while open

---

## Interactive Concepts

### Focus vs Active

The TUI distinguishes between two input states:

**Focus** - Which region is visually highlighted and will receive input when no modal is open.
- **Visual indicator**: Cyan border color
- **Focus cycle**: URL Bar → Sidebar → Main Content → (repeat)
- **Navigation**: `Tab` moves forward, `Shift+Tab` moves backward
- Focus is preserved when modals open/close

**Active** - Whether a region is currently accepting keyboard input.
- A region is active when: it is focused AND no modal is open
- When a modal is open, only the modal is active; all other regions ignore input
- This prevents accidental navigation (e.g., arrow keys changing menu while in URL List modal)

### Selection

The currently highlighted item within a focused region.

- **Visual indicator**: `▸` prefix + cyan text + gray background
- **Menu selection**: Determines which view is displayed in Main Content
- **List selection**: Determines which item will be acted upon

### Scroll Position

The current viewport offset within scrollable content.

- **Indicator**: Line count shown in header (e.g., "1-20/45")
- **Navigation**: `↑`/`↓` for line scroll, `PgUp`/`PgDn` for page scroll

---

## Visual Conventions

### Colors

Colors are defined centrally in `src/tui/theme.ts`. The TUI uses ANSI color names
(not hex values) to respect user terminal themes. See theme.ts for documentation
on this approach.

| Element | Theme Key | Meaning |
|---------|-----------|---------|
| Focused border | `borderFocused` (cyan) | Region has keyboard focus |
| Unfocused border | `borderUnfocused` (gray) | Region is inactive |
| Selected item | `textSelected` + `backgroundSelected` | Currently selected |
| Normal item | `text` (white) | Selectable but not selected |
| Hint text | `textHint` (gray) | Secondary information |
| Keyboard shortcut | `textShortcut` (yellow) | Key binding reference |
| Modal background | `modalBackground` (black) | Overlay backgrounds |

### Border Styles

| Style | Usage |
|-------|-------|
| `round` | Standard region borders |
| `double` | Modal dialogs |

### Icons/Indicators

| Symbol | Meaning |
|--------|---------|
| `▸` | Selection indicator (points to active item) |
| `▋` | Text cursor |
| `─` | Connector (links Info Panel to menu item) |

---

## Keyboard Shortcuts

### Global (work from any region)

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next region |
| `Shift+Tab` | Move focus to previous region |
| `g` | Jump focus to URL Bar |
| `G` | Open URL List modal |
| `r` | Reload current view |
| `?` | Toggle Help modal |
| `q` / `Ctrl+C` | Quit application |

### Region-Specific

| Region | Key | Action |
|--------|-----|--------|
| URL Bar | `Enter` | Confirm URL, move to Sidebar |
| Sidebar | `↑`/`↓` | Navigate menu items |
| Main Content | `↑`/`↓` | Scroll content |
| Main Content | `PgUp`/`PgDn` | Page scroll |

### Modal-Specific

| Modal | Key | Action |
|-------|-----|--------|
| Any modal | `Esc` | Close modal |
| URL List | `↑`/`↓` | Navigate list |
| URL List | `Enter` | Select URL |

---

## Mouse Interactions

Mouse support is enabled for convenience alongside keyboard navigation.

### Click Actions

| Target | Action |
|--------|--------|
| URL Bar | Focus the URL Bar for text input |
| Menu item | Select the item and focus the Sidebar |
| Main Content area | Focus Main Content |

### Scroll Actions

| Target | Action |
|--------|--------|
| Main Content | Scroll content up/down with mouse wheel |
| Info Panel | Scroll panel content (when visible) |

**Note**: Mouse interactions are disabled when a modal is open.

---

## State Terminology

### View States

| State | Description |
|-------|-------------|
| `idle` | No data loaded, waiting for URL |
| `loading` | Fetching data for current URL |
| `success` | Data loaded and displayed |
| `error` | Fetch failed, showing error message |

### Modal States

| State | Description |
|-------|-------------|
| `null` | No modal open, normal operation |
| `help` | Help modal is displayed |
| `url-list` | URL List modal is displayed |

---

## Component Naming

When creating or discussing components, use these naming conventions:

| Pattern | Example | Usage |
|---------|---------|-------|
| `*Bar` | `UrlBar`, `StatusBar` | Horizontal strip regions |
| `*Panel` | `InfoPanel` | Overlay panels |
| `*Modal` | `HelpModal` | Blocking modal dialogs |
| `*Content` | `MainContent` | Primary content areas |
| `*List` | `UrlList` | Scrollable lists |
| `*Item` | `MenuItem` | Individual selectable items |

---

## Future Concepts (Reserved)

These terms are reserved for planned features:

- **Tab Bar**: Horizontal tabs within Main Content for views with sub-views
- **Breadcrumb**: Navigation path display for nested views
- **Toast**: Temporary notification messages
- **Command Palette**: Fuzzy-find action picker (similar to VS Code)
