/**
 * Resolved tracking configuration — the single source for every component that
 * needs to know which tags are live.
 *
 * This exists because the values were previously read straight from
 * import.meta.env in three separate components, and the moment the GTM
 * container was given a default in one of them the others disagreed: GTM
 * loaded, but ConsentBar still saw "nothing configured" and rendered nothing,
 * so consent could never be granted and Consent Mode stayed denied for every
 * visitor — silently blocking every tag in the container it had just loaded.
 *
 * A GTM container ID is public (it appears in the source of every page that
 * loads it), so defaulting it here is safe and means a build with no env vars
 * set still ships tracked. GA4 and the Pixel have no default: they are
 * expected to fire through the container, and a wrong ID there sends a real
 * business's data to the wrong property.
 */

/** Live container. Override only to point a build at a different one. */
export const GTM_ID: string = import.meta.env.PUBLIC_GTM_ID ?? 'GTM-5GPC5FDS';

/** Only loaded directly when GTM is absent — otherwise it fires through GTM. */
export const GA4_ID: string = import.meta.env.PUBLIC_GA4_ID ?? '';

/** Browser half of the Pixel + Conversions API pair. */
export const PIXEL_ID: string = import.meta.env.PUBLIC_META_PIXEL_ID ?? '';

/** Whether anything at all is loaded — drives whether consent must be asked for. */
export const TRACKING_ENABLED: boolean = Boolean(GTM_ID || GA4_ID || PIXEL_ID);
