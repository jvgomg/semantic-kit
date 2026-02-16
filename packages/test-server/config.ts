/**
 * Mount configurations for external apps
 */

export interface MountConfig {
  /** Path prefix to mount at (e.g., '/nextjs') */
  path: string
  /** Shell command to start the app */
  command: string
  /** Port the app listens on */
  port: number
  /** Pattern to match in stdout/stderr indicating app is ready */
  readyPattern: RegExp
  /** Working directory for the command */
  cwd?: string
  /** Timeout waiting for app to be ready (ms) */
  timeout?: number
}

/**
 * Get mount configurations with ports relative to the base server port
 *
 * @param basePort - The main server port (mounts use basePort + 1, +2, etc.)
 */
export function getMounts(basePort: number): MountConfig[] {
  const nextjsPort = basePort + 1

  return [
    {
      path: '/nextjs',
      command: `bun run dev --port ${nextjsPort}`,
      port: nextjsPort,
      readyPattern: /Ready in/i,
      cwd: './test-server/apps/nextjs-streaming',
      timeout: 60000,
    },
  ]
}
