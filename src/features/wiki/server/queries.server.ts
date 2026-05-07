import { getCollection, type CollectionEntry } from 'astro:content';

export type WikiEntry = CollectionEntry<'wiki'>;

export async function getAllWikiEntries(): Promise<WikiEntry[]> {
  return (await getCollection('wiki')).sort(
    (a, b) => new Date(b.data.updated).valueOf() - new Date(a.data.updated).valueOf(),
  );
}

export function extractSlug(id: string): string {
  return id.replace(/\.[^.]+$/, '');
}

export function getWikiUrl(slug: string, lang: 'en' | 'zh' = 'zh'): string {
  return lang === 'zh' ? `/zh/wiki/${slug}` : `/wiki/${slug}`;
}

export async function getWikiStaticPaths() {
  const entries = await getCollection('wiki');
  return entries.map((entry) => ({
    params: { slug: extractSlug(entry.id) },
    props: entry,
  }));
}

export function groupByType(entries: WikiEntry[]) {
  const groups: Record<string, WikiEntry[]> = {};
  for (const entry of entries) {
    const type = entry.data.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(entry);
  }
  return groups;
}

// Extract wikilink slugs from a page's raw body
function extractOutboundLinks(body: string): string[] {
  const re = /\[\[([^\]|]+)/g;
  const slugs: string[] = [];
  let m;
  while ((m = re.exec(body)) !== null) {
    slugs.push(m[1].trim());
  }
  return slugs;
}

// Parse <WikiLink slug="..." /> components from MDX body
function extractComponentLinks(body: string): string[] {
  const re = /<WikiLink\s+slug="([^"]+)"/g;
  const slugs: string[] = [];
  let m;
  while ((m = re.exec(body)) !== null) {
    slugs.push(m[1].trim());
  }
  return slugs;
}

export async function buildGraphData(): Promise<{
  nodes: Array<{ id: string; title: string; type: string; tags: string[] }>;
  edges: Array<{ source: string; target: string }>;
}> {
  const entries = await getCollection('wiki');
  const validSlugs = new Set(entries.map((e) => extractSlug(e.id)));

  const nodes = entries.map((e) => ({
    id: extractSlug(e.id),
    title: e.data.title,
    type: e.data.type,
    tags: e.data.tags ?? [],
  }));

  const edges: Array<{ source: string; target: string }> = [];
  const edgeSet = new Set<string>();

  for (const entry of entries) {
    const slug = extractSlug(entry.id);
    const links = extractComponentLinks(entry.body);
    for (const target of links) {
      if (validSlugs.has(target) && target !== slug) {
        const key = `${slug}->${target}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: slug, target });
        }
      }
    }
  }

  return { nodes, edges };
}
