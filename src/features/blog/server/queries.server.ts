import { getCollection, type CollectionEntry } from 'astro:content';
import { resolveBlogAuthor } from '@/features/blog/authors';
import { buildSeriesIndexMap, type SeriesPosition } from '@/features/blog/series';
import type { Language } from '@/i18n/config';
import { withTrailingSlash } from '@/shared/urls';
import type { BlogListItem } from '@/types/content';

export type BlogEntry = CollectionEntry<'blog'>;

let cachedBlogEntries: BlogEntry[] | undefined;

interface BlogListOptions {
  homeOnly?: boolean;
  limit?: number;
}

export function extractBlogSlug(id: string, lang: Language): string {
  return id.replace(new RegExp(`^${lang}/`), '').replace(/\.[^/.]+$/, '');
}

function getEntryLang(post: BlogEntry): Language {
  return post.id.startsWith('zh/') ? 'zh' : 'en';
}

function buildBlogUrl(slug: string, lang: Language): string {
  return withTrailingSlash(lang === 'zh' ? `/zh/blog/${slug}` : `/blog/${slug}`);
}

async function getCachedBlogEntries(): Promise<BlogEntry[]> {
  cachedBlogEntries ??= await getCollection('blog');
  return cachedBlogEntries;
}

export async function getBlogLocalizedPaths(
  post: BlogEntry,
): Promise<Partial<Record<Language, string>>> {
  const lang = getEntryLang(post);
  const slug = extractBlogSlug(post.id, lang);
  const allPosts = await getCachedBlogEntries();
  const localizedPaths: Partial<Record<Language, string>> = {};

  for (const targetLang of ['en', 'zh'] as const) {
    const match = allPosts.find((candidate) => {
      if (!candidate.id.startsWith(`${targetLang}/`)) {
        return false;
      }

      const candidateSlug = extractBlogSlug(candidate.id, targetLang);
      return candidateSlug === slug;
    });

    if (match) {
      localizedPaths[targetLang] = buildBlogUrl(extractBlogSlug(match.id, targetLang), targetLang);
    }
  }

  return localizedPaths;
}

export function mapBlogListItem(
  post: BlogEntry,
  lang: Language,
  seriesPosition?: SeriesPosition,
): BlogListItem {
  const resolvedAuthor = resolveBlogAuthor(post.data.author, lang);

  return {
    slug: extractBlogSlug(post.id, lang),
    data: {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      heroImage: post.data.heroImage,
      author: post.data.author,
      authorName: resolvedAuthor.name,
      series: post.data.series,
      seriesNo: seriesPosition?.no,
      tags: post.data.tags,
      showOnHome: post.data.showOnHome === true,
    },
  };
}

export async function getBlogListByLang(
  lang: Language,
  options: BlogListOptions = {},
): Promise<BlogListItem[]> {
  const entries = (await getCollection('blog'))
    .filter((post) => post.id.startsWith(`${lang}/`))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const seriesIndex = buildSeriesIndexMap(
    entries.map((post) => ({
      id: post.id,
      series: post.data.series,
      pubDate: post.data.pubDate,
    })),
  );

  const allPosts = entries.map((post) => mapBlogListItem(post, lang, seriesIndex.get(post.id)));

  const filtered = options.homeOnly
    ? allPosts.filter((post) => post.data.showOnHome === true)
    : allPosts;

  if (typeof options.limit === 'number') {
    return filtered.slice(0, options.limit);
  }

  return filtered;
}

export async function getBlogStaticPathsByLang(lang: Language) {
  const posts = (await getCollection('blog')).filter((post) => post.id.startsWith(`${lang}/`));

  return posts.map((post) => ({
    params: { slug: extractBlogSlug(post.id, lang) },
    props: post,
  }));
}

export async function getSeriesPosition(post: BlogEntry): Promise<SeriesPosition | null> {
  if (!post.data.series) {
    return null;
  }

  const lang = getEntryLang(post);
  const siblings = (await getCollection('blog')).filter(
    (entry) => entry.id.startsWith(`${lang}/`) && entry.data.series === post.data.series,
  );

  const seriesIndex = buildSeriesIndexMap(
    siblings.map((entry) => ({
      id: entry.id,
      series: entry.data.series,
      pubDate: entry.data.pubDate,
    })),
  );

  return seriesIndex.get(post.id) ?? null;
}

export function getReadTime(content: string, lang: Language): number {
  const sanitized = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*?\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
    .replace(/[>#*_~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitized) {
    return 1;
  }

  if (lang === 'zh') {
    const charCount = sanitized.replace(/\s+/g, '').length;
    return Math.max(1, Math.ceil(charCount / 320));
  }

  const wordCount = sanitized.split(' ').length;
  return Math.max(1, Math.ceil(wordCount / 220));
}
