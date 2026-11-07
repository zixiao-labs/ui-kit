import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { setTimeout } from 'node:timers/promises'

/** Each run owns a free port and process group; never reuse or kill a user's server. */
export async function startDemo() {
  const reservation = createServer()
  await new Promise<void>((resolve, reject) => {
    reservation.once('error', reject)
    reservation.listen(0, '127.0.0.1', resolve)
  })
  const address = reservation.address()
  if (!address || typeof address === 'string') throw new Error('Could not reserve a test port')
  const port = address.port
  await new Promise<void>((resolve, reject) =>
    reservation.close((error) => (error ? reject(error) : resolve())),
  )

  const windows = process.platform === 'win32'
  const child = spawn(
    windows ? 'pnpm.cmd' : 'pnpm',
    ['--filter', '@zixiao-labs/ui-kits-demo', 'dev', '--host', '127.0.0.1', '--port', String(port)],
    { detached: !windows, shell: windows, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  let logs = ''
  let startupError: Error | undefined
  child.stdout.on('data', (chunk) => {
    logs += String(chunk)
  })
  child.stderr.on('data', (chunk) => {
    logs += String(chunk)
  })
  child.on('error', (error) => {
    startupError = error
  })
  const url = `http://127.0.0.1:${port}`

  function close() {
    if (child.pid && child.exitCode === null) {
      if (windows) {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
      } else {
        process.kill(-child.pid, 'SIGTERM')
      }
    }
  }

  try {
    const deadline = Date.now() + 25_000
    while (Date.now() < deadline) {
      if (startupError) throw startupError
      if (child.exitCode !== null) throw new Error(`Nasti exited before startup:\n${logs}`)
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(1000) })
        if (response.ok && (await response.text()).includes('Zixiao Laboratories')) {
          return { url, close }
        }
      } catch {
        // Poll readiness, rather than sleeping for an assumed startup duration.
      }
      await setTimeout(100)
    }
    throw new Error(`Nasti did not become ready at ${url}:\n${logs}`)
  } catch (error) {
    close()
    throw error
  }
}
