/**
 * The ink motifs on the link cards — mountains, bamboo, pine, hills, the gate,
 * the temple, ripples, maple. Drawn here as SVG (tapered brush strokes over
 * mist-gradient washes, roughened with a turbulence filter), rasterised with
 * Playwright and shipped as alpha WebPs under /img/sumi-<name>-v1.webp.
 *
 * Every motif is composed with its mass at the LEFT of a 240x120 frame and
 * fades out to the right; the card CSS mirrors it for the right-hand side.
 * Rasterised rather than inlined: Safari drops filters defined in a hidden
 * SVG, and fourteen turbulence filters over a scrubbing film is not free.
 *
 *   node scripts/sumi/motifs.mjs            # scripts/sumi/out/*.svg + review.html, public/img/sumi-*-v1.webp
 *   node scripts/sumi/motifs.mjs --svg-only # skip the raster
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'out');
const PUB = path.join(HERE, '..', '..', 'public', 'img');
const VERSION = 'v1';
const INK = '#3A3026';
const W = 240, H = 120;

/* ------------------------------------------------------------ helpers */
const rng = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
const f1 = (n) => (Math.round(n * 10) / 10).toString();

function catmull(pts, segs = 6) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let j = 0; j < segs; j++) {
      const t = j / segs, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/** A tapered brush stroke along a smoothed polyline: width w0 at the start, w1 at the end. */
function brush(pts, w0, w1, opacity = 0.7, attrs = '') {
  const P = catmull(pts), n = P.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const t = i / (n - 1), w = (w0 + (w1 - w0) * t) / 2;
    L.push([P[i][0] - dy * w, P[i][1] + dx * w]); R.push([P[i][0] + dy * w, P[i][1] - dx * w]);
  }
  const d = 'M' + L.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'L' + R.reverse().map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
  return `<path d="${d}" fill="${INK}" opacity="${opacity}" ${attrs}/>`;
}
/** A smooth closed region (Catmull-Rom through the points), for washes. */
function region(pts, fill, opacity = 1, attrs = '') {
  const P = catmull(pts, 5);
  return `<path d="M${P.map((p) => f1(p[0]) + ' ' + f1(p[1])).join('L')}Z" fill="${fill}" opacity="${opacity}" ${attrs}/>`;
}
/** A pointed leaf (lens) of a given length and width, rotated about its base. */
function lens(cx, cy, len, wid, deg, opacity = 0.6, curve = 0.35) {
  const d = `M0 0 Q ${f1(len * 0.45)} ${f1(-wid * curve)} ${f1(len)} 0 Q ${f1(len * 0.5)} ${f1(wid * (1 - curve))} 0 0Z`;
  return `<path d="${d}" fill="${INK}" opacity="${opacity}" transform="translate(${f1(cx)} ${f1(cy)}) rotate(${deg})"/>`;
}
/** A momiji leaf: seven pointed lobes on a short stem. */
function mapleLeaf(cx, cy, r, deg, opacity = 0.6) {
  const pts = [];
  for (let i = 0; i <= 140; i++) {
    const th = (i / 140) * Math.PI * 2 - Math.PI / 2;
    const lobe = Math.pow(Math.abs(Math.cos(3.5 * th)), 1.7);   // |cos 3.5θ| has seven humps
    const bottom = 0.7 + 0.3 * (1 - Math.max(0, -Math.cos(th)));
    const rr = r * (0.3 + 0.7 * lobe) * bottom;
    pts.push(f1(Math.cos(th) * rr) + ' ' + f1(Math.sin(th) * rr));
  }
  return `<g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${deg})" opacity="${opacity}">` +
    `<path d="M${pts.join('L')}Z" fill="${INK}"/>` +
    `<path d="M0 ${f1(r * 0.5)} L ${f1(r * 0.12)} ${f1(r * 1.02)}" stroke="${INK}" stroke-width="${f1(r * 0.09)}" stroke-linecap="round"/></g>`;
}
/** A soft blob — a blurred ellipse, for foliage mass and far hills. */
const blob = (cx, cy, rx, ry, opacity, filter = 'mist') =>
  `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${INK}" opacity="${opacity}" filter="url(#${filter})"/>`;
/** A thin elliptical arc (a ripple), drawn as a tapered stroke that thins at both ends. */
function ring(cx, cy, rx, ry, opacity, w = 1.2, from = 0.05, to = 0.95) {
  const pts = [];
  for (let i = 0; i <= 28; i++) {
    const t = from + (to - from) * (i / 28), a = t * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  const mid = Math.floor(pts.length / 2);
  return brush(pts.slice(0, mid + 1), 0.2, w, opacity) + brush(pts.slice(mid), w, 0.2, opacity);
}

/** A ridge line: random peaks left-heavy, returned as a closed region to the frame's foot. */
function ridge(rand, base, peakH, x0 = -12, x1 = 252, n = 9, bias = 1) {
  const pts = [[x0, H + 10]];
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * (i / n);
    const env = Math.exp(-Math.pow((x - 55 * bias) / 90, 2));
    pts.push([x + (rand() - 0.5) * 12, base - peakH * (0.25 + 0.75 * env) * (0.55 + 0.45 * rand())]);
  }
  pts.push([x1, H + 10]);
  return pts;
}

const DEFS = `
<defs>
  <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${INK}" stop-opacity="1"/>
    <stop offset=".45" stop-color="${INK}" stop-opacity=".62"/>
    <stop offset="1" stop-color="${INK}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="mistLow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${INK}" stop-opacity="1"/>
    <stop offset=".7" stop-color="${INK}" stop-opacity=".5"/>
    <stop offset="1" stop-color="${INK}" stop-opacity=".08"/>
  </linearGradient>
  <linearGradient id="fadeR" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#000"/>
  </linearGradient>
  <mask id="edge"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#fadeR)"/></mask>
  <filter id="ink" x="-6%" y="-10%" width="112%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".06 .09" numOctaves="3" seed="5" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="dry" x="-6%" y="-10%" width="112%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".06 .09" numOctaves="3" seed="9" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="2" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.55" result="ga"/>
    <feComposite in="d" in2="ga" operator="in"/>
  </filter>
  <filter id="soft" x="-6%" y="-10%" width="112%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency=".03 .05" numOctaves="2" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
    <feGaussianBlur stdDeviation=".7"/>
  </filter>
  <filter id="mist" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="haze" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.1"/></filter>
</defs>`;

/* ------------------------------------------------------------ motifs */
const MOTIFS = {};

MOTIFS.mountains = () => {
  const r = rng(11);
  return [
    `<g filter="url(#soft)">${region(ridge(r, 86, 44, -12, 252, 10, 1.6), 'url(#mist)', 0.26)}</g>`,
    `<g filter="url(#soft)">${region(ridge(r, 98, 52, -12, 252, 9, 1.1), 'url(#mist)', 0.42)}</g>`,
    `<g filter="url(#ink)">${region([[-12, 130], [-6, 108], [10, 96], [26, 78], [40, 60], [50, 52], [58, 62], [70, 78], [84, 90], [100, 96], [120, 108], [140, 116], [160, 130]], 'url(#mistLow)', 0.78)}</g>`,
    `<g filter="url(#dry)">${brush([[50, 54], [54, 70], [64, 84], [76, 96]], 2.2, 0.6, 0.62)}${brush([[48, 58], [42, 72], [36, 84]], 1.8, 0.5, 0.5)}${brush([[62, 72], [72, 82], [86, 92]], 1.4, 0.4, 0.42)}</g>`,
    `<g fill="none" stroke="${INK}" stroke-width="1.1" stroke-linecap="round" opacity=".5"><path d="M118 40 q3 -3 6 0 q3 -3 6 0"/><path d="M130 33 q2.5 -2.5 5 0 q2.5 -2.5 5 0"/></g>`,
  ].join('');
};

MOTIFS.hills = () => {
  const r = rng(23);
  const far = ridge(r, 84, 20, -12, 252, 7, 2.2);
  return [
    `<g filter="url(#soft)">${region(far, 'url(#mist)', 0.22)}</g>`,
    `<g filter="url(#soft)">${region([[-12, 130], [-8, 100], [20, 92], [50, 88], [80, 92], [110, 98], [150, 104], [200, 108], [252, 112], [252, 130]], 'url(#mistLow)', 0.34)}</g>`,
    `<g filter="url(#ink)">${brush([[26, 96], [28, 84], [24, 72], [27, 64]], 3.2, 1.2, 0.72)}${brush([[27, 78], [36, 70]], 1.6, 0.6, 0.6)}${brush([[26, 84], [17, 76]], 1.5, 0.6, 0.55)}</g>`,
    blob(24, 60, 13, 8, 0.4, 'haze'), blob(36, 66, 9, 6, 0.36, 'haze'), blob(14, 70, 8, 5, 0.32, 'haze'),
    `<g filter="url(#dry)" opacity=".7">${[...Array(18)].map(() => { const a = -20 + r() * 70, cx = 12 + r() * 32, cy = 58 + r() * 16, l = 5 + r() * 5; return brush([[cx, cy], [cx + Math.cos(a * Math.PI / 180) * l, cy - Math.sin(a * Math.PI / 180) * l]], 1.4, 0.2, 0.55); }).join('')}</g>`,
    `<g filter="url(#ink)">
      <path d="M48 85 L62 69 L90 69 L106 85 L100 84 L88 77 L66 77 L54 84Z" fill="url(#mistLow)" opacity=".84"/>
      ${brush([[60, 69], [92, 69]], 2.4, 2.4, 0.82)}
      ${brush([[46, 86], [54, 78], [62, 69]], 2.4, 1, 0.82)}${brush([[108, 86], [100, 78], [90, 69]], 2.4, 1, 0.82)}
      <path d="M60 85 L60 96 L96 96 L96 85Z" fill="${INK}" opacity=".16"/>
      ${brush([[60, 85], [60, 97]], 1.6, 1.2, 0.7)}${brush([[96, 85], [96, 97]], 1.6, 1.2, 0.7)}${brush([[78, 87], [78, 97]], 1.3, 1, 0.5)}
      ${brush([[56, 97], [100, 97]], 1.8, 1.4, 0.7)}
    </g>`,
    `<g filter="url(#dry)">${brush([[80, 98], [96, 104], [118, 108], [150, 112]], 2.5, 0.4, 0.28)}${brush([[110, 100], [114, 94]], 1.2, 0.3, 0.45)}${brush([[116, 101], [121, 95]], 1.2, 0.3, 0.42)}${brush([[124, 104], [127, 98]], 1.1, 0.3, 0.38)}</g>`,
  ].join('');
};

MOTIFS.bamboo = () => {
  const r = rng(7);
  const stalk = (x0, lean, w, segs, seg) => {
    let out = '';
    for (let i = 0; i < segs; i++) {
      const y1 = 122 - i * seg, y0 = y1 - seg + 3;
      const xa = x0 + lean * (122 - y1), xb = x0 + lean * (122 - y0);
      out += brush([[xa, y1], [xb, y0]], w, w * 0.9, 0.62);
      out += brush([[xa - w * 0.7, y1 - 1.5], [xa + w * 0.7, y1 - 1.5]], 1.6, 1.6, 0.8);
    }
    return out;
  };
  const cluster = (cx, cy, n, base, spread, len, op) => [...Array(n)].map((_, i) => {
    const a = base + (i / (n - 1) - 0.5) * spread + (r() - 0.5) * 10;
    return lens(cx, cy, len * (0.8 + r() * 0.4), 5.5 + r() * 2, a, op * (0.8 + r() * 0.3));
  }).join('');
  return [
    `<g filter="url(#ink)">${stalk(30, 0.06, 6.5, 5, 26)}${stalk(62, -0.03, 3.4, 6, 22)}</g>`,
    `<g filter="url(#ink)">${brush([[34, 44], [52, 36], [70, 33]], 1.4, 0.5, 0.6)}${brush([[62, 60], [82, 54], [104, 52]], 1.3, 0.4, 0.55)}${brush([[31, 72], [16, 62], [6, 60]], 1.3, 0.4, 0.55)}${brush([[66, 26], [86, 20], [110, 22]], 1.2, 0.4, 0.5)}</g>`,
    `<g filter="url(#ink)">
      ${cluster(70, 33, 5, 20, 110, 24, 0.66)}
      ${cluster(104, 52, 6, 10, 120, 26, 0.6)}
      ${cluster(6, 60, 4, 150, 90, 20, 0.5)}
      ${cluster(110, 22, 5, -10, 110, 22, 0.44)}
      ${cluster(52, 36, 3, 200, 60, 16, 0.5)}
      ${cluster(82, 54, 3, 200, 60, 15, 0.45)}
    </g>`,
    `<g filter="url(#haze)" opacity=".13">${stalk(100, 0.02, 3.4, 4, 32)}</g>`,
  ].join('');
};

MOTIFS.pine = () => {
  const r = rng(31);
  const tuft = (cx, cy, rx, n, op) => {
    let out = blob(cx, cy + 2, rx, rx * 0.3, op * 0.4, 'haze') + blob(cx, cy + 3, rx * 0.66, rx * 0.2, op * 0.5, 'haze');
    for (let i = 0; i < n; i++) {
      const a = 180 * (i / (n - 1)) + (r() - 0.5) * 14, rad = a * Math.PI / 180, l = rx * (0.5 + r() * 0.5);
      const x0 = cx + Math.cos(rad) * rx * 0.3, y0 = cy + 2 - Math.sin(rad) * rx * 0.06;
      out += brush([[x0, y0], [x0 + Math.cos(rad) * l, y0 - Math.sin(rad) * l * 0.5]], 1.1, 0.2, op);
    }
    return out;
  };
  return [
    `<g filter="url(#ink)">
      ${brush([[20, 124], [26, 104], [30, 86], [40, 72], [46, 62]], 9, 4.2, 0.78)}
      ${brush([[42, 70], [60, 64], [82, 58], [106, 54], [126, 52]], 4, 1.4, 0.72)}
      ${brush([[46, 62], [52, 48], [60, 40]], 3.4, 1.2, 0.68)}
      ${brush([[30, 88], [18, 80], [8, 78]], 2.6, 0.8, 0.6)}
      ${brush([[84, 58], [92, 46], [100, 40]], 2, 0.6, 0.55)}
      ${brush([[108, 54], [118, 64], [128, 70]], 1.8, 0.5, 0.5)}
    </g>`,
    `<g filter="url(#dry)">
      ${tuft(62, 38, 26, 34, 0.66)}
      ${tuft(102, 38, 24, 30, 0.6)}
      ${tuft(128, 50, 21, 26, 0.52)}
      ${tuft(8, 76, 16, 18, 0.5)}
      ${tuft(130, 70, 17, 20, 0.42)}
    </g>`,
    `<g filter="url(#dry)">${brush([[2, 116], [30, 112], [70, 114], [120, 112]], 2.4, 0.3, 0.3)}</g>`,
  ].join('');
};

MOTIFS.gate = () => [
  blob(124, 64, 24, 12, 0.13), blob(152, 72, 18, 8, 0.09),
  `<g filter="url(#ink)">
    ${region([[8, 60], [22, 52], [40, 44], [58, 39], [70, 38], [82, 39], [100, 44], [118, 52], [132, 60], [122, 58], [100, 51], [70, 46], [40, 51], [18, 58]], 'url(#mistLow)', 0.86)}
    ${brush([[6, 61], [20, 53], [40, 45], [70, 38]], 2.6, 1.2, 0.8)}${brush([[134, 61], [120, 53], [100, 45], [70, 38]], 2.6, 1.2, 0.8)}
    <path d="M22 58 L118 58 L118 63 L22 63Z" fill="${INK}" opacity=".55"/>
  </g>`,
  `<g filter="url(#ink)">
    ${brush([[34, 62], [34, 118]], 5, 4.6, 0.82)}${brush([[106, 62], [106, 118]], 5, 4.6, 0.82)}
    ${brush([[22, 72], [118, 72]], 3, 3, 0.72)}
    <rect x="63" y="60" width="14" height="18" fill="${INK}" opacity=".78"/>
    <rect x="65" y="62" width="10" height="14" fill="#fff" opacity=".22"/>
    ${brush([[42, 84], [98, 84]], 1.6, 1.6, 0.35)}
  </g>`,
  `<g filter="url(#dry)">
    ${brush([[112, 90], [150, 90]], 1.8, 0.6, 0.3)}${brush([[112, 104], [140, 104]], 1.6, 0.5, 0.26)}
    ${brush([[128, 86], [128, 110]], 1.5, 1.2, 0.3)}
    ${brush([[18, 118], [124, 118]], 3, 2, 0.6)}${brush([[8, 123], [140, 123]], 2, 1, 0.3)}
  </g>`,
].join('');

MOTIFS.temple = () => [
  `<g filter="url(#soft)">${region([[-12, 130], [-8, 104], [30, 92], [80, 86], [130, 90], [180, 100], [252, 108], [252, 130]], 'url(#mistLow)', 0.3)}</g>`,
  `<g opacity=".3" filter="url(#haze)">
    ${region([[176, 58], [186, 50], [196, 58], [192, 57], [186, 54], [180, 57]], INK, 1)}
    ${region([[172, 70], [186, 60], [200, 70], [196, 69], [186, 65], [176, 69]], INK, 1)}
    ${region([[168, 82], [186, 70], [204, 82], [200, 81], [186, 76], [172, 81]], INK, 1)}
    <rect x="184" y="82" width="4" height="12" fill="${INK}"/>
  </g>`,
  `<g filter="url(#ink)">
    ${region([[38, 56], [50, 46], [66, 40], [84, 38], [102, 40], [118, 46], [130, 56], [120, 54], [102, 47], [84, 45], [66, 47], [48, 54]], 'url(#mistLow)', 0.8)}
    ${brush([[36, 57], [50, 47], [84, 38]], 2.2, 1, 0.8)}${brush([[132, 57], [118, 47], [84, 38]], 2.2, 1, 0.8)}
    <path d="M58 56 L110 56 L110 66 L58 66Z" fill="${INK}" opacity=".42"/>
    ${region([[10, 84], [26, 74], [50, 68], [84, 66], [118, 68], [142, 74], [158, 84], [146, 82], [118, 75], [84, 73], [50, 75], [22, 82]], 'url(#mistLow)', 0.86)}
    ${brush([[8, 85], [26, 75], [84, 66]], 2.6, 1.2, 0.82)}${brush([[160, 85], [142, 75], [84, 66]], 2.6, 1.2, 0.82)}
    ${brush([[40, 86], [40, 108]], 3, 2.6, 0.72)}${brush([[62, 86], [62, 108]], 2.6, 2.4, 0.55)}${brush([[106, 86], [106, 108]], 2.6, 2.4, 0.55)}${brush([[128, 86], [128, 108]], 3, 2.6, 0.72)}
    ${brush([[70, 92], [98, 92]], 1.6, 1.6, 0.4)}${brush([[70, 100], [98, 100]], 1.6, 1.6, 0.4)}
    ${brush([[28, 108], [140, 108]], 3.4, 2.4, 0.74)}${brush([[22, 113], [146, 113]], 2, 1.2, 0.4)}
  </g>`,
  blob(14, 70, 12, 8, 0.22, 'haze'), blob(26, 62, 10, 7, 0.18, 'haze'),
  `<g filter="url(#ink)">${brush([[18, 100], [18, 78]], 2.6, 1.2, 0.62)}${brush([[18, 82], [26, 70]], 1.4, 0.5, 0.5)}${brush([[18, 88], [10, 78]], 1.3, 0.4, 0.5)}</g>`,
  `<g filter="url(#dry)" opacity=".7">${[...Array(14)].map((_, i) => { const a = -30 + (i * 53) % 80, cx = 6 + (i * 37) % 26, cy = 60 + (i * 19) % 16, l = 5 + (i * 7) % 5; return brush([[cx, cy], [cx + Math.cos(a * Math.PI / 180) * l, cy - Math.sin(a * Math.PI / 180) * l]], 1.3, 0.2, 0.5); }).join('')}</g>`,
  `<g filter="url(#dry)">${brush([[84, 116], [96, 120], [116, 123]], 2.4, 0.6, 0.3)}${brush([[150, 96], [150, 108]], 2.2, 1.6, 0.55)}<rect x="146" y="90" width="8" height="6" fill="${INK}" opacity=".55"/><path d="M144 90 L150 86 L156 90Z" fill="${INK}" opacity=".6"/></g>`,
].join('');

MOTIFS.ripples = () => {
  const r = rng(5);
  return [
    // the wash of still water, and the far bank
    `<g filter="url(#soft)">${region([[-12, 130], [-8, 84], [40, 80], [100, 82], [160, 86], [252, 90], [252, 130]], 'url(#mist)', 0.14)}</g>`,
    // three rings widening from a drop, thinning as they go out
    `<g filter="url(#ink)">
      ${ring(56, 84, 10, 3.4, 0.62, 1.4)}
      ${ring(56, 84, 22, 7.2, 0.5, 1.3, 0.03, 0.97)}
      ${ring(56, 84, 36, 11.6, 0.4, 1.2, 0.06, 0.94)}
      ${ring(56, 84, 52, 16.4, 0.28, 1.1, 0.1, 0.9)}
    </g>`,
    // a second, older set to the right, fainter
    `<g filter="url(#ink)" opacity=".6">
      ${ring(122, 100, 9, 3, 0.5, 1.2)}
      ${ring(122, 100, 20, 6.4, 0.36, 1.1, 0.04, 0.96)}
      ${ring(122, 100, 33, 10.4, 0.24, 1, 0.1, 0.9)}
    </g>`,
    // the drop itself and a splash of dots; a floating leaf drifting off
    `<g filter="url(#dry)">
      <circle cx="56" cy="84" r="1.6" fill="${INK}" opacity=".7"/>
      ${[...Array(6)].map(() => { const a = r() * Math.PI * 2, d = 4 + r() * 6; return `<circle cx="${f1(56 + Math.cos(a) * d)}" cy="${f1(84 + Math.sin(a) * d * 0.4 - 4)}" r="${f1(0.5 + r() * 0.6)}" fill="${INK}" opacity=".5"/>`; }).join('')}
      ${lens(84, 62, 16, 6, 12, 0.5, 0.4)}${lens(96, 58, 7, 3, -30, 0.3, 0.4)}
    </g>`,
    // reflections: a few horizontal dry strokes
    `<g filter="url(#dry)">${brush([[10, 106], [30, 104], [48, 106]], 1.2, 0.3, 0.26)}${brush([[70, 112], [100, 110], [126, 113]], 1.2, 0.3, 0.22)}${brush([[20, 96], [34, 95]], 1, 0.3, 0.22)}</g>`,
  ].join('');
};

MOTIFS.maple = () => [
  `<g filter="url(#ink)">
    ${brush([[-4, 22], [18, 30], [42, 40], [64, 44], [84, 46]], 4.2, 1.2, 0.72)}
    ${brush([[40, 39], [52, 30], [66, 24]], 2, 0.5, 0.6)}
    ${brush([[62, 44], [76, 56], [86, 64]], 1.8, 0.5, 0.58)}
    ${brush([[20, 31], [30, 44], [34, 56]], 1.8, 0.5, 0.55)}
  </g>`,
  `<g filter="url(#ink)">
    ${mapleLeaf(30, 18, 12, -20, 0.62)}${mapleLeaf(62, 20, 11, 30, 0.58)}${mapleLeaf(48, 52, 13, 200, 0.66)}
    ${mapleLeaf(88, 40, 11, 60, 0.56)}${mapleLeaf(88, 66, 10, 150, 0.52)}${mapleLeaf(12, 44, 10, 250, 0.5)}
    ${mapleLeaf(72, 34, 9, 100, 0.44)}
  </g>`,
  `<g filter="url(#dry)">${mapleLeaf(112, 84, 8, 300, 0.4)}${mapleLeaf(128, 100, 6.5, 40, 0.32)}${mapleLeaf(104, 108, 6, 120, 0.3)}${mapleLeaf(146, 78, 5.5, 200, 0.24)}</g>`,
].join('');

/* ------------------------------------------------------------ output */
const svgOf = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${DEFS}<g mask="url(#edge)">${body}</g></svg>`;

mkdirSync(OUT, { recursive: true });
const files = {};
for (const [name, fn] of Object.entries(MOTIFS)) {
  const svg = svgOf(fn());
  files[name] = svg;
  writeFileSync(path.join(OUT, `sumi-${name}.svg`), svg);
}
const review = `<!doctype html><meta charset="utf-8"><title>sumi motifs</title>
<style>body{margin:0;padding:24px;background:#2a2320;font:12px system-ui;color:#ddd}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;max-width:1100px}
.card{background:#E5DAC9;border-radius:16px;position:relative;overflow:hidden;height:62px;display:grid;place-items:center;color:#493D2F;font:16px Georgia,serif}
.card svg{position:absolute;left:0;top:0;height:100%;width:auto;opacity:.55}
.card.r svg{left:auto;right:0;transform:scaleX(-1)}
.big{background:#E5DAC9;border-radius:16px;padding:0;height:240px}
.big svg{width:100%;height:100%}
h3{margin:18px 0 6px;font-weight:500}</style>
<h3>At card scale (62px tall, .55 opacity)</h3><div class="grid">
${Object.entries(files).map(([n, s], i) => `<div class="card ${i % 2 ? 'r' : ''}">${s}<span>${n}</span></div>`).join('')}
</div><h3>Large</h3><div class="grid">
${Object.entries(files).map(([, s]) => `<div class="big">${s}</div>`).join('')}
</div>`;
writeFileSync(path.join(OUT, 'review.html'), review);
console.log('wrote', Object.keys(files).length, 'motifs to', OUT);

if (!process.argv.includes('--svg-only')) {
  const { chromium } = await import('playwright');
  const sharp = (await import('sharp')).default;
  const SCALE = 3;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
  mkdirSync(PUB, { recursive: true });
  for (const [name, svg] of Object.entries(files)) {
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg}`);
    const png = await page.screenshot({ omitBackground: true, type: 'png' });
    const out = path.join(PUB, `sumi-${name}-${VERSION}.webp`);
    const info = await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(out);
    console.log(`  ${path.basename(out)}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
  }
  await browser.close();
}
