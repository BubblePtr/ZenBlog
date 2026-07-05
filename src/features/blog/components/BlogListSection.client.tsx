import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RiArrowDownSLine, RiCheckLine, RiQuillPenLine } from '@remixicon/react';
import type { BlogListItem } from '@/types/content';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';
import { isIndieDevWeeklyPost } from '@/features/blog/series';
import { withTrailingSlash } from '@/shared/urls';

interface BlogListSectionProps {
  posts: BlogListItem[];
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
  isIndieDevWeekly: boolean;
  description?: string;
  /* Issue-style folio number: oldest post is 001, stable across filtering. */
  folio: string;
}

interface FilterOption {
  value: string;
  label: string;
}

export default function BlogListSection({ posts, lang, t }: BlogListSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');

  const rows = useMemo<BlogGridRow[]>(() => {
    return posts.map((post, index) => {
      const publishedAt = new Date(post.data.pubDate);

      return {
        slug: post.slug,
        title: post.data.title,
        authorName: post.data.authorName,
        publishedAt,
        publishedLabel: formatGridDate(publishedAt, lang),
        year: String(publishedAt.getFullYear()),
        isIndieDevWeekly: isIndieDevWeeklyPost(post.data.tags),
        description: post.data.description,
        folio: String(posts.length - index).padStart(3, '0'),
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

  const getBlogUrl = (slug: string) =>
    withTrailingSlash(lang === 'zh' ? `/zh/blog/${slug}` : `/blog/${slug}`);

  return (
    <div className="w-full">
      <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="kicker mb-5">Index / Writing</p>
        <h1
          className={`mb-6 text-4xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl ${lang === 'zh' ? 'font-article-title' : 'font-serif-en'}`}
        >
          {translate('blog.title')}
        </h1>
        <p className="max-w-3xl font-light leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-lg">
          {translate('blog.description')}
        </p>
      </div>

      <section className="mt-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="block">
            <label
              htmlFor="year-filter"
              className="mb-2 block text-sm text-zinc-500 dark:text-zinc-400"
            >
              {translate('blog.grid.filters.year')}
            </label>
            <FilterDropdown
              id="year-filter"
              value={selectedYear}
              options={yearOptions}
              onChange={setSelectedYear}
            />
          </div>

          <div className="block">
            <label
              htmlFor="author-filter"
              className="mb-2 block text-sm text-zinc-500 dark:text-zinc-400"
            >
              {translate('blog.grid.filters.author')}
            </label>
            <FilterDropdown
              id="author-filter"
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
            <>
              {/* Cover Story：当前筛选下最新一篇作为头条 */}
              <motion.article
                key={`cover-${filteredRows[0].slug}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mb-4"
              >
                <a
                  href={getBlogUrl(filteredRows[0].slug)}
                  className="group block py-6 no-underline focus:outline-none"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <p className="kicker">Cover Story / {filteredRows[0].folio}</p>
                    <p className="font-mono text-xs tabular-nums tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
                      {filteredRows[0].publishedLabel}
                    </p>
                  </div>

                  <h2
                    className={`mt-5 max-w-3xl text-3xl leading-[1.15] tracking-tight text-zinc-900 transition-colors group-hover:text-[var(--color-accent)] dark:text-zinc-100 sm:text-[2.6rem] ${lang === 'zh' ? 'font-article-title' : 'font-serif-en'}`}
                  >
                    {filteredRows[0].title}
                  </h2>

                  {filteredRows[0].description && (
                    <p className="mt-4 max-w-2xl text-base font-light leading-7 text-zinc-500 dark:text-zinc-400">
                      {filteredRows[0].description}
                    </p>
                  )}

                  <p className="mt-5 font-mono text-xs tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
                    {filteredRows[0].authorName}
                    <span
                      aria-hidden="true"
                      className="ml-3 inline-block text-[var(--color-accent)] opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      →
                    </span>
                  </p>
                </a>
                <div aria-hidden="true" className="section-rule" />
              </motion.article>

              {filteredRows.slice(1).map((row, index) => (
                <motion.article
                  key={row.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.04, 0.32), duration: 0.35 }}
                  className="border-b border-zinc-200 dark:border-zinc-800"
                >
                  <a
                    href={getBlogUrl(row.slug)}
                    className="group block py-5 no-underline transition-colors focus:outline-none"
                  >
                    <div className="md:hidden">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tabular-nums tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
                        <span className="transition-colors group-hover:text-[var(--color-accent)]">
                          {row.folio}
                        </span>
                        <span>{row.publishedLabel}</span>
                        <span>{row.authorName}</span>
                      </div>

                      <h2 className="mt-3 text-[1.05rem] font-normal tracking-tight text-zinc-900 transition-colors group-hover:text-[var(--color-accent)] dark:text-zinc-100">
                        {row.isIndieDevWeekly && (
                          <RiQuillPenLine
                            aria-hidden="true"
                            className="mr-2 inline-block h-[1em] w-[1em] -translate-y-px align-[-0.1em] text-zinc-400 dark:text-zinc-600"
                          />
                        )}
                        {row.title}
                      </h2>
                    </div>

                    <div className="hidden grid-cols-[3.5rem_150px_minmax(0,1fr)_180px] items-baseline gap-6 md:grid">
                      <div className="font-mono text-xs tabular-nums tracking-[0.08em] text-zinc-400 transition-colors group-hover:text-[var(--color-accent)] dark:text-zinc-500">
                        {row.folio}
                      </div>

                      <div className="font-mono text-xs tabular-nums tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
                        {row.publishedLabel}
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-[1.05rem] font-normal tracking-tight text-zinc-900 transition-colors group-hover:text-[var(--color-accent)] dark:text-zinc-100">
                          {row.isIndieDevWeekly && (
                            <RiQuillPenLine
                              aria-hidden="true"
                              className="mr-2 inline-block h-[1em] w-[1em] -translate-y-px align-[-0.1em] text-zinc-400 dark:text-zinc-600"
                            />
                          )}
                          {row.title}
                        </h2>
                      </div>

                      <div className="text-right font-mono text-xs tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
                        {row.authorName}
                      </div>
                    </div>
                  </a>
                </motion.article>
              ))}
            </>
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
  id,
  value,
  options,
  onChange,
}: {
  id?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      // 打开下拉菜单
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    // 下拉菜单已打开时的键盘导航
    const currentIndex = options.findIndex((opt) => opt.value === value);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < options.length - 1) {
          onChange(options[currentIndex + 1].value);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          onChange(options[currentIndex - 1].value);
        }
        break;
      case 'Home':
        event.preventDefault();
        onChange(options[0].value);
        break;
      case 'End':
        event.preventDefault();
        onChange(options[options.length - 1].value);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        setOpen(false);
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
    }
  };

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
        id={id}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Filter: ${selectedOption?.label}`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
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
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 border border-zinc-200 bg-white py-1 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:border-zinc-800 dark:bg-zinc-950"
          >
            {options.map((option) => {
              const active = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
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
