import type { CollectionEntry } from 'astro:content';
import type { Language } from '@/i18n/config';

type ResolvedBlogAuthor = {
  name: string;
  title: string;
  avatar: string;
};

const DEFAULT_AUTHOR: Record<Language, ResolvedBlogAuthor> = {
  zh: {
    name: 'Kieran Zhang',
    title: '天行健，君子以自强不息',
    avatar: 'https://cdn.ninthbit.org/avatar.jpg',
  },
  en: {
    name: 'Kieran Zhang',
    title: '天行健，君子以自强不息',
    avatar: 'https://cdn.ninthbit.org/avatar.jpg',
  },
};

export function resolveBlogAuthor(
  author: CollectionEntry<'blog'>['data']['author'],
  lang: Language,
): ResolvedBlogAuthor {
  const defaultAuthor = DEFAULT_AUTHOR[lang];

  return {
    name: author?.name ?? defaultAuthor.name,
    title: author?.title ?? defaultAuthor.title,
    avatar: author?.avatar ?? defaultAuthor.avatar,
  };
}
