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
  const formatDate = (date: Date) =>
    date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: lang === 'zh' ? '2-digit' : 'short',
      day: '2-digit',
    });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-24 sm:mb-32"
    >
      <div className="mb-10 max-w-3xl">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {translate('home.writing')}
          </h2>
          <a
            href={getBlogListUrl()}
            className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400"
          >
            <span>{translate('home.viewAll')}</span>
            <span>→</span>
          </a>
        </div>
        <p className="mt-4 max-w-4xl text-base font-light leading-8 text-[var(--color-text-primary)]">
          {translate('home.writing.description')}
        </p>
      </div>

      <div className="border-y border-zinc-200/80 dark:border-zinc-800">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={getBlogUrl(post.slug)}
            className="grid gap-3 border-b border-zinc-200/80 py-6 no-underline last:border-b-0 dark:border-zinc-800 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
          >
            <p className="pt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {formatDate(post.data.pubDate)}
            </p>
            <div>
              <h3 className="text-lg font-normal leading-6 text-zinc-900 dark:text-zinc-100">
                {post.data.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm font-light leading-7 text-[var(--color-text-primary)]">
                {post.data.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </motion.section>
  );
}
