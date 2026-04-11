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
  const isZh = lang === 'zh';

  const formatDate = (date: Date) =>
    date.toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: isZh ? '2-digit' : 'short',
      day: '2-digit',
    });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-24 sm:mb-32"
    >
      {/* 区块标题：标题+View All 全宽，描述限宽 */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between">
          <h2
            className={`text-2xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl ${isZh ? 'font-article-title' : 'font-serif-en'}`}
          >
            {translate('home.writing')}
          </h2>
          <a
            href={getBlogListUrl()}
            className="inline-flex items-center gap-1 text-sm text-zinc-500 no-underline dark:text-zinc-400"
          >
            <span>{translate('home.viewAll')}</span>
            <span>→</span>
          </a>
        </div>
        <p className="mt-4 max-w-3xl text-base font-light leading-8 text-[var(--color-text-primary)]">
          {translate('home.writing.description')}
        </p>
      </div>

      {/* 内容区：rail 分割线 + 条目间细线 */}
      <div className="-mx-6 rail-line-t">
        <div className="divide-y divide-zinc-100 px-6 dark:divide-zinc-800/60">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={getBlogUrl(post.slug)}
              className="group -mx-6 block px-6 py-8 no-underline transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 sm:py-9"
            >
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="text-base font-normal leading-snug text-zinc-900 transition-colors group-hover:text-zinc-500 dark:text-zinc-100 dark:group-hover:text-zinc-400">
                  {post.data.title}
                </h3>
                <time
                  dateTime={post.data.pubDate.toISOString()}
                  className="shrink-0 text-xs tabular-nums text-zinc-400 dark:text-zinc-500"
                >
                  {formatDate(post.data.pubDate)}
                </time>
              </div>
              {post.data.description && (
                <p className="mt-2 max-w-xl text-sm font-light leading-6 text-[var(--color-text-secondary)]">
                  {post.data.description}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
