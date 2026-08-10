import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(root, '..')

const child = spawn('npx', ['vite', 'build'], {
  cwd: webRoot,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
})

let exiting = false
const finish = (code = 0) => {
  if (exiting) return
  exiting = true
  try {
    child.kill('SIGTERM')
  } catch {
    // ignore
  }
  process.exit(code)
}

const onChunk = (chunk, stream) => {
  const text = chunk.toString()
  stream.write(text)
  if (text.includes('✓ built in') || text.includes('built in')) {
    // Build artifacts are written; PWA/Rolldown may hang afterward.
    setTimeout(() => finish(0), 400)
  }
}

child.stdout.on('data', (chunk) => onChunk(chunk, process.stdout))
child.stderr.on('data', (chunk) => onChunk(chunk, process.stderr))
child.on('error', (error) => {
  console.error(error)
  finish(1)
})
child.on('exit', (code) => {
  if (!exiting) finish(code ?? 1)
})

setTimeout(() => {
  console.error('Build timed out')
  finish(1)
}, 120_000)
