import type { Language } from '@/i18n/config';

export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  note: string;
  href?: string;
}

export interface AboutContent {
  reading: ReadingItem[];
}

const en: AboutContent = {
  reading: [
    {
      id: 'wittgenstein-tractatus',
      title: 'Tractatus Logico-Philosophicus',
      author: 'Ludwig Wittgenstein',
      note: 'Where the line falls between what can be said and what cannot.',
    },
    {
      id: 'jorgenson-book-of-elon',
      title: 'The Book of Elon: A Guide to Purpose and Success',
      author: 'Eric Jorgenson',
      note: "Musk's mental models in his own words — reasoning from first principles, not another biography.",
    },
  ],
};

const zh: AboutContent = {
  reading: [
    {
      id: 'wittgenstein-tractatus',
      title: '《逻辑哲学论》',
      author: '维特根斯坦',
      note: '语言能说什么、不能说什么的边界在哪里。',
    },
    {
      id: 'jorgenson-book-of-elon',
      title: '《马斯克原理》',
      author: '埃里克·乔根森',
      note: '用马斯克自己的话拼出他的思维方式：像物理学家一样从第一性原理出发，而不是又一本传记。',
    },
  ],
};

const content: Record<Language, AboutContent> = { en, zh };

export function getAboutContent(lang: Language): AboutContent {
  return content[lang];
}
