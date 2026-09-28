// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export const SITE = 'https://www.harrisonsaito.com.au';

/**
 * `astro dev` has no Vercel functions, so every form on a local page used to
 * fail with "Something went wrong sending that" (Dion, 29 Sep 2026, testing
 * /book on 127.0.0.1). In dev only, answer POST /api/lead the way api/lead.ts
 * does with nothing configured: accept, log the payload to the terminal,
 * deliver nowhere. Production is untouched — this plugin only exists under
 * `serve`.
 */
function devLeadStub() {
  return {
    name: 'dev-lead-stub',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/lead', (req, res) => {
        res.setHeader('content-type', 'application/json');
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ ok: false, error: 'POST a JSON body to this endpoint' }));
          return;
        }
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          console.log('[lead:dev]', body.slice(0, 800));
          res.end(JSON.stringify({ ok: true, delivered: false, dev: true, integrations: { dev: 'stub — nothing is sent from astro dev' } }));
        });
      });
    },
  };
}

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      // Landing pages and legal boilerplate stay out of the sitemap.
      filter: (page) =>
        !page.includes('/lp/') && !page.includes('/thank-you') && !page.endsWith('/landing'),
      changefreq: 'monthly',
      lastmod: new Date(),
      serialize(item) {
        if (item.url === `${SITE}/`) item.priority = 1.0;
        else if (/mens-coaching|hsc-tutoring/.test(item.url)) item.priority = 0.9;
        else if (/apply|book|contact/.test(item.url)) item.priority = 0.8;
        else item.priority = 0.6;
        return item;
      },
    }),
  ],
  vite: {
    build: {
      cssCodeSplit: false,
    },
    plugins: [devLeadStub()],
  },
});
