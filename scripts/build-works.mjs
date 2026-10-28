// Build the browser-readable WORKS index from Pages CMS collection files.
// No dependencies; runs in GitHub Actions and locally with Node.js 20+.
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const folder = join(root, 'content/works');
const files = (await readdir(folder)).filter(name => name.endsWith('.json')).sort();
const works = [];
const ids = new Set();
const fields = ['id', 'title', 'category', 'image', 'description', 'detail_url'];
for (const filename of files) {
  const data = JSON.parse(await readFile(join(folder, filename), 'utf8'));
  for (const field of fields) {
    if (typeof data[field] !== 'string' || !data[field].trim()) {
      throw new Error(`${filename}: missing ${field}`);
    }
  }
  if (!/^[a-z0-9-]+$/.test(data.id)) throw new Error(`${filename}: invalid id`);
  if (ids.has(data.id)) throw new Error(`Duplicate work id: ${data.id}`);
  ids.add(data.id);
  if (typeof data.order !== 'number' || !Number.isFinite(data.order)) throw new Error(`${filename}: invalid order`);
  if (typeof data.published !== 'boolean' || typeof data.featured !== 'boolean') throw new Error(`${filename}: invalid visibility`);
  works.push(data);
}
works.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ko'));
await mkdir(join(root, 'data'), { recursive: true });
await writeFile(join(root, 'data/works.json'), JSON.stringify(works, null, 2) + '\n');
console.log(`Validated ${works.length} WORKS entries; ${works.filter(x => x.published && x.featured).length} visible.`);
