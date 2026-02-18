# Demo Recordings

This directory contains VHS tape files for creating terminal recordings of the CLI and TUI.

## Prerequisites

Install VHS and its dependencies:

```bash
# macOS
brew install vhs ffmpeg

# Other platforms: https://github.com/charmbracelet/vhs#installation
```

## Directory Structure

```
demos/
  tapes/          # VHS tape scripts (version controlled)
  output/         # Generated media (gitignored)
```

## Recording a Demo

```bash
# Record a single tape
vhs record > demos/tapes/example.tape

# Output location is defined in the tape file
```

## Writing Tape Files

Tape files are declarative scripts that describe terminal interactions. See the [VHS documentation](https://github.com/charmbracelet/vhs) for full syntax.

### Basic Template

```tape
# Description of what this demo shows
Output demos/output/demo-name.gif

# Terminal settings
Set Shell "bash"
Set FontSize 18
Set Width 1200
Set Height 800
Set Theme "Catppuccin Mocha"

# Commands and interactions
Type "bun run dev ai https://example.com"
Sleep 500ms
Enter
Sleep 3s
```

### Common Settings

| Setting | Description | Recommended |
|---------|-------------|-------------|
| `Output` | Output file path (.gif, .mp4, .webm) | `demos/output/...` |
| `Set FontSize` | Terminal font size | 16-20 |
| `Set Width` | Terminal width in pixels | 1200 |
| `Set Height` | Terminal height in pixels | 600-900 |
| `Set Theme` | Color theme | "Catppuccin Mocha" |
| `Set TypingSpeed` | Delay between keystrokes | 50ms (default) |

### Common Commands

| Command | Description |
|---------|-------------|
| `Type "text"` | Type text (with realistic delays) |
| `Enter` | Press Enter key |
| `Sleep 1s` | Wait for specified duration |
| `Ctrl+C` | Send interrupt signal |
| `Up`, `Down`, `Left`, `Right` | Arrow keys |
| `Tab` | Tab key |
| `Escape` | Escape key |

### Output Formats

- `.gif` - Animated GIF, good for GitHub READMEs and social media
- `.mp4` - Video file, smaller size, good for documentation sites
- `.webm` - Web-optimized video format

## Tips

1. **Use Sleep generously** - Give commands time to complete before the next action
2. **Test incrementally** - Build up complex recordings step by step
3. **Consider terminal size** - Wider terminals work better for CLI output
4. **Use real URLs** - Consider using the test server (`bun run test-server`) for consistent output

## Examples

### CLI Command Demo

```tape
Output demos/output/ai-command.gif

Set Shell "bash"
Set FontSize 18
Set Width 1200
Set Height 700
Set Theme "Catppuccin Mocha"

Type "bun run dev ai https://example.com"
Sleep 300ms
Enter
Sleep 4s
```

### TUI Navigation Demo

```tape
Output demos/output/tui-demo.gif

Set Shell "bash"
Set FontSize 16
Set Width 1400
Set Height 900
Set Theme "Catppuccin Mocha"

Type "bun run dev tui https://example.com"
Enter
Sleep 3s

# Navigate with keyboard
Type "j"
Sleep 500ms
Type "j"
Sleep 500ms
Type "1"
Sleep 1s
Type "2"
Sleep 1s
```

## Resources

- [VHS GitHub](https://github.com/charmbracelet/vhs)
- [VHS Syntax Reference](https://github.com/charmbracelet/vhs#vhs-command-reference)
- [Catppuccin Themes](https://github.com/catppuccin/catppuccin)
