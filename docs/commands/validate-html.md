# HTML Validation

Validate HTML markup against W3C standards and best practices.

---

## What it does

The `validate:html` command checks your HTML for syntax errors, deprecated elements, accessibility issues, and best practices using html-validate.

---

## Usage

```bash
# Validate a local file
semantic-kit validate:html ./dist/index.html

# Validate a URL
semantic-kit validate:html https://localhost:3000

# Validate production
semantic-kit validate:html https://example.com

# Different output formats
semantic-kit validate:html https://example.com --format full     # default
semantic-kit validate:html https://example.com --format brief    # one-line per error
semantic-kit validate:html https://example.com --format compact  # grouped errors
semantic-kit validate:html https://example.com --format json     # machine-readable
```

---

## Options

| Option | Description |
|--------|-------------|
| `--format full` | Default. Shows code context around each error |
| `--format brief` | Minimal one-line per error |
| `--format compact` | Grouped errors with counts |
| `--format json` | Machine-readable JSON output |

---

## Behavior

| What it does | Why | Research |
|--------------|-----|----------|
| Validates against HTML5 spec | Browser error recovery is unpredictable | [[markup-validation]] |
| Checks accessibility attributes | Missing alt/labels block AT users | [[accessibility-tree]] |
| Reports by severity | Prioritize errors over warnings | [[markup-validation]] |

---

## Output

```
https://localhost:3000
  1:1  error  missing doctype                              missing-doctype
  5:3  error  element "div" is missing required attribute  element-required-attributes

✖ 2 problems (2 errors, 0 warnings)
```

### Severity levels

| Severity | Meaning |
|----------|---------|
| error | Must fix. Invalid markup that causes problems. |
| warning | Should fix. Valid but problematic patterns. |

---

## Configuration

Create `.htmlvalidate.json` in your project root:

```json
{
  "extends": ["html-validate:recommended"],
  "rules": {
    "no-inline-style": "off",
    "prefer-native-element": "warn"
  }
}
```

---

## Common issues

### Missing doctype

```html
<!-- Bad -->
<html>...</html>

<!-- Good -->
<!DOCTYPE html>
<html>...</html>
```

### Unclosed elements

```html
<!-- Bad -->
<p>First paragraph</p>
<p>Second paragraph

<!-- Good -->
<p>First paragraph</p>
<p>Second paragraph</p>
```

### Invalid nesting

```html
<!-- Bad: block inside inline -->
<span><div>Content</div></span>

<!-- Good -->
<div><span>Content</span></div>
```

### Missing alt text

```html
<!-- Bad -->
<img src="photo.jpg">

<!-- Good -->
<img src="photo.jpg" alt="Description of the image">

<!-- Good: decorative image -->
<img src="decoration.svg" alt="">
```

---

## Programmatic usage

```bash
# Install html-validate
npm install -g html-validate

# Validate with custom config
npx html-validate --config .htmlvalidate.json ./dist/**/*.html

# Output as JSON
npx html-validate --formatter json ./dist/index.html

# Print DOM tree (debugging)
npx html-validate --dump-tree ./dist/index.html
```

---

## Related

- [[markup-validation]] — Why valid HTML matters
- [[accessibility-tree]] — How markup affects accessibility
