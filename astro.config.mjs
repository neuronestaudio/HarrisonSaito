// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export const SITE = 'https://www.harrisonsaito.com.au';

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
      filter: (page) => !page.includes('/lp/') && !page.includes('/thank-you'),
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
  },
});
