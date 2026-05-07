import { getCollection, type CollectionEntry } from 'astro:content';
import { resolveBlogAuthor } from '@/features/blog/authors';
import type { Language } from '@/i18n/config';
import { withTrailingSlash } from '@/shared/urls';
import type { BlogListItem, BubbleDiarySummary } from '@/types/content';

export type BlogEntry = CollectionEntry<'blog'>;

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

export async function getBlogLocalizedPaths(
  post: BlogEntry,
): Promise<Partial<Record<Language, string>>> {
  const lang = getEntryLang(post);
  const slug = extractBlogSlug(post.id, lang);
  const allPosts = await getCollection('blog');
  const localizedPaths: Partial<Record<Language, string>> = {};

  for (const targetLang of ['en', 'zh'] as const) {
    const match = allPosts.find((candidate) => {
      if (!candidate.id.startsWith(`${targetLang}/`)) {
        return false;
      }

      const candidateSlug = extractBlogSlug(candidate.id, targetLang);
      return (
        candidateSlug === slug ||
        (post.data.externalId !== undefined && candidate.data.externalId === post.data.externalId)
      );
    });

    if (match) {
      localizedPaths[targetLang] = buildBlogUrl(extractBlogSlug(match.id, targetLang), targetLang);
    }
  }

  return localizedPaths;
}

export function mapBlogListItem(post: BlogEntry, lang: Language): BlogListItem {
  const resolvedAuthor = resolveBlogAuthor(post.data.author, post.data.source, lang);

  return {
    slug: extractBlogSlug(post.id, lang),
    data: {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      heroImage: post.data.heroImage,
      author: post.data.author,
      authorName: resolvedAuthor.name,
      source: post.data.source,
      series: post.data.series,
      tags: post.data.tags,
      showOnHome: post.data.showOnHome === true,
    },
  };
}

export async function getBlogListByLang(
  lang: Language,
  options: BlogListOptions = {},
): Promise<BlogListItem[]> {
  const allPosts = (await getCollection('blog'))
    .filter((post) => post.id.startsWith(`${lang}/`))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((post) => mapBlogListItem(post, lang));

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

export async function getBubbleDiarySummary(): Promise<BubbleDiarySummary | null> {
  const bubblePosts = (await getCollection('blog'))
    .filter((post) => post.data.source === 'openclaw')
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  if (bubblePosts.length === 0) {
    return null;
  }

  const latestEntry = bubblePosts[0];
  const latestEntryLang = getEntryLang(latestEntry);
  const totalUniqueEntries = new Set(bubblePosts.map((post) => post.data.externalId ?? post.id));
  const uniqueEntries = new Set<string>();
  const recentEntries: BubbleDiarySummary['recentEntries'] = [];

  for (const post of bubblePosts) {
    const uniqueKey = post.data.externalId ?? post.id;

    if (uniqueEntries.has(uniqueKey)) {
      continue;
    }

    uniqueEntries.add(uniqueKey);

    const entryLang = getEntryLang(post);
    recentEntries.push({
      title: post.data.title,
      pubDate: post.data.pubDate,
      lang: entryLang,
      url: buildBlogUrl(extractBlogSlug(post.id, entryLang), entryLang),
    });

    if (recentEntries.length === 5) {
      break;
    }
  }

  return {
    totalEntries: totalUniqueEntries.size,
    recentEntries,
    latestEntry: {
      title: latestEntry.data.title,
      description: latestEntry.data.description,
      pubDate: latestEntry.data.pubDate,
      lang: latestEntryLang,
      url: buildBlogUrl(extractBlogSlug(latestEntry.id, latestEntryLang), latestEntryLang),
    },
  };
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
