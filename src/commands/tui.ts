export async function tuiCommand(url?: string): Promise<void> {
  // Dynamic import to avoid loading React/OpenTUI for non-TUI commands
  const { startTui } = await import('../tui/index.js')
  await startTui({ initialUrl: url })
}
