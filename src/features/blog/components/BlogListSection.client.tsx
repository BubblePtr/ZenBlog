import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RiArrowDownSLine, RiCheckLine } from '@remixicon/react';
import BubbleDiarySpotlight from '@/features/blog/components/BubbleDiarySpotlight.client';
import type { BlogListItem, BubbleDiarySummary } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

interface BlogListSectionProps {
  posts: BlogListItem[];
  bubbleDiary: BubbleDiarySummary | null;
  lang: Language;
  t: TranslationDictionary;
}

interface BlogGridRow {
  slug: string;
  title: string;
  authorName: string;
  publishedAt: Date;
  publishedLabel: string;
  year: string;
}

interface FilterOption {
  value: string;
  label: string;
}

export default function BlogListSection({ posts, bubbleDiary, lang, t }: BlogListSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');

  const rows = useMemo<BlogGridRow[]>(() => {
    return posts.map((post) => {
      const publishedAt = new Date(post.data.pubDate);

      return {
        slug: post.slug,
        title: post.data.title,
        authorName: post.data.authorName,
        publishedAt,
        publishedLabel: formatGridDate(publishedAt, lang),
        year: String(publishedAt.getFullYear()),
      };
    });
  }, [posts, lang]);

  const years = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.year))).sort((a, b) => Number(b) - Number(a));
  }, [rows]);

  const authors = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.authorName))).sort((a, b) =>
      a.localeCompare(b, lang === 'zh' ? 'zh-CN' : 'en-US'),
    );
  }, [rows, lang]);

  const yearOptions = useMemo<FilterOption[]>(() => {
    return [
      { value: 'all', label: t['blog.grid.filters.allYears'] || 'blog.grid.filters.allYears' },
      ...years.map((year) => ({ value: year, label: year })),
    ];
  }, [years, t]);

  const authorOptions = useMemo<FilterOption[]>(() => {
    return [
      { value: 'all', label: t['blog.grid.filters.allAuthors'] || 'blog.grid.filters.allAuthors' },
      ...authors.map((author) => ({ value: author, label: author })),
    ];
  }, [authors, t]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesYear = selectedYear === 'all' || row.year === selectedYear;
      const matchesAuthor = selectedAuthor === 'all' || row.authorName === selectedAuthor;
      return matchesYear && matchesAuthor;
    });
  }, [rows, selectedYear, selectedAuthor]);

  const getBlogUrl = (slug: string) => (lang === 'zh' ? `/zh/blog/${slug}` : `/blog/${slug}`);

  return (
    <div className="w-full">
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="mb-6 font-heading text-4xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          {translate('blog.title')}
        </h1>
        <p className="max-w-3xl font-light leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
          {translate('blog.description')}
        </p>
      </div>

      <BubbleDiarySpotlight bubbleDiary={bubbleDiary} lang={lang} t={t} variant="blog" />

      <section className="mt-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400 dark:text-zinc-500">
              {translate('blog.grid.filters.year')}
            </span>
            <FilterDropdown value={selectedYear} options={yearOptions} onChange={setSelectedYear} />
          </div>

          <div className="block">
            <span className="mb-2 block text-sm text-zinc-400 dark:text-zinc-500">
              {translate('blog.grid.filters.author')}
            </span>
            <FilterDropdown
              value={selectedAuthor}
              options={authorOptions}
              onChange={setSelectedAuthor}
            />
          </div>
        </div>

        <div className="mt-10">
          {filteredRows.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {translate('blog.grid.empty')}
            </div>
          ) : (
            filteredRows.map((row, index) => (
              <motion.article
                key={row.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                className="border-b border-zinc-200 dark:border-zinc-800"
              >
                <a
                  href={getBlogUrl(row.slug)}
                  className="group block py-5 no-underline transition-colors focus:outline-none"
                >
                  <div className="md:hidden">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-400 dark:text-zinc-500">
                      <span>{row.publishedLabel}</span>
                      <span>{row.authorName}</span>
                    </div>

                    <h2 className="mt-3 text-[1.05rem] font-normal tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                      {row.title}
                    </h2>
                  </div>

                  <div className="hidden grid-cols-[170px_minmax(0,1fr)_180px] items-center gap-6 md:grid">
                    <div className="text-[0.95rem] text-zinc-600 dark:text-zinc-300">
                      {row.publishedLabel}
                    </div>

                    <h2 className="min-w-0 text-[1.05rem] font-normal tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                      {row.title}
                    </h2>

                    <div className="text-right text-[0.95rem] text-zinc-500 dark:text-zinc-400">
                      {row.authorName}
                    </div>
                  </div>
                </a>
              </motion.article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function formatGridDate(date: Date, lang: Language) {
  if (lang === 'zh') {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function FilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between border border-zinc-200 bg-transparent pl-4 pr-4 text-left text-base text-zinc-700 transition-colors hover:border-zinc-300 focus:outline-none focus-visible:border-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-700 dark:focus-visible:border-zinc-100"
      >
        <span>{selectedOption?.label}</span>
        <RiArrowDownSLine
          className={`ml-6 h-5 w-5 shrink-0 text-zinc-400 transition-transform dark:text-zinc-500 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 border border-zinc-200 bg-white py-1 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-950"
          >
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                    active
                      ? 'text-zinc-950 dark:text-zinc-50'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <span>{option.label}</span>
                  {active && <RiCheckLine className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
