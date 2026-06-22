import { createHeadingSlug } from '../rehype/heading-slugs.mjs';

/**
 * Extract H2/H3 headings from markdown source using the same slug rules as anchor-headings.
 */
export function extractMarkdownHeadings(markdown) {
  const usedSlugs = new Set();
  const headings = [];

  for (const line of markdown.split('\n')) {
    const h3Match = line.match(/^###(?!#)\s+(.+?)\s*$/);
    const h2Match = line.match(/^##(?!#)\s+(.+?)\s*$/);

    if (h3Match) {
      const text = h3Match[1].trim();
      const slug = createHeadingSlug(text, usedSlugs);

      if (slug) {
        headings.push({ slug, text, depth: 3 });
      }

      continue;
    }

    if (h2Match) {
      const text = h2Match[1].trim();
      const slug = createHeadingSlug(text, usedSlugs);

      if (slug) {
        headings.push({ slug, text, depth: 2 });
      }
    }
  }

  return headings;
}
