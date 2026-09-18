/**
 * The harrison-saito-morel template's copy, mapped onto this site.
 *
 * morel-source.ts is a verbatim copy of the template's data (see
 * scripts/morel/sync.mjs). Its links point at the template's own routes and
 * its logos at files that live under versioned names here, so everything the
 * home page uses is re-exported through `local()`, which rewrites both. The
 * words are untouched.
 */
import * as S from './morel-source';

/** Template route → this site's page for the same thing. */
const ROUTES: Record<string, string> = {
  '/story': '/about',
  '/coaching': '/mens-coaching',
  '/return-to-self': '/mens-coaching',
  '/resources': '/media',
  /* /workshops is ported as its own page (src/pages/workshops.astro); /book,
     /privacy, /terms and /#faq exist here under the same paths. */
};

/** Button words: sell without selling (Dion, 18 Sep) — "let me walk with
    you", "break the cycle" — not "Book a discovery chat". */
const LABELS: Record<string, string> = {
  'Book a discovery chat': 'Let me walk with you',
  'Start the training': 'Break the cycle',
  'Book when you’re ready': 'Walk with me when you’re ready',
};

/** Template asset → the versioned copy in public/img (immutable cache). */
const ASSETS: Record<string, string> = {
  '/img/logo-sbs-world-news.svg': '/img/mo/logo-sbs-world-news-v1.svg',
  '/img/logo-sbs.svg': '/img/mo/logo-sbs-v1.svg',
  '/img/mark-shinbukan-dark.png': '/img/mo/mark-shinbukan-dark-v1.webp',
  '/img/mark-seizanji-dark.png': '/img/mo/mark-seizanji-dark-v1.webp',
  '/img/logo-dark-512.png': '/img/logo-dark-512.webp',
  '/img/logo-light-512.png': '/img/logo-light-512.webp',
};

function local<T>(value: T): T {
  if (typeof value === 'string') {
    return ((ROUTES[value] ?? ASSETS[value] ?? LABELS[value] ?? value) as unknown) as T;
  }
  if (Array.isArray(value)) return (value.map(local) as unknown) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = local(v);
    return out as T;
  }
  return value;
}

export const asset = (path: string) => ASSETS[path] ?? path;

export const HERO = local(S.HERO);
export const FOR_YOU_SECTION = local(S.FOR_YOU_SECTION);
export const FOR_YOU = local(S.FOR_YOU);
export const LOGOS = local(S.LOGOS);
export const INTRO = local(S.INTRO);
export const STORY_SECTION = local(S.STORY_SECTION);
export const PATTERNS_SECTION = local(S.PATTERNS_SECTION);
export const PATTERNS = local(S.PATTERNS);
export const PHASES = local(S.PHASES);
export const CORE = local(S.CORE);
export const FAQ_SECTION = local(S.FAQ_SECTION);
export const FAQ = local(S.FAQ);
export const QUOTE = local(S.QUOTE);
export const FILMS_SECTION = local(S.FILMS_SECTION);
export const FILMS = local(S.FILMS);
export const FAMILY = local(S.FAMILY);
/* Dion, 18 Sep: the close is just "Reach out." — the template's "If something
   here resonated," lead-in is dropped, and the line stands on its own. */
export const CLOSE = { ...local(S.CLOSE), title: '<mark>Reach out.</mark>' };
export const NEWSLETTER = local(S.NEWSLETTER);
export const WORKSHOPS_PAGE = local(S.PAGES.find((p) => p.slug === 'workshops')!);
