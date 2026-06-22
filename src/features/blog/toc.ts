export interface TocHeading {
  slug: string;
  text: string;
  depth: 2 | 3;
}

export const MIN_TOC_HEADINGS = 2;

export function shouldShowToc(headings: TocHeading[]): boolean {
  return headings.length >= MIN_TOC_HEADINGS;
}
