# Test Server

A self-contained test server for semantic-kit that serves HTML fixtures with configurable response behaviors.

## Quick Start

```bash
# Start the server
bun run test-server

# Start with verbose logging
bun run test-server:verbose

# Test with semantic-kit
bun run dev ai http://localhost:4000/good/semantic-article.html
```

## CLI Options

```
Usage: bun test-server/server.ts [options]

Options:
  -p, --port <number>     Port (default: 4000, env: TEST_SERVER_PORT)
  -h, --host <string>     Host (default: localhost)
  -d, --delay <ms>        Response delay in ms (default: 3000, env: TEST_SERVER_DELAY)
  --no-mount              Skip app mounting
  --fixtures <path>       Custom fixtures path
  --verbose               Log requests
  --help                  Show this help
```

## Fixture Organization

```
fixtures/
  good/           # Well-formed examples
  bad/            # Anti-pattern examples
  edge-cases/     # Boundary conditions
  responses/      # Custom response behaviors
```

### Good Examples

Demonstrate proper semantic HTML for successful `structure` and `validate:a11y` output:

| File                        | Description                                                                   |
| --------------------------- | ----------------------------------------------------------------------------- |
| `semantic-article.html`     | Full blog post with proper landmarks, headings, skip links, article structure |
| `accessible-form.html`      | Form with labels, fieldsets, aria-describedby, autocomplete                   |
| `navigation-landmarks.html` | Complex landmark structure with multiple navs, search, breadcrumbs            |

### Bad Examples

Demonstrate common mistakes that validation commands should catch:

| File                        | Description                                                          |
| --------------------------- | -------------------------------------------------------------------- |
| `div-soup.html`             | Non-semantic markup (no landmarks, no headings, divs for everything) |
| `heading-chaos.html`        | Skipped levels, empty headings, multiple h1s, misused for styling    |
| `form-no-labels.html`       | Missing labels, placeholder as label, div as button                  |
| `button-anti-patterns.html` | Divs as buttons, links without href, icon-only buttons               |

### Edge Cases

Valid but complex patterns that test tool capabilities:

| File                    | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `nested-landmarks.html` | Header/footer inside article, sections with/without names |
| `multiple-mains.html`   | SPA pattern with hidden mains (valid per HTML spec)       |
| `empty-content.html`    | Intentionally empty main content                          |

Fixtures are served via both flat and nested URLs:

- `http://localhost:4000/semantic-article.html` (flat)
- `http://localhost:4000/good/semantic-article.html` (nested)

## Response Configuration

### Sidecar `.meta.json` Files

Create a `.meta.json` file alongside any fixture to configure its response behavior:

```json
{
  "delay": 3000,
  "status": 200,
  "headers": {
    "X-Custom-Header": "value"
  },
  "redirect": "/other.html",
  "redirectStatus": 301,
  "contentType": "text/html",
  "description": "Human-readable description",
  "testCases": ["ai", "structure"]
}
```

All fields are optional.

### Query Parameter Overrides

Override response behavior without creating meta files:

| Parameter     | Example                   | Description                                     |
| ------------- | ------------------------- | ----------------------------------------------- |
| `delay`       | `?delay=5000`             | Response delay in ms (overrides server default) |
| `status`      | `?status=500`             | HTTP status code                                |
| `header-*`    | `?header-X-Custom=value`  | Add response header                             |
| `redirect`    | `?redirect=/other.html`   | Force redirect                                  |
| `contentType` | `?contentType=text/plain` | Override content type                           |

Example: `http://localhost:4000/any.html?delay=1000&status=201`

Use `?delay=0` to disable the default delay for a specific request.

## Special Endpoints

| Endpoint       | Description                     |
| -------------- | ------------------------------- |
| `/`            | Index page listing all fixtures |
| `/sitemap.xml` | Dynamic sitemap of all fixtures |

## App Mounting (Subprocess + Reverse Proxy)

Mount external apps by configuring `config.ts`:

```typescript
export const mounts: MountConfig[] = [
  {
    path: '/nextjs',
    command: 'bun run dev',
    port: 3000,
    readyPattern: /ready in/,
    cwd: '../demo-nextjs',
  },
]
```

Requests to `/nextjs/*` will be proxied to the subprocess after it starts.

Use `--no-mount` to skip starting mounted apps.

## Creating Fixtures

1. Create an HTML file in the appropriate category folder
2. Optionally add a `.meta.json` sidecar for response configuration
3. The fixture will appear on the index page and in the sitemap

### Example Structure

```
fixtures/
  good/
    semantic-article.html
    semantic-article.meta.json
  responses/
    slow.html
    slow.meta.json      # { "delay": 3000 }
```

## Testing Examples

```bash
# Test fixture serving
curl http://localhost:4000/good/semantic-article.html

# Test sitemap
curl http://localhost:4000/sitemap.xml

# Test delay (via meta file)
curl http://localhost:4000/responses/slow.html

# Test delay (via query param)
curl http://localhost:4000/any.html?delay=2000

# Test status override
curl -I http://localhost:4000/any.html?status=500

# Test redirect
curl -L http://localhost:4000/responses/redirect.html

# Use with semantic-kit
bun run dev structure http://localhost:4000/good/semantic-article.html
bun run dev ai http://localhost:4000/good/semantic-article.html
bun run dev validate:a11y http://localhost:4000/bad/div-soup.html
```
