import { useMemo } from 'react';
import { motion } from 'framer-motion';
import BubbleDiarySpotlight from '@/features/blog/components/BubbleDiarySpotlight.client';
import type { BlogListItem } from '@/types/content';
import type { BubbleDiarySummary } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

interface BlogListSectionProps {
  posts: BlogListItem[];
  bubbleDiary: BubbleDiarySummary | null;
  lang: Language;
  t: TranslationDictionary;
}

export default function BlogListSection({ posts, bubbleDiary, lang, t }: BlogListSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;

  const postsByYear = useMemo(() => {
    return posts.reduce((acc, post) => {
      const year = new Date(post.data.pubDate).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(post);
      return acc;
    }, {} as Record<number, BlogListItem[]>);
  }, [posts]);

  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));
  const getBlogUrl = (slug: string) => (lang === 'zh' ? `/zh/blog/${slug}` : `/blog/${slug}`);

  return (
    <div className="w-full">
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="font-heading text-4xl sm:text-5xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 mb-6">
          {translate('blog.title')}
        </h1>
        <p className="font-light text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {translate('blog.description')}
        </p>
      </div>

      <BubbleDiarySpotlight bubbleDiary={bubbleDiary} lang={lang} t={t} variant="blog" />

      <div className="space-y-24">
        {years.map((year, yearIndex) => (
          <section key={year} className="relative">
            <h2 className="font-mono text-sm font-bold text-zinc-400 mb-8">{year}</h2>

            <div className="space-y-8">
              {postsByYear[Number(year)].map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 + yearIndex * 0.1 }}
                  className="group relative pl-6 border-l border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors duration-300"
                >
                  <a href={getBlogUrl(post.slug)} className="block focus:outline-none no-underline">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                      <h3 className="font-heading text-xl text-zinc-900 dark:text-zinc-100 font-normal group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        {post.data.title}
                      </h3>
                      <span className="font-mono text-xs text-zinc-400 shrink-0">
                        {new Date(post.data.pubDate).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-prose font-light">
                      {post.data.description}
                    </p>
                  </a>
                </motion.article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
