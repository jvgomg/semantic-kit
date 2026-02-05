# Feature Idea: Unified Error Configuration

A cross-tool system for accepting, ignoring, and managing errors across semantic-kit tools.

---

## Vision

Developers should be able to:

1. Capture errors seen in output and convert them to configuration with minimal effort
2. Organize accepted errors by app, environment, and path
3. Document why errors are accepted (with grouping for common reasons)
4. Inherit configuration down layers (monorepo → app → environment → path)

---

## Use Cases

### Monorepo / Multi-App

```
apps/
  web/                    # Different tolerance for errors
  marketing/              # May accept more validation issues
  docs/                   # Stricter requirements
```

Each app should have its own configuration, not a single global list.

### Environment-Based

Some errors are acceptable in development but not production:

- Development: Accept missing meta tags during iteration
- Production: Require all SEO-critical elements

### Path/URL-Based

Different pages have different requirements:

- `/admin/*` — May accept stricter HTML for internal tools
- `/legacy/*` — Accept known issues in old code
- `/api/*` — Different validation rules than user-facing pages

### Inheritance

Configuration should cascade:

```
.semantic-kit/           # Monorepo defaults
apps/web/.semantic-kit/  # App overrides
  environments/
    development.json     # Dev-specific accepts
    production.json      # Prod-specific accepts
  paths/
    legacy.json          # Path pattern accepts
```

---

## Snapshot Workflow

### Current Pain Point

When validation runs and shows errors:

```
1:2  error  <html> is missing required "lang" attribute  element-required-attributes
8:4  error  <img> is missing required "alt" attribute    wcag/h37
```

Developer must manually:

1. Copy the rule name
2. Create/edit config file
3. Add the rule
4. Re-run to verify

### Proposed Workflow

```bash
# Run validation, see errors
semantic-kit validate:html https://localhost:3000

# Capture current errors as "accepted" snapshot
semantic-kit validate:html https://localhost:3000 --snapshot

# This generates/updates config with current errors marked as accepted
# Developer reviews, commits the config
```

Or interactively:

```bash
semantic-kit validate:html https://localhost:3000 --accept
# Prompts: "Accept 2 errors? [y/n/select]"
# If select: shows list to choose which to accept
```

---

## Grouping with Reasons

### Problem

Multiple errors often share the same root cause:

- "Next.js quirk" — Framework generates non-standard markup
- "Third-party widget" — External embed we can't control
- "Legacy code" — Known issues scheduled for refactor
- "Intentional" — Deliberate deviation with justification

### Proposed Structure

```json
{
  "groups": {
    "nextjs-quirks": {
      "description": "Known Next.js framework behaviors we accept",
      "rules": ["element-permitted-content", "no-implicit-close"]
    },
    "legacy-admin": {
      "description": "Admin pages pending refactor Q2 2025",
      "paths": ["/admin/*"],
      "rules": ["deprecated", "no-inline-style"]
    }
  },
  "accepts": [
    {
      "rule": "wcag/h37",
      "path": "/icons/*",
      "reason": "Decorative icons intentionally have empty alt"
    }
  ]
}
```

---

## Configuration Schema (Draft)

```json
{
  "$schema": "...",
  "extends": "../.semantic-kit/config.json",

  "environments": {
    "development": {
      "accepts": ["missing-doctype"]
    },
    "production": {
      "accepts": []
    }
  },

  "paths": {
    "/legacy/*": {
      "accepts": ["deprecated", "no-inline-style"]
    },
    "/admin/*": {
      "severity": {
        "wcag/*": "warn"
      }
    }
  },

  "groups": {
    "nextjs-quirks": {
      "description": "Framework-generated markup",
      "accepts": ["element-permitted-content"]
    }
  },

  "accepts": [
    {
      "rule": "element-required-attributes",
      "element": "html",
      "reason": "Lang set dynamically by i18n"
    }
  ]
}
```

---

## Prior Art & Inspiration

### ESLint

- `.eslintrc` with `extends` for inheritance
- Inline `// eslint-disable-next-line rule-name` comments
- `--fix` to auto-correct, we want `--accept` to auto-configure
- Severity levels: error, warn, off

### Prettier

- `.prettierrc` with cascading config lookup
- `.prettierignore` for file exclusions

### TypeScript

- `tsconfig.json` with `extends`
- Per-file `// @ts-ignore` and `// @ts-expect-error`
- `skipLibCheck` for broad categories

### Stylelint

- `.stylelintrc` with extends
- `/* stylelint-disable rule */` blocks
- `stylelint-disable-next-line`

### html-validate (Current Tool)

Already supports:

- `.htmlvalidate.json` config file
- Inline `<!-- [html-validate-disable-next rule] -->` comments
- `<!-- [html-validate-disable-block rule] -->` for descendants
- `.htmlvalidateignore` for file patterns
- Reason annotation: `<!-- [html-validate-disable-next rule -- reason here] -->`

**Key insight:** html-validate's inline syntax with reason annotation (`-- reason here`) is a good pattern to adopt cross-tool.

### axe-core

- `disableRules` option in config
- Tags for rule categories (wcag2a, wcag2aa, best-practice)

### Pa11y

- `.pa11yci` config file
- `ignore` array for rule codes
- Per-URL configuration in CI config

---

## Open Questions

1. **Config file format:** JSON, YAML, or JS/TS for programmatic config?
2. **Config file location:** `.semantic-kit/` directory or single `.semantickitrc`?
3. **Cross-tool rules:** How to map rule names across different tools (html-validate, axe, etc.)?
4. **Snapshot storage:** Should snapshots be human-editable JSON or a more compact format?
5. **CI integration:** How should `--snapshot` behave in CI? Fail if new errors appear?

---

## Implementation Phases

### Phase A: Single-Tool Config

- Add `--config` flag to `validate:html`
- Support basic accepts/ignores per rule
- Document html-validate's existing ignore mechanisms

### Phase B: Snapshot Workflow

- `--snapshot` flag to capture current errors
- `--accept` for interactive acceptance
- Generate config from validation output

### Phase C: Cross-Tool Unification

- Unified config schema across tools
- Inheritance and extends support
- Path and environment scoping

### Phase D: Grouping and Reasons

- Named groups with descriptions
- Audit trail for why errors are accepted
- Reporting on accepted vs new errors

---

## Notes

This feature should be revisited after more tools are implemented (ai, google, a11y, reader) to understand the full scope of errors that need configuration. The goal is a system that feels natural across all tools while respecting each tool's native capabilities.
