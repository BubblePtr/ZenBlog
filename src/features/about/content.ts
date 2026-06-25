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

export interface SocialLink {
  id: 'github' | 'twitter' | 'email' | 'rss';
  href: string;
  labelKey:
    | 'about.identity.contact.github'
    | 'blog.post.followCta.twitter'
    | 'about.identity.contact.email'
    | 'about.identity.contact.rss';
  external: boolean;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'github',
    href: 'https://github.com/BubblePtr',
    labelKey: 'about.identity.contact.github',
    external: true,
  },
  {
    id: 'twitter',
    href: 'https://twitter.com/ninthbit_ai',
    labelKey: 'blog.post.followCta.twitter',
    external: true,
  },
  {
    id: 'email',
    href: 'mailto:oldmeatovo@gmail.com',
    labelKey: 'about.identity.contact.email',
    external: false,
  },
  {
    id: 'rss',
    href: '/rss.xml',
    labelKey: 'about.identity.contact.rss',
    external: false,
  },
];

export function getAboutSocialLinks(): SocialLink[] {
  return SOCIAL_LINKS;
}

/** Profile card copy — English UI except `bio`, shared across locales. */
export const PROFILE_CARD = {
  banner: 'Design + Code',
  handle: '@ninthbit_ai',
  bio: 'AI Native · Indie Developer. 💻Collaborated with Douyin, Feishu, BiliBili and Meituan. 🐱梦想是养一只三花。📚道理全在书上，做人却在书外。',
  location: 'Nanjing, China',
  followingLabel: 'Following',
  followersLabel: 'Followers',
  /** Update manually when X counts change. */
  following: 574,
  followers: 917,
  followLabel: 'Follow',
  website: 'kieran.build',
  websiteHref: 'https://kieran.build',
  twitterHref: 'https://twitter.com/ninthbit_ai',
} as const;

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
