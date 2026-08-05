/**
 * Downloads maxres thumbnails for every catalogued video so they can be
 * reviewed as candidate source imagery, and reports which actually have a
 * maxres (1280x720) version rather than just the 480x360 fallback.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = path.resolve(import.meta.dirname, '..', '_source', 'youtube');
const OUT = path.join(SRC, 'thumbs');
await fs.mkdir(OUT, { recursive: true });

const videos = JSON.parse(await fs.readFile(path.join(SRC, 'videos.json'), 'utf8'));

// Videos referenced by the old site that are not on his own channel
// (the SBS segment is SBS's upload, for instance).
const EXTRA = [
  { id: 'YnHlcZLzu50', title: 'SBS World News' },
  { id: 'yLh_R1g5uks', title: 'I dream of schools valuing...' },
  { id: 'gYdUjZLQzWc', title: 'Trauma, love and beyond' },
  { id: 'm-r7VUuoBfc', title: 'A father & son talk & heal (short)' },
];

const all = [...videos, ...EXTRA.filter((e) => !videos.some((v) => v.id === e.id))];

const report = [];

for (const v of all) {
  let saved = null;
  for (const variant of ['maxresdefault', 'sddefault', 'hqdefault']) {
    const url = `https://i.ytimg.com/vi/${v.id}/${variant}.jpg`;
    const res = await fetch(url);
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    // YouTube serves a 120x90 grey placeholder when a variant is missing.
    if (meta.width < 480) continue;
    await fs.writeFile(path.join(OUT, `${v.id}.jpg`), buf);
    saved = { variant, w: meta.width, h: meta.height, bytes: buf.length };
    break;
  }
  report.push({ ...v, thumb: saved });
  console.log(
    `  ${v.id}  ${saved ? `${String(saved.w).padStart(4)}x${saved.h} ${saved.variant}` : 'NO THUMB'}  ${v.title.slice(0, 60)}`
  );
}

await fs.writeFile(path.join(SRC, 'thumbs.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`\n${report.filter((r) => r.thumb).length}/${report.length} thumbnails saved to ${OUT}`);
