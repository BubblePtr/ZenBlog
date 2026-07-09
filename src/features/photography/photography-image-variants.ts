/** Display widths for photography grid/home previews (not full-res originals). */
export const PHOTOGRAPHY_DISPLAY_WIDTHS = [800, 1600] as const;

export type PhotographyDisplayWidth = (typeof PHOTOGRAPHY_DISPLAY_WIDTHS)[number];

export interface PhotographyImageVariants {
  /** Default src for browsers without srcset support — mid-size WebP. */
  src: string;
  /** Responsive candidates when CDN variants exist. */
  srcSet?: string;
  widths: readonly PhotographyDisplayWidth[];
  /** Unmodified original URL from content frontmatter (JPG on CDN). */
  originalSrc: string;
}

const CDN_HOST = 'cdn.ninthbit.org';
const DEFAULT_SRC_WIDTH: PhotographyDisplayWidth = 1600;

/**
 * `/photography/foo.jpg` or `/photography/foo-w1600.webp` → `/photography/foo`
 */
function photographyStemFromPathname(pathname: string): string | null {
  const decoded = decodeURIComponent(pathname);
  if (!decoded.startsWith('/photography/')) {
    return null;
  }

  const fileName = decoded.slice('/photography/'.length);
  if (!fileName || fileName.includes('/')) {
    return null;
  }

  const withoutExt = fileName.replace(/\.[^.]+$/, '');
  const stemName = withoutExt.replace(/-w\d+$/i, '');
  if (!stemName) {
    return null;
  }

  return `/photography/${stemName}`;
}

function buildVariantUrl(origin: string, stem: string, width: PhotographyDisplayWidth): string {
  return `${origin}${stem}-w${width}.webp`;
}

/**
 * Map a photography original CDN URL to display-sized WebP variants.
 * Non-CDN / unrecognized URLs pass through unchanged.
 */
export function buildPhotographyImageVariants(imageSrc: string): PhotographyImageVariants {
  const widths = PHOTOGRAPHY_DISPLAY_WIDTHS;

  let url: URL;
  try {
    url = new URL(imageSrc);
  } catch {
    return { src: imageSrc, widths, originalSrc: imageSrc };
  }

  if (url.host !== CDN_HOST) {
    return { src: imageSrc, widths, originalSrc: imageSrc };
  }

  const stem = photographyStemFromPathname(url.pathname);
  if (!stem) {
    return { src: imageSrc, widths, originalSrc: imageSrc };
  }

  const looksLikeVariant =
    /-w\d+\.webp$/i.test(url.pathname) || url.pathname.toLowerCase().endsWith('.webp');
  const originalSrc = looksLikeVariant ? `${url.origin}${stem}.jpg` : imageSrc;

  const src = buildVariantUrl(url.origin, stem, DEFAULT_SRC_WIDTH);
  const srcSet = widths
    .map((width) => `${buildVariantUrl(url.origin, stem, width)} ${width}w`)
    .join(', ');

  return { src, srcSet, widths, originalSrc };
}
