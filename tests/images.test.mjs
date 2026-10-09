import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(root, 'web-images/manifest.json')));
for (const [file, entry] of Object.entries(manifest)) {
  const input = readFileSync(path.join(root, 'assets', file));
  const id = createHash('sha256').update(file).update(input).digest('hex').slice(0, 20);
  assert.equal(entry.small, `${id}-small.webp`, `Original changed: ${file}`);
  for (const size of ['small', 'medium', 'full']) {
    const image = readFileSync(path.join(root, 'dist/web-images', entry[size]));
    assert.equal(image.toString('ascii', 0, 4), 'RIFF');
    assert.equal(image.toString('ascii', 8, 12), 'WEBP');
  }
}
let pages = 0;
for (const file of readdirSync(path.join(root, 'dist'), { recursive: true })) {
  if (!file.endsWith('.html')) continue;
  const absolute = path.join(root, 'dist', file);
  if (!statSync(absolute).isFile()) continue;
  const html = readFileSync(absolute, 'utf8');
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    assert(tag.includes('srcset='), `No responsive image: ${file}`);
    assert(!tag.includes('.png'), `Original image still referenced: ${file}`);
    for (const attr of tag.matchAll(/(?:src|data-full-src)="([^"]+)"/g)) {
      assert(existsSync(path.resolve(path.dirname(absolute), attr[1])));
    }
    const srcset = tag.match(/srcset="([^"]+)"/)[1];
    for (const candidate of srcset.split(', ')) {
      assert(existsSync(path.resolve(path.dirname(absolute), candidate.split(' ')[0])));
    }
  }
  if (html.includes('class="creature-portrait"') || html.includes('class="soul-portrait"')) {
    assert(html.includes('data-full-src='));
  }
  pages++;
}
console.log(`Verified ${Object.keys(manifest).length} preserved source images, all WebP variants, and responsive images on ${pages} pages.`);
