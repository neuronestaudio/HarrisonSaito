/**
 * Reads the public video list off Harrison's YouTube channel.
 *
 * The channel page is a JS app, but the initial payload is embedded in the
 * HTML as `ytInitialData`, which carries every video's id, title, duration,
 * view count and publish date. No API key needed.
 *
 * node scripts/scrape-youtube.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '..', '_source', 'youtube');
await fs.mkdir(OUT, { recursive: true });

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

async function grab(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-AU,en' } });
  return res.text();
}

/**
 * `ytInitialData` is assigned in a few different shapes depending on how the
 * page was served, and a lazy regex to the closing `</script>` breaks on the
 * escaped braces inside video titles. Find the opening brace, then walk it
 * with a string-aware brace counter.
 */
function extractInitialData(html) {
  const at = html.search(/ytInitialData\s*=\s*\{/);
  if (at < 0) return null;

  const start = html.indexOf('{', at);
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < html.length; i++) {
    const ch = html[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') inString = true;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1));
        } catch (e) {
          console.warn('  ! JSON parse failed:', e.message);
          return null;
        }
      }
    }
  }
  return null;
}

/**
 * Channel grids now use `lockupViewModel` rather than the older
 * `videoRenderer`, so the id, title, duration and metadata all live in
 * different places than they used to.
 */
function readLockup(lv) {
  const id = lv?.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
  if (!id) return null;

  const meta = lv.metadata?.lockupMetadataViewModel;
  const title = meta?.title?.content ?? '';

  // Duration badge sits on the thumbnail overlay.
  let duration = null;
  for (const o of lv.contentImage?.thumbnailViewModel?.overlays ?? []) {
    const badge = o.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel;
    if (badge?.text && /^\d+:\d/.test(badge.text)) duration = badge.text;
  }

  // Rows are "12K views" / "2 years ago", order not guaranteed.
  const parts = [];
  for (const row of meta?.metadata?.contentMetadataViewModel?.metadataRows ?? []) {
    for (const p of row.metadataParts ?? []) {
      if (p.text?.content) parts.push(p.text.content);
    }
  }

  return {
    id,
    title,
    duration,
    views: parts.find((p) => /view/i.test(p)) ?? null,
    published: parts.find((p) => /ago$/i.test(p)) ?? null,
  };
}

/** Walk the tree collecting videos in both the old and new shapes. */
function collectVideos(node, out = new Map()) {
  if (!node || typeof node !== 'object') return out;

  if (Array.isArray(node)) {
    for (const n of node) collectVideos(n, out);
    return out;
  }

  if (node.lockupViewModel) {
    const v = readLockup(node.lockupViewModel);
    if (v && !out.has(v.id)) out.set(v.id, v);
  }

  // Legacy shape, still used on some surfaces.
  const legacy = node.videoRenderer ?? node.reelItemRenderer ?? null;
  if (legacy?.videoId && !out.has(legacy.videoId)) {
    out.set(legacy.videoId, {
      id: legacy.videoId,
      title:
        legacy.title?.runs?.map((r) => r.text).join('') ??
        legacy.headline?.simpleText ??
        legacy.title?.simpleText ??
        '',
      duration: legacy.lengthText?.simpleText ?? null,
      views: legacy.viewCountText?.simpleText ?? null,
      published: legacy.publishedTimeText?.simpleText ?? null,
    });
  }

  for (const key of Object.keys(node)) collectVideos(node[key], out);
  return out;
}

const all = new Map();

for (const tab of ['videos', 'streams', 'shorts']) {
  const html = await grab(`https://www.youtube.com/@Harrison_saito/${tab}`);
  const data = extractInitialData(html);
  if (!data) {
    console.warn(`  ! could not read ytInitialData for /${tab}`);
    continue;
  }
  const found = collectVideos(data);
  for (const [id, v] of found) if (!all.has(id)) all.set(id, { ...v, tab });
  console.log(`/${tab}: ${found.size} videos`);
}

const list = [...all.values()];
await fs.writeFile(path.join(OUT, 'videos.json'), JSON.stringify(list, null, 2), 'utf8');

console.log(`\n${list.length} unique videos\n`);
for (const v of list) {
  console.log(
    `  ${v.id}  ${(v.duration ?? '—').padStart(7)}  ${(v.views ?? '').padStart(14)}  ${(v.published ?? '').padStart(14)}  ${v.title}`
  );
}
