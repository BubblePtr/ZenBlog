import { motion } from 'framer-motion';
import type { BlogListItem } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

interface HomeWritingSectionProps {
  posts: BlogListItem[];
  lang: Language;
  t: TranslationDictionary;
}

function blogVtName(slug: string): string {
  return `bt-${slug.replace(/[^a-zA-Z0-9]/g, '-')}`;
}

const ABSURD_ILLUSTRATIONS = [
  '/images/illustrations/absurd-01.png',
  '/images/illustrations/absurd-02.png',
  '/images/illustrations/absurd-03.png',
  '/images/illustrations/absurd-04.png',
  '/images/illustrations/absurd-05.png',
  '/images/illustrations/absurd-06.png',
  '/images/illustrations/absurd-07.png',
  '/images/illustrations/absurd-08.png',
  '/images/illustrations/absurd-09.png',
  '/images/illustrations/absurd-10.png',
  '/images/illustrations/absurd-11.png',
  '/images/illustrations/absurd-31.png',
  '/images/illustrations/absurd-32.png',
  '/images/illustrations/absurd-33.png',
  '/images/illustrations/absurd-34.png',
];

function slugHash(slug: string): number {
  return slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

// 为当前列表里的每篇文章分配插画：
// 1. 每篇文章按 slug hash 计算"首选"索引
// 2. 按首选索引升序处理（首选小的优先占坑），同首选则按 slug 字典序
// 3. 首选已被占时，顺移到下一张可用的
// 效果：同一篇文章基本稳定对应同一张图；列表变化时 hash 分布也变，自然换图
function assignIllustrations(posts: BlogListItem[]): string[] {
  const n = ABSURD_ILLUSTRATIONS.length;
  const preferred = posts.map((post) => slugHash(post.slug) % n);

  const order = posts
    .map((_, i) => i)
    .sort((a, b) =>
      preferred[a] !== preferred[b]
        ? preferred[a] - preferred[b]
        : posts[a].slug < posts[b].slug
          ? -1
          : 1,
    );

  const used = new Set<number>();
  const result: string[] = Array.from({ length: posts.length });

  for (const i of order) {
    let idx = preferred[i];
    while (used.has(idx)) idx = (idx + 1) % n;
    used.add(idx);
    result[i] = ABSURD_ILLUSTRATIONS[idx];
  }

  return result;
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
      {/* 区块标题 */}
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

      {/* 内容区：双列卡片网格 */}
      <div className="-mx-6 rail-line-t px-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 pt-8 sm:grid-cols-2 sm:gap-y-10">
          {assignIllustrations(posts).map((imageSrc, index) => {
            const post = posts[index];
            return (
              <a
                key={post.slug}
                href={getBlogUrl(post.slug)}
                className="group flex flex-col no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400/60 dark:focus-visible:outline-zinc-500/60"
              >
                {/* 上：插画区，固定高度居中展示 */}
                <div className="flex h-44 items-center justify-center overflow-hidden rounded-sm">
                  <img
                    src={imageSrc}
                    alt=""
                    loading="lazy"
                    className="h-full w-auto max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                {/* 下：文字区 */}
                <div className="min-w-0 flex-1 pt-4">
                  <div className="flex items-baseline gap-2">
                    <h3
                      className="text-base font-normal leading-snug text-zinc-900 dark:text-zinc-100"
                      style={{ viewTransitionName: blogVtName(post.slug) }}
                    >
                      {post.data.title}
                    </h3>
                    {/* 指向箭头：hover 时从左 4px 处滑入 */}
                    <span
                      className="-translate-x-1 shrink-0 text-sm text-zinc-400 opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 dark:text-zinc-500"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                  <time
                    dateTime={post.data.pubDate.toISOString()}
                    className="mt-1.5 block text-xs tabular-nums text-zinc-400 dark:text-zinc-500"
                  >
                    {formatDate(post.data.pubDate)}
                  </time>
                  {post.data.description && (
                    <p className="mt-2 text-sm font-light leading-6 text-[var(--color-text-secondary)]">
                      {post.data.description}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
