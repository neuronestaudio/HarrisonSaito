/**
 * Structured data + metadata helpers.
 *
 * Audit finding H6: the legacy site shipped zero JSON-LD, so it had no rich
 * result eligibility and no local relevance despite operating out of Chatswood.
 * Every page here emits a connected @graph: Person <- LocalBusiness <- Service,
 * plus Review/AggregateRating built from the real testimonials.
 */
import { SITE, OFFERS, TESTIMONIALS, PHASES } from '../data/site';

const ID = {
  person: `${SITE.domain}/#person`,
  business: `${SITE.domain}/#business`,
  website: `${SITE.domain}/#website`,
  org: `${SITE.domain}/#organization`,
};

export function personSchema() {
  return {
    '@type': 'Person',
    '@id': ID.person,
    name: 'Harrison Saito',
    givenName: 'Harrison',
    familyName: 'Saito',
    url: SITE.domain,
    image: `${SITE.domain}/og-image.jpg`,
    jobTitle: ['Life Coach', 'High School Teacher', 'Karate Instructor'],
    description:
      "Sydney-based men's life coach, high school English teacher and 2nd Dan black belt in Karate. Runs the Return to Self 12-week men's coaching programme and 1:1 HSC mentoring from Chatswood, NSW.",
    knowsAbout: [
      "Men's life coaching",
      'Karate',
      'Buddhist philosophy',
      'HSC English tutoring',
      'Youth mentoring',
      'Nervous system regulation',
      'Intergenerational trauma',
    ],
    knowsLanguage: ['en-AU'],
    homeLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: SITE.locality,
        addressRegion: SITE.region,
        addressCountry: SITE.country,
      },
    },
    sameAs: [SITE.instagram, SITE.youtube],
    worksFor: { '@id': ID.business },
  };
}

export function localBusinessSchema() {
  const reviews = TESTIMONIALS.map((t) => ({
    '@type': 'Review',
    reviewBody: t.quote,
    author: { '@type': 'Person', name: t.name },
    reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5, worstRating: 1 },
  }));

  return {
    '@type': ['LocalBusiness', 'ProfessionalService'],
    '@id': ID.business,
    name: 'Harrison Saito — Coaching & Mentoring',
    alternateName: 'Harrison Saito',
    url: SITE.domain,
    image: `${SITE.domain}/og-image.jpg`,
    logo: `${SITE.domain}/favicon-512.png`,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: '$$',
    founder: { '@id': ID.person },
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      postalCode: SITE.postcode,
      addressCountry: SITE.country,
    },
    areaServed: [
      { '@type': 'City', name: 'Sydney' },
      { '@type': 'AdministrativeArea', name: 'North Shore, Sydney' },
      { '@type': 'Place', name: 'Online (Australia-wide)' },
    ],
    sameAs: [SITE.instagram, SITE.youtube],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 5,
      reviewCount: TESTIMONIALS.length,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Coaching & Mentoring',
      // No `price` here on purpose. Pricing is not published on the site, and
      // emitting it in structured data would leak it straight back into search
      // results — defeating the point and contradicting the page.
      itemListElement: OFFERS.map((o) => ({
        '@type': 'Offer',
        name: o.name,
        description: o.description,
        url: `${SITE.domain}${o.href}`,
        availability: 'https://schema.org/InStock',
      })),
    },
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': ID.website,
    url: SITE.domain,
    name: 'Harrison Saito',
    publisher: { '@id': ID.person },
    inLanguage: 'en-AU',
  };
}

/** A single coaching/tutoring service page. */
export function serviceSchema(opts: {
  name: string;
  description: string;
  url: string;
  price?: number;
  serviceType: string;
}) {
  return {
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: `${SITE.domain}${opts.url}`,
    provider: { '@id': ID.business },
    areaServed: [
      { '@type': 'City', name: 'Sydney' },
      { '@type': 'Place', name: 'Online (Australia-wide)' },
    ],
    ...(opts.price
      ? {
          offers: {
            '@type': 'Offer',
            price: opts.price,
            priceCurrency: 'AUD',
            availability: 'https://schema.org/InStock',
            url: `${SITE.domain}${opts.url}`,
          },
        }
      : {}),
  };
}

/** The Return to Self programme as a Course with its three phases. */
export function courseSchema() {
  return {
    '@type': 'Course',
    name: 'Return to Self',
    description:
      'A 12-week structured coaching programme for men, in three phases — Separate, Return, Integrate — built on martial arts, Buddhism and honest self-inquiry.',
    url: `${SITE.domain}/mens-coaching`,
    provider: { '@id': ID.business },
    inLanguage: 'en-AU',
    offers: {
      '@type': 'Offer',
      category: 'Paid',
      availability: 'https://schema.org/InStock',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: ['Onsite', 'Online'],
      courseWorkload: 'P12W',
      location: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: SITE.locality,
          addressRegion: SITE.region,
          addressCountry: SITE.country,
        },
      },
    },
    syllabusSections: PHASES.map((p, i) => ({
      '@type': 'Syllabus',
      name: `${p.name} — ${p.weeks}`,
      description: p.blurb,
      position: i + 1,
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${SITE.domain}${t.url}`,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function videoSchema(v: { id: string; title: string; description?: string }) {
  return {
    '@type': 'VideoObject',
    name: v.title,
    description: v.description ?? v.title,
    thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.id}`,
    uploadDate: '2024-01-01',
    publisher: { '@id': ID.person },
  };
}

/** Wraps any set of nodes into a single connected @graph. */
export function graph(...nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  };
}
