# Fetch

Fetch and prettify HTML from a URL for inspection.

---

## Usage

```bash
# Display formatted HTML in terminal
semantic-kit fetch https://example.com

# Save to file
semantic-kit fetch https://example.com --out page.html

# Save to file AND display in terminal
semantic-kit fetch https://example.com --out page.html --stream
```

---

## Options

| Option | Description |
|--------|-------------|
| `-o, --out <path>` | Save HTML to file instead of displaying in terminal |
| `--stream` | Display in terminal even when saving to file |
