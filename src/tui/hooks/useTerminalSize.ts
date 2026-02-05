import { useStdout } from 'ink'
import { useEffect, useState } from 'react'

export interface TerminalSize {
  columns: number
  rows: number
}

export function useTerminalSize(): TerminalSize {
  const { stdout } = useStdout()

  const [size, setSize] = useState<TerminalSize>(() => ({
    columns: stdout.columns ?? 80,
    rows: (stdout.rows ?? 24) - 1,
  }))

  useEffect(() => {
    const handleResize = () => {
      setSize({
        columns: stdout.columns ?? 80,
        rows: (stdout.rows ?? 24) - 1,
      })
    }

    stdout.on('resize', handleResize)
    return () => {
      stdout.off('resize', handleResize)
    }
  }, [stdout])

  return size
}
