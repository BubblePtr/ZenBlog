const FILE_EXTENSION_RE = /\/[^/?#]+\.[^/?#]+$/;

export function withTrailingSlash(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) {
    return href;
  }

  const splitIndex = href.search(/[?#]/);
  const pathname = splitIndex === -1 ? href : href.slice(0, splitIndex);
  const suffix = splitIndex === -1 ? '' : href.slice(splitIndex);

  if (pathname === '/' || pathname.endsWith('/') || FILE_EXTENSION_RE.test(pathname)) {
    return `${pathname}${suffix}`;
  }

  return `${pathname}/${suffix}`;
}
