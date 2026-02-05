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
 * Configured mounts for external applications
 *
 * Example:
 * ```typescript
 * export const mounts: MountConfig[] = [
 *   {
 *     path: '/nextjs',
 *     command: 'bun run dev',
 *     port: 3000,
 *     readyPattern: /ready in/,
 *     cwd: '../demo-nextjs',
 *   },
 * ]
 * ```
 */
export const mounts: MountConfig[] = [
  {
    path: '/nextjs',
    command: 'bun run dev --port 3100',
    port: 3100,
    readyPattern: /Ready in/i,
    cwd: './test-server/apps/nextjs-streaming',
    timeout: 60000,
  },
]
