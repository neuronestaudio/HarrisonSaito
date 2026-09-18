/**
 * No word alone on a line — anywhere on the site (Dion, 18 Sep 2026).
 *
 * Loaded by Base.astro, so every page gets it, whatever shell it is built in.
 * Two passes, re-run on font load, on resize and when a <details> opens:
 * fitHeadings for the display type, fitText for everything else.
 */

/* No word alone on a line (Dion, 18 Sep: "make sure the title is never a
   single word on its own"). CSS text-wrap: balance evens lines out, but it
   cannot put two words on a line they are too big for — "Book a /
   conversation." on a phone — so this measures what the browser actually
   drew: every word's line, by its rect. A heading with a line holding one word
   first loses any ch-based max-width, then steps its type down 6% at a time
   (to half, never under 15px) until none does, keeping the best it found. A line broken on purpose with <br> ("Rebuild /
   Self-Worth") is a lock-up, not a stray, so a one-word segment is left be.
   Re-run on font load and on resize (the consent bar's height change fires
   one), from scratch each time. */
const FIT = '.mo h1, .mo h2, .mo h3, .hero__title, .beat__title, .arrive__title, .arrive__big';

function loneLines(el: HTMLElement, only?: Set<Text>): number {
  const words: { top: number; bottom: number; seg: number }[] = [];
  let seg = 0;
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = walk.nextNode())) {
    if (n.nodeType === Node.ELEMENT_NODE) { if ((n as Element).tagName === 'BR') seg++; continue; }
    const t = n as Text;
    if (only && !only.has(t)) continue;
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(t.data))) {
      if (!/[\p{L}\p{N}\u2014\u2013]/u.test(m[0])) continue;
      const r = document.createRange();
      r.setStart(t, m.index);
      r.setEnd(t, m.index + m[0].length);
      /* every piece: a word broken at its hyphen ("high- / stakes") is on two lines */
      const rcs = r.getClientRects();
      for (let i = 0; i < rcs.length; i++) if (rcs[i].width) words.push({ top: rcs[i].top, bottom: rcs[i].bottom, seg });
    }
  }
  const perSeg = new Map<number, number>();
  words.forEach((w) => perSeg.set(w.seg, (perSeg.get(w.seg) || 0) + 1));
  /* Same line = the boxes overlap vertically by more than half the shorter
     one. Comparing tops is not enough: an italic or a serif run in the middle
     of a line sits a few pixels off the roman words beside it and would be
     counted as a line of its own. */
  const lines: { seg: number; top: number; bottom: number; n: number }[] = [];
  for (const w of words) {
    const line = lines.find((l) => {
      if (l.seg !== w.seg) return false;
      const over = Math.min(l.bottom, w.bottom) - Math.max(l.top, w.top);
      return over > 0.5 * Math.min(l.bottom - l.top, w.bottom - w.top);
    });
    if (line) line.n++;
    else lines.push({ seg: w.seg, top: w.top, bottom: w.bottom, n: 1 });
  }
  return lines.filter((l) => l.n === 1 && (perSeg.get(l.seg) || 0) > 1).length;
}

export function fitHeadings() {
  document.querySelectorAll<HTMLElement>(FIT).forEach((el) => {
    el.style.fontSize = '';
    el.style.maxWidth = '';
    if (!el.getClientRects().length) return;
    let lone = loneLines(el);
    if (!lone) return;
    const first = lone;
    /* A measure set in ch shrinks with the type, so shrinking inside it can
       never help ("Straight answers." in 14ch is one word a line at any size):
       lift the cap, and keep it lifted while the type steps down. It goes back
       only if nothing was gained. */
    let lifted = false;
    if (getComputedStyle(el).maxWidth !== 'none') {
      el.style.maxWidth = 'none';
      lifted = true;
      lone = loneLines(el);
      if (!lone) return;
    }
    /* Then the type steps down, never below half, and never below 15px —
       any smaller and it is no longer a heading, and a lone word is the
       lesser fault. The best size found is kept. */
    const base = parseFloat(getComputedStyle(el).fontSize);
    const floor = Math.max(0.5, 15 / base);
    let best = { k: 1, lone };
    for (let k = 0.94; k >= floor - 1e-6; k -= 0.06) {
      el.style.fontSize = (base * k).toFixed(2) + 'px';
      lone = loneLines(el);
      if (lone < best.lone) best = { k, lone };
      if (!lone) break;
    }
    el.style.fontSize = best.k === 1 ? '' : (base * best.k).toFixed(2) + 'px';
    if (lifted && best.lone >= first) el.style.maxWidth = '';
  });
}

/* And everything that is not a heading (Dion, 18 Sep, later: "nothing on the
   site should ever be one word on its own line"). CSS goes first — text-wrap:
   pretty on running text (global.css) — and this is the net under it, because
   not every browser has it and none of them promise it.

   Text is grouped by the block box it is set in (the nearest ancestor that is
   not inline), so a label on its own line is its own block and a one-word
   label is nobody's orphan. Two moves, in order:
     1. bind — in any block of four words or more, the last two are joined
        with a no-break space, so the last line can never hold one. Done to
        every such block, measured or not, which is what covers text that is
        not laid out yet (a closed FAQ answer, the phone menu).
     2. fit — a block that still shows a lone word (a three-word label in a
        narrow column; a long word mid-paragraph) steps its type down 4% at a
        time, to 84% at most and never under 11px, keeping the best it found.
   Headings are left to fitHeadings, which may go much further. */
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'SELECT', 'OPTION', 'SVG', 'svg', 'CODE', 'PRE']);
const fitted = new Set<HTMLElement>();

function textBlocks(): Map<HTMLElement, Text[]> {
  const blocks = new Map<HTMLElement, Text[]>();
  const display = new Map<Element, string>();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!/\S/.test((n as Text).data)) return NodeFilter.FILTER_REJECT;
      for (let e = n.parentElement; e; e = e.parentElement) {
        if (SKIP.has(e.tagName) || e.hasAttribute('data-nofit')) return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walk.nextNode())) {
    let el = n.parentElement;
    while (el && el !== document.body) {
      let d = display.get(el);
      if (d === undefined) { d = getComputedStyle(el).display; display.set(el, d); }
      if (d !== 'inline' && d !== 'contents') break;
      el = el.parentElement;
    }
    if (!el || el === document.body) continue;
    const list = blocks.get(el);
    if (list) list.push(n as Text); else blocks.set(el, [n as Text]);
  }
  return blocks;
}

/** Join the last two words of a block with a no-break space. */
function bindLast(nodes: Text[]) {
  const NBSP = String.fromCharCode(160);
  const full = nodes.map((t) => t.data).join('');
  const anySpace = /[ \t\n\r\f\u00A0]+/;
  if (full.split(anySpace).filter(Boolean).length < 4) return;
  /* the last run of BREAKABLE space with a word on both sides */
  const run = /[ \t\n\r\f]+/g;
  let at = -1, len = 0, m: RegExpExecArray | null;
  while ((m = run.exec(full))) {
    if (m.index > 0 && /\S/.test(full.slice(m.index + m[0].length))) { at = m.index; len = m[0].length; }
  }
  if (at < 0) return;
  const tail = full.slice(at + len).trim();
  if (tail.indexOf(NBSP) >= 0) return;   /* bound already (or set that way by hand) */
  const head = full.slice(0, at).split(anySpace).pop() || '';
  if (head.length + tail.length > 26) return;   /* two long words: let them break */
  /* the run may straddle two nodes ("guilty " + <strong>): the first part
     becomes the no-break space, the rest goes */
  let off = 0, placed = false;
  for (const t of nodes) {
    const size = t.data.length;
    const from = Math.max(at, off), to = Math.min(at + len, off + size);
    if (from < to) {
      t.data = t.data.slice(0, from - off) + (placed ? '' : NBSP) + t.data.slice(to - off);
      placed = true;
    }
    off += size;
  }
}

export function fitText() {
  fitted.forEach((el) => { el.style.fontSize = ''; el.style.removeProperty('text-wrap'); });
  fitted.clear();
  const heads = new Set<Element>(document.querySelectorAll(FIT));
  const inHead = (el: Element) => { for (let e: Element | null = el; e; e = e.parentElement) if (heads.has(e)) return true; return false; };
  textBlocks().forEach((nodes, el) => {
    if (inHead(el)) return;
    bindLast(nodes);
    if (!el.getClientRects().length) return;
    const cs = getComputedStyle(el);
    if (cs.writingMode !== 'horizontal-tb' || cs.whiteSpace === 'nowrap' || cs.whiteSpace === 'pre') return;
    const own = new Set(nodes);
    let lone = loneLines(el, own);
    if (!lone) return;
    /* First the cheap move: break the lines the other way. Balanced text can
       strand a first word ("replaying / what was said.") that plain wrapping
       would not, and the reverse. */
    const was = lone;
    el.style.setProperty('text-wrap', /balance/.test(cs.getPropertyValue('text-wrap')) ? 'wrap' : 'balance');
    lone = loneLines(el, own);
    if (lone < was) fitted.add(el); else { el.style.removeProperty('text-wrap'); lone = was; }
    if (!lone) return;
    const base = parseFloat(cs.fontSize);
    const floor = Math.max(0.84, 11 / base);
    let best = { k: 1, lone };
    for (let k = 0.96; k >= floor - 1e-6; k -= 0.04) {
      el.style.fontSize = (base * k).toFixed(2) + 'px';
      lone = loneLines(el, own);
      if (lone < best.lone) best = { k, lone };
      if (!lone) break;
    }
    if (best.k === 1) el.style.fontSize = '';
    else { el.style.fontSize = (base * best.k).toFixed(2) + 'px'; fitted.add(el); }
  });
}

let fitWired = false;
export function wireFit() {
  if (fitWired) return;
  fitWired = true;
  let t = 0;
  const both = () => { fitHeadings(); fitText(); };
  const later = () => { clearTimeout(t); t = window.setTimeout(both, 120); };
  both();
  /* text that was not laid out when the page was fitted: an opened FAQ answer */
  document.addEventListener('toggle', later, true);
  /* fonts.ready resolves at once if nothing has started loading yet — before
     Avant is even requested — so it cannot be the signal. Every font that
     finishes changes the measure: fit again on each. */
  document.fonts?.addEventListener('loadingdone', later);
  window.addEventListener('load', later, { once: true });
  window.addEventListener('resize', later);
}
