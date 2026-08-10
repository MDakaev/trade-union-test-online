
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
// We can't import TS directly; parse with regex from file
const src = fs.readFileSync(new URL('../apps/web/src/data/demoCourse.ts', import.meta.url), 'utf8')
const start = src.indexOf('export const demoCourse')
const objStart = src.indexOf('{', start)
// naive brace match
let i = objStart, depth = 0
for (; i < src.length; i++) {
  if (src[i] === '{') depth++
  else if (src[i] === '}') { depth--; if (depth === 0) { i++; break } }
}
let text = src.slice(objStart, i)
// convert TS object literal to JSON-ish
text = text.replace(/(\w+):/g, '"$1":').replace(/'/g, '"').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
// remove trailing commas again
text = text.replace(/,(\s*[}\]])/g, '$1')
try {
  const course = JSON.parse(text)
  fs.writeFileSync(new URL('../content/course/_demo_parsed.json', import.meta.url), JSON.stringify(course, null, 2))
  console.log('parsed lessons', course.lessons.length)
} catch (e) {
  console.error('parse fail', e.message)
  process.exit(1)
}
