import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(root, '..')
const distDir = path.join(webRoot, 'dist')

function writeSpaFallback() {
  // GitHub Pages has no server rewrite to index.html. Serving the same shell as 404.html
  // lets deep links (/quiz, /review, …) reload without a hard 404.
  const indexHtml = path.join(distDir, 'index.html')
  const fallbackHtml = path.join(distDir, '404.html')
  if (!fs.existsSync(indexHtml)) {
    console.error('SPA fallback skipped: dist/index.html missing')
    return false
  }
  fs.copyFileSync(indexHtml, fallbackHtml)
  console.log('Wrote dist/404.html for GitHub Pages SPA routes')
  return true
}

const child = spawn('npx', ['vite', 'build'], {
  cwd: webRoot,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
})

let exiting = false
const finish = (code = 0) => {
  if (exiting) return
  exiting = true
  if (code === 0) {
    writeSpaFallback()
  }
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
