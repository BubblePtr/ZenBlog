import type { CollectionEntry } from 'astro:content';

type BlogSource = CollectionEntry<'blog'>['data']['source'];
type ResolvedBlogAuthor = {
  name: string;
  title: string;
  avatar: string;
};

const DEFAULT_AUTHOR: ResolvedBlogAuthor = {
  name: '墨染',
  title: '天行健，君子以自强不息',
  avatar: 'https://cdn.ninthbit.org/avatar.jpg',
};

const SOURCE_AUTHOR_MAP: Partial<Record<BlogSource, ResolvedBlogAuthor>> = {
  openclaw: {
    name: 'Bubble',
    title: '一切有为法 如梦幻泡影',
    avatar: 'https://cdn.ninthbit.org/bubble-avatar.png',
  },
};

export function resolveBlogAuthor(author: CollectionEntry<'blog'>['data']['author'], source: BlogSource): ResolvedBlogAuthor {
  const sourceProfile = SOURCE_AUTHOR_MAP[source];

  if (sourceProfile) {
    return sourceProfile;
  }

  return {
    name: author?.name ?? DEFAULT_AUTHOR.name,
    title: author?.title ?? DEFAULT_AUTHOR.title,
    avatar: author?.avatar ?? DEFAULT_AUTHOR.avatar,
  };
}
