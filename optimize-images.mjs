import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = path.dirname(fileURLToPath(import.meta.url));
const files = JSON.parse(execFileSync(process.execPath, [path.join(root, 'build.mjs'), '--image-list'], { encoding: 'utf8' }));
const output = path.join(root, 'web-images');
await mkdir(output, { recursive: true });
const manifest = {};
let originals = 0;
let optimized = 0;
for (const file of files) {
  const input = await readFile(path.join(root, 'assets', file));
  originals += input.length;
  const id = createHash('sha256').update(file).update(input).digest('hex').slice(0, 20);
  const metadata = await sharp(input).metadata();
  const entry = {};
  for (const [variant, width, quality] of [['small', 480, 84], ['medium', 960, 86], ['full', metadata.width, 92]]) {
    const name = `${id}-${variant}.webp`;
    const target = path.join(output, name);
    const actualWidth = Math.min(width, metadata.width);
    await sharp(input).resize({ width: actualWidth, withoutEnlargement: true }).webp({ quality, effort: 5 }).toFile(target);
    entry[variant] = name;
    entry[`${variant}Width`] = actualWidth;
    optimized += (await stat(target)).size;
  }
  manifest[file] = entry;
}
await writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Optimized ${files.length} images: ${(originals / 1048576).toFixed(1)} MB originals; ${(optimized / 1048576).toFixed(1)} MB across all web sizes.`);
