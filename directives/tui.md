# TUI Development Guide

Instructions for working with the semantic-kit Terminal UI.

## Quick Links

- **[UI_GLOSSARY.md](../src/tui/UI_GLOSSARY.md)** - Terminology, layout regions, keyboard shortcuts, mouse interactions

## Architecture Overview

The TUI uses **Ink** (React for CLI) with a **self-registering view pattern**. Views are modular, lazy-loaded, and cache data per-URL. State is managed with **Jotai atoms**.

### Key Concepts

- **View Categories**: Views are organized into two groups: **Lenses** (consumer perspectives) and **Tools** (analysis utilities). This grouping is reflected in the sidebar menu.
- **View Registry**: Views self-register on import. Each view specifies its `category` ('lens' or 'tool').
- **Lazy Loading**: Views fetch data only when they become active.
- **URL-based Cache**: When URL changes, all cached view data is invalidated.
- **Focus vs Active**: Focus is visual highlighting; Active means receiving input (see glossary).
- **Jotai Atoms**: State is managed via atoms, not React Context. Components access state directly via hooks.

### View Categories

Views are organized into two conceptual groups:

| Category | Purpose | Examples |
|----------|---------|----------|
| **Lenses** | Show how a specific consumer "sees" your page | AI Bot, Reader, Google, Social, Screen Reader |
| **Tools** | Task-oriented analysis and validation utilities | Structure, Schema, Validate |

This distinction helps users understand what each view does:
- **Lenses** answer "How does X see my page?"
- **Tools** answer "What does my page contain?" or "Is my page valid?"

## File Structure

```
src/tui/
├── index.tsx             # Entry point, mouse handling, alt screen buffer
├── App.tsx               # Root component, layout, input handling
├── UI_GLOSSARY.md        # UI terminology and interaction documentation
├── state/
│   ├── index.ts          # Re-exports all atoms, hooks, and types
│   ├── types.ts          # Shared types (GroupedMenuItem, ViewData, FocusRegion, UrlListTab, etc.)
│   ├── store.ts          # createAppStore() - base store with effects
│   ├── tool-navigation.ts # Sidebar navigation (activeMenuIndexAtom, navigateMenuAtom, etc.)
│   ├── view-atoms.ts     # viewAtomFamily, activeViewAtom (view definition + data)
│   ├── atoms/
│   │   ├── index.ts      # Re-exports all atoms
│   │   ├── url.ts        # urlAtom, recentUrlsAtom, setUrlAtom
│   │   ├── modal.ts      # activeModalAtom, isModalOpenAtom
│   │   ├── sitemap.ts    # sitemapCacheAtom, sitemapLoadingAtom
│   │   ├── config.ts     # configStateAtom, configTreeAtom (YAML config support)
│   │   ├── focus.ts      # focusedRegionAtom
│   │   └── url-list.ts   # urlListIndexAtom, urlListActiveTabAtom
│   ├── view-data/        # View data fetching module
│   │   ├── types.ts      # ViewData, ViewDataStatus
│   │   ├── atoms.ts      # viewDataAtomFamily, setViewDataAtom
│   │   ├── effect.ts     # viewDataFetchEffect
│   │   └── index.ts      # Re-exports
│   ├── persistence/      # State persistence module
│   │   ├── store.ts      # createPersistedStore()
│   │   ├── effect.ts     # persistStateEffect
│   │   └── ...
│   └── hooks/
│       ├── index.ts      # Re-exports all hooks
│       └── useFocus.ts   # Focus tracking with Ink integration
├── views/
│   ├── types.ts          # ViewDefinition<T> interface
│   ├── registry.ts       # registerView(), getViewDefinition()
│   ├── index.ts          # Imports all views (triggers registration)
│   └── *.ts              # Individual view implementations
├── hooks/
│   ├── useMouse.ts       # Mouse click and scroll detection
│   └── useTerminalSize.ts # Terminal dimensions
└── components/
    ├── chrome/           # Layout components
    │   ├── MainContent.tsx   # Content area orchestrator
    │   ├── ViewRenderer.tsx  # Loading/error/success renderer
    │   ├── ViewContent.tsx   # Content line generation
    │   ├── Menu.tsx          # Sidebar menu
    │   ├── UrlBar.tsx        # URL input field
    │   ├── UrlList.tsx       # URL selection panel (Recent/Config/Sitemap tabs)
    │   ├── HelpModal.tsx     # Help modal
    │   ├── StatusBar.tsx     # Bottom status bar
    │   └── constants.ts      # Layout dimensions
    └── ui/               # Reusable UI components
        ├── ConfigBrowser.tsx # Tree browser for config URLs
        ├── SitemapBrowser.tsx # Tree browser for sitemap URLs
        ├── TabBar.tsx        # Tab navigation component
        └── ...
```

## Adding a New View

1. Create `src/tui/views/<name>.ts`:

```typescript
import { registerView } from './registry.js'
import type { ViewDefinition } from './types.js'

interface MyResult {
  // Your data shape
}

export const myView: ViewDefinition<MyResult> = {
  id: 'my-view',
  label: 'My View',
  description: 'What this view shows',
  category: 'tool',  // or 'lens' - determines menu grouping
  fetch: async (url: string): Promise<MyResult> => {
    // Fetch and process data
  },
  Component: MyViewContent,  // React component for rendering
}

// Self-register
registerView(myView)
```

**Choosing the right category:**
- Use `'lens'` for views that show how a specific consumer (AI crawler, screen reader, etc.) sees the page
- Use `'tool'` for analysis utilities, validators, and inspection tools

2. Import in `src/tui/views/index.ts` (order within category is preserved):

```typescript
import './ai-view.js'    // lens
import './structure.js'  // tool
import './my-view.js'    // Add here
```

3. Run `bun run typecheck`

## State Management

State is managed with **Jotai atoms**. No React Context or prop drilling required.

### Key Atoms

| Atom | Type | Description |
|------|------|-------------|
| `urlAtom` | `string` | Current URL being analyzed |
| `setUrlAtom` | write-only | Sets URL and invalidates all views |
| `groupedMenuItemsAtom` | `GroupedMenuItem[]` | Menu items with section headers |
| `activeMenuIndexAtom` | `number` | Selected menu index (points to a view item, never a header) |
| `navigateMenuAtom` | write-only | Move menu selection up/down (skips headers) |
| `viewDataAtomFamily` | `atomFamily` | Per-view data state (status, data, error) |
| `activeViewAtom` | derived | Active view with data (`View` interface) |
| `viewAtomFamily` | `atomFamily` | View by ID with data (`View` interface) |
| `activeModalAtom` | `ModalType` | Currently open modal |
| `focusedRegionAtom` | `FocusRegion` | Which region has focus |

### Config Atoms (YAML config file support)

| Atom | Type | Description |
|------|------|-------------|
| `configStateAtom` | `ConfigState \| null` | Loaded config (path + parsed data) |
| `hasConfigAtom` | `boolean` | Whether a config is loaded |
| `configTreeAtom` | `ConfigTreeNode[]` | Tree built from config |
| `flattenedConfigTreeAtom` | `FlattenedConfigNode[]` | Flattened tree for display |
| `configExpandedGroupsAtom` | `Set<string>` | Expanded group IDs |
| `configSelectedIndexAtom` | `number` | Selected index in tree |

### View and ViewData

Views combine static definitions with dynamic data:

```typescript
// View definition (static, from registry)
interface ViewDefinition<T = unknown> {
  id: string
  label: string
  description: string
  category: 'lens' | 'tool'  // Determines menu grouping
  fetch: (url: string) => Promise<T>
  Component: (props: ViewComponentProps<T>) => ReactNode
}

// View data (dynamic, fetched per-URL)
interface ViewData<T = unknown> {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: T | null
  error: string | null
  fetchedUrl: string | null
}

// Combined view (definition + data)
interface View<T = unknown> extends ViewDefinition<T> {
  data: ViewData<T>
}
```

### Using View Atoms

```typescript
import { useAtomValue } from 'jotai'
import { activeViewAtom, viewAtomFamily } from '../state/index.js'

function MyComponent() {
  // Get the active view with its data
  const view = useAtomValue(activeViewAtom)

  if (view?.data.status === 'success') {
    // Access the fetched data
    console.log(view.data.data)
  }

  // Or get a specific view by ID
  const aiView = useAtomValue(viewAtomFamily('ai-view'))
}
```

### Using Other Atoms

```typescript
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { urlAtom, setUrlAtom, focusedRegionAtom } from '../state/index.js'

function MyComponent() {
  // Read-only access
  const url = useAtomValue(urlAtom)
  const focusedRegion = useAtomValue(focusedRegionAtom)

  // Read-write access
  const [activeIndex, setActiveIndex] = useAtom(activeMenuIndexAtom)

  // Write-only (actions)
  const setUrl = useSetAtom(setUrlAtom)
  const invalidateAll = useSetAtom(invalidateAllViewDataAtom)
}
```

### Built-in Hooks

- `useFocus(region)` - Focus management with Ink integration, syncs with `focusedRegionAtom`

### View Data Fetching

View data is fetched automatically via the `viewDataFetchEffect` atom effect, which is subscribed in `createAppStore()`. When the active view or URL changes, data is fetched and stored in `viewDataAtomFamily`.

The store factory pattern separates concerns:
- `createAppStore()` - Creates store with data fetching effect
- `createPersistedStore()` - Adds persistence on top of the base store

## Input Handling

See [UI_GLOSSARY.md](../src/tui/UI_GLOSSARY.md) for complete keyboard shortcuts and mouse interactions.

Key patterns used in the codebase:

```typescript
// Keyboard input with focus guard
useInput(
  (input, key) => { /* handle input */ },
  { isActive: isFocused && isInputActive },
)

// Mouse click with bounds
useMouseClick({
  isActive: activeModal === null,
  onClick: ({ x, y }) => { /* handle click */ },
})
```

## Testing

```bash
# Run TUI in development mode
bun run dev tui

# Run with initial URL
bun run dev tui https://example.com

# Run with a YAML config file
bun run dev tui --config ./src/lib/tui-config/fixtures/valid-grouped.yaml
```

## Config Module (`src/lib/tui-config/`)

The TUI supports YAML configuration files that define URL collections. The config module provides:

```
src/lib/tui-config/
├── schema.ts     # Zod schemas (ConfigUrlSchema, ConfigGroupSchema, TuiConfigSchema)
├── types.ts      # Type guards (isConfigGroup, isConfigUrl) and result types
├── loader.ts     # loadTuiConfig() - reads, parses, validates YAML
├── tree.ts       # buildConfigTree(), flattenConfigTree() - tree building
├── template.ts   # Config templates and YAML generation
├── index.ts      # Public API exports
└── fixtures/     # Test fixtures (valid-simple.yaml, valid-grouped.yaml, etc.)
```

### Config format

```yaml
urls:
  - url: https://example.com
    title: Homepage           # optional
  - group: Blog Posts         # groups are collapsible
    urls:
      - url: https://example.com/blog/1
      - url: https://example.com/blog/2
```

### Using the config module

```typescript
import { loadTuiConfig, buildConfigTree, flattenConfigTree } from '../lib/tui-config/index.js'

// Load and validate
const result = await loadTuiConfig('./config.yaml')
if (result.type === 'success') {
  const tree = buildConfigTree(result.config)
  const flat = flattenConfigTree(tree, expandedGroups)
}
```

## Common Patterns

### Rendering output lines

Views return `string[]`. Use box-drawing characters for structure:

```typescript
render: (data: MyResult): string[] => {
  const lines: string[] = []
  lines.push('┌─────────────────────────────────────')
  lines.push('│ Section Title')
  lines.push('└─────────────────────────────────────')
  lines.push('')
  lines.push(`  Property: ${data.value}`)
  return lines
}
```

### Modal backgrounds

Ink Box doesn't support backgroundColor. For solid modal backgrounds, render each line as a Text element with backgroundColor, padded to fill width:

```typescript
const innerWidth = MODAL_WIDTH - 2  // subtract border
const bg = '#1a1a1a'

const blank = () => <Text backgroundColor={bg}>{' '.repeat(innerWidth)}</Text>
const row = (content: string, color?: string) => (
  <Text color={color} backgroundColor={bg}>
    {(' ' + content).padEnd(innerWidth)}
  </Text>
)
```

### Reusing command logic

Import from `src/commands/`:

```typescript
import { fetchSchema, renderSchemaLines } from '../../commands/schema.js'

export const schemaView: ViewDefinition<SchemaResult> = {
  id: 'schema',
  label: 'Schema',
  fetch: fetchSchema,
  render: renderSchemaLines,
}
```

### Adding new atoms

1. Create atom file in `src/tui/state/atoms/`:

```typescript
import { atom } from 'jotai'

export const myAtom = atom<string>('')

// Write-only action atom
export const myActionAtom = atom(null, (get, set, value: string) => {
  set(myAtom, value)
  // Can read/write other atoms here
})
```

2. Export from `src/tui/state/atoms/index.ts`
3. Run `bun run typecheck`
