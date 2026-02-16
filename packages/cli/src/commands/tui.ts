/**
 * TUI command placeholder.
 *
 * The TUI is available in a separate package: @webspecs/tui
 * This command shows a helpful message directing users to install it.
 */

export interface TuiCommandOptions {
  config?: string
}

export async function tuiCommand(
  _url?: string,
  _options?: TuiCommandOptions,
): Promise<void> {
  // Parameters kept for API compatibility
  void _url
  void _options
  console.log(`
The Terminal UI requires the Bun runtime and is available as a separate package.

To use the TUI:
  1. Install Bun: https://bun.sh
  2. Run: bunx @webspecs/tui <url>

Or install globally:
  bun install -g @webspecs/tui
  webspecs-tui <url>
`)
  process.exit(0)
}
