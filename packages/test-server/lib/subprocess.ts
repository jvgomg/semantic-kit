/**
 * Subprocess lifecycle management for mounted apps
 */

import { Subprocess } from 'bun'

export interface SubprocessConfig {
  command: string
  port: number
  readyPattern: RegExp
  timeout?: number
  cwd?: string
}

export interface ManagedSubprocess {
  process: Subprocess
  port: number
  ready: Promise<void>
  kill: () => void
}

/**
 * Spawn a subprocess and wait for it to be ready
 */
export function spawnSubprocess(config: SubprocessConfig): ManagedSubprocess {
  const { command, port, readyPattern, timeout = 30000, cwd } = config

  const process = Bun.spawn(['sh', '-c', command], {
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...Bun.env,
      PORT: String(port),
    },
  })

  let readyResolve!: () => void
  let readyReject!: (error: Error) => void
  const ready = new Promise<void>((resolve, reject) => {
    readyResolve = resolve
    readyReject = reject
  })

  const timeoutId = setTimeout(() => {
    readyReject(new Error(`Subprocess did not become ready within ${timeout}ms`))
  }, timeout)

  // Monitor stdout for ready pattern
  ;(async () => {
    const reader = process.stdout.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        Bun.write(Bun.stdout, text)

        if (readyPattern.test(text)) {
          clearTimeout(timeoutId)
          readyResolve()
        }
      }
    } catch {
      // Process ended
    }
  })()

  // Also monitor stderr
  ;(async () => {
    const reader = process.stderr.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        Bun.write(Bun.stderr, text)

        if (readyPattern.test(text)) {
          clearTimeout(timeoutId)
          readyResolve()
        }
      }
    } catch {
      // Process ended
    }
  })()

  const kill = () => {
    clearTimeout(timeoutId)
    process.kill()
  }

  return { process, port, ready, kill }
}

/**
 * Manager for multiple subprocesses
 */
export class SubprocessManager {
  private processes: Map<string, ManagedSubprocess> = new Map()

  async spawn(name: string, config: SubprocessConfig): Promise<ManagedSubprocess> {
    if (this.processes.has(name)) {
      throw new Error(`Subprocess ${name} already exists`)
    }

    const managed = spawnSubprocess(config)
    this.processes.set(name, managed)

    console.log(`[subprocess] Starting ${name}: ${config.command}`)

    try {
      await managed.ready
      console.log(`[subprocess] ${name} is ready on port ${config.port}`)
    } catch (error) {
      console.error(`[subprocess] ${name} failed to start:`, error)
      this.processes.delete(name)
      throw error
    }

    return managed
  }

  get(name: string): ManagedSubprocess | undefined {
    return this.processes.get(name)
  }

  killAll(): void {
    for (const [name, managed] of this.processes) {
      console.log(`[subprocess] Killing ${name}`)
      managed.kill()
    }
    this.processes.clear()
  }
}
