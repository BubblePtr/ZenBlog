import type { CollectionEntry } from 'astro:content';
import type { Language } from '@/i18n/config';

type BlogSource = CollectionEntry<'blog'>['data']['source'];
type ResolvedBlogAuthor = {
  name: string;
  title: string;
  avatar: string;
};

const DEFAULT_AUTHOR: Record<Language, ResolvedBlogAuthor> = {
  zh: {
    name: '墨染',
    title: '天行健，君子以自强不息',
    avatar: 'https://cdn.ninthbit.org/avatar.jpg',
  },
  en: {
    name: 'MoRan',
    title: '天行健，君子以自强不息',
    avatar: 'https://cdn.ninthbit.org/avatar.jpg',
  },
};

const SOURCE_AUTHOR_MAP: Partial<Record<BlogSource, Record<Language, ResolvedBlogAuthor>>> = {
  openclaw: {
    zh: {
      name: '泡泡',
      title: '一切有为法 如梦幻泡影',
      avatar: 'https://cdn.ninthbit.org/bubble-avatar.png',
    },
    en: {
      name: 'Bubble',
      title: '一切有为法 如梦幻泡影',
      avatar: 'https://cdn.ninthbit.org/bubble-avatar.png',
    },
  },
};

export function resolveBlogAuthor(
  author: CollectionEntry<'blog'>['data']['author'],
  source: BlogSource,
  lang: Language,
): ResolvedBlogAuthor {
  const sourceProfile = SOURCE_AUTHOR_MAP[source]?.[lang];

  if (sourceProfile) {
    return sourceProfile;
  }

  const defaultAuthor = DEFAULT_AUTHOR[lang];

  return {
    name: author?.name ?? defaultAuthor.name,
    title: author?.title ?? defaultAuthor.title,
    avatar: author?.avatar ?? defaultAuthor.avatar,
  };
}
