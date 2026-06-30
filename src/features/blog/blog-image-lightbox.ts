export const LIGHTBOX_EXCLUDED_SELECTOR = 'a.link-card, a.github-repo-card, .not-prose';

export const BLOG_LIGHTBOX_SCOPE_SELECTOR = '[data-blog-article]';

export function resolveFullSizeSrc(src: string, srcset?: string | null): string {
  if (!srcset?.trim()) {
    return src;
  }

  const candidates = srcset
    .split(',')
    .map((part) => part.trim())
    .map((part) => {
      const [url, descriptor] = part.split(/\s+/, 2);
      const width = descriptor?.endsWith('w') ? Number.parseInt(descriptor.slice(0, -1), 10) : 0;

      return { url, width: Number.isFinite(width) ? width : 0 };
    })
    .filter((candidate) => candidate.url);

  if (candidates.length === 0) {
    return src;
  }

  const widest = candidates.reduce((best, current) =>
    current.width > best.width ? current : best,
  );

  return widest.width > 0 ? widest.url : src;
}

export function isLightboxEligibleImage(element: Element): boolean {
  if (element.tagName !== 'IMG') {
    return false;
  }

  if (element.getAttribute('data-lightbox') === 'false') {
    return false;
  }

  return !element.closest(LIGHTBOX_EXCLUDED_SELECTOR);
}

export function collectLightboxImages(scope: ParentNode): HTMLImageElement[] {
  return Array.from(
    scope.querySelectorAll<HTMLImageElement>('.article-prose img, [data-blog-hero-image] img'),
  ).filter(isLightboxEligibleImage);
}
