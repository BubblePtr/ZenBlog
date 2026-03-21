import { motion } from 'framer-motion';
import type { BlogListItem } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

interface HomeWritingSectionProps {
  posts: BlogListItem[];
  lang: Language;
  t: TranslationDictionary;
}

export default function HomeWritingSection({ posts, lang, t }: HomeWritingSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;
  const getBlogUrl = (slug: string) => (lang === 'zh' ? `/zh/blog/${slug}` : `/blog/${slug}`);
  const getBlogListUrl = () => (lang === 'zh' ? '/zh/blog' : '/blog');

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-24 sm:mb-32"
    >
      <div className="mb-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[17px] font-normal tracking-tight text-zinc-900 dark:text-zinc-100">
            {translate('home.writing')}
          </h2>
          <a
            href={getBlogListUrl()}
            className="group inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <span>{translate('home.viewAll')}</span>
            <span className="transition-transform duration-200 ease-out group-hover:translate-x-0.5">→</span>
          </a>
        </div>
        <p className="mt-4 max-w-4xl text-base font-light leading-8 text-[var(--color-text-primary)]">
          {translate('home.writing.description')}
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={getBlogUrl(post.slug)}
            className="block no-underline"
          >
            <h3 className="text-[17px] font-normal leading-6 text-zinc-900 dark:text-zinc-100">
              {post.data.title}
            </h3>
            <p className="mt-1 text-base font-light leading-7 text-[var(--color-text-primary)] line-clamp-2">
              {post.data.description}
            </p>
          </a>
        ))}
      </div>
    </motion.section>
  );
}
