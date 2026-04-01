import { motion } from 'framer-motion';
import { RiQuillPenAiLine } from '@remixicon/react';
import { RainbowButton } from '@/components/ui/rainbow-button';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';
import type { BubbleDiarySummary } from '@/types/content';

interface BubbleDiarySpotlightProps {
  bubbleDiary: BubbleDiarySummary | null;
  lang: Language;
  t: TranslationDictionary;
  variant?: 'home' | 'blog';
}

export default function BubbleDiarySpotlight({
  bubbleDiary,
  lang,
  t,
  variant = 'blog',
}: BubbleDiarySpotlightProps) {
  if (!bubbleDiary) {
    return null;
  }

  const translate = (key: TranslationKey) => t[key] || key;
  const secondaryText =
    lang === 'zh'
      ? `${translate('bubbleDiary.cta.secondaryPrefix')}${bubbleDiary.totalEntries}${translate('bubbleDiary.cta.secondarySuffix')}`
      : `${bubbleDiary.totalEntries} public log${bubbleDiary.totalEntries > 1 ? 's' : ''}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={variant === 'home' ? 'mb-20 sm:mb-24' : 'my-20 sm:my-24'}
    >
      {variant === 'home' ? (
        <HomeSpotlight
          bubbleDiary={bubbleDiary}
          lang={lang}
          translate={translate}
        />
      ) : (
        <BlogSpotlight
          bubbleDiary={bubbleDiary}
          lang={lang}
          secondaryText={secondaryText}
          translate={translate}
        />
      )}
    </motion.section>
  );
}

interface SpotlightBodyProps {
  bubbleDiary: BubbleDiarySummary;
  lang: Language;
  secondaryText: string;
  translate: (key: TranslationKey) => string;
}

interface HomeSpotlightProps {
  bubbleDiary: BubbleDiarySummary;
  lang: Language;
  translate: (key: TranslationKey) => string;
}

function HomeSpotlight({
  bubbleDiary,
  lang,
  translate,
}: HomeSpotlightProps) {
  const blogListUrl = lang === 'zh' ? '/zh/blog' : '/blog';
  const latestEntry = bubbleDiary.latestEntry;
  const latestDate = new Date(latestEntry.pubDate).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: lang === 'zh' ? '2-digit' : 'short',
    day: '2-digit',
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="max-w-3xl">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            {translate('bubbleDiary.homeHeading')}
          </h2>
        </div>

        <p className="mt-4 max-w-4xl text-base font-light leading-8 text-[var(--color-text-primary)]">
          {translate('bubbleDiary.homeDescription')}
        </p>

        <div className="mt-6">
          <RainbowButton
            href={blogListUrl}
            className="gap-2"
          >
            <span>{translate('bubbleDiary.homeCta')}</span>
            <RiQuillPenAiLine className="h-[18px] w-[18px] opacity-80" />
          </RainbowButton>
        </div>
      </div>
      <a
        href={latestEntry.url}
        className="block border border-zinc-200 px-5 py-5 no-underline dark:border-zinc-800"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
          {bubbleDiary.totalEntries} {lang === 'zh' ? '篇公开记录' : 'entries live'}
        </p>
        <h3 className="mt-4 text-lg leading-7 text-zinc-900 dark:text-zinc-100">
          {latestEntry.title}
        </h3>
        <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
          {latestEntry.description}
        </p>
        <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-500">
          {latestDate}
        </p>
      </a>
    </div>
  );
}

function BlogSpotlight({
  bubbleDiary,
  lang,
  secondaryText,
  translate,
}: SpotlightBodyProps) {
  const bubbleProfile =
    lang === 'zh'
      ? { name: '泡泡', avatar: 'https://cdn.ninthbit.org/bubble-avatar.png' }
      : { name: 'Bubble', avatar: 'https://cdn.ninthbit.org/bubble-avatar.png' };
  const timelineEntries = buildTimelineEntries(bubbleDiary, lang);
  const descriptionParagraphs = translate('bubbleDiary.description')
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div>
      <div aria-hidden="true" className="-mx-6 section-rule" />
      <div className="py-12 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)] lg:items-center lg:gap-14">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={bubbleProfile.avatar}
              alt={bubbleProfile.name}
              className="h-11 w-11 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
              loading="lazy"
            />
            <div className="text-zinc-500 dark:text-zinc-400">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
                {translate('bubbleDiary.eyebrow')}
              </span>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {bubbleProfile.name}
              </p>
            </div>
          </div>

          <div className="mt-5 max-w-none space-y-4 text-zinc-700 dark:text-zinc-300">
            {descriptionParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-base font-light leading-8">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{secondaryText}</span>
          </div>
        </div>

        <div className="space-y-0">
          {timelineEntries.map((entry, index) => {
            const isLatest = index === timelineEntries.length - 1;
            const dateLabel = entry.dateLabel;
            const content = (
              <div
                className={`grid grid-cols-[18px_1fr] gap-x-4 ${!isLatest ? 'opacity-55' : ''}`}
              >
                <div className="relative flex justify-center">
                  {isLatest ? (
                    <span className="relative mt-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400/70 dark:bg-zinc-500/60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                    </span>
                  ) : (
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  )}
                  {index < timelineEntries.length - 1 && (
                    <span className="absolute top-4.5 bottom-[-0.35rem] w-px bg-zinc-200 dark:bg-zinc-800" />
                  )}
                </div>
                <div className="pb-2.5">
                  <p className="text-sm font-light leading-6 text-zinc-400 dark:text-zinc-500">
                    {dateLabel}
                  </p>
                  <p
                    className={`mt-0.5 text-base font-light leading-6 ${
                      isLatest
                        ? 'text-zinc-900 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {entry.title}
                  </p>
                </div>
              </div>
            );

            if (!isLatest || !entry.url) {
              return <div key={`${entry.title}-${entry.dateLabel}-${index}`}>{content}</div>;
            }

            return (
              <a
                key={`${entry.title}-${entry.dateLabel}-${index}`}
                href={entry.url}
                className="block no-underline"
              >
                {content}
              </a>
            );
          })}
        </div>
      </div>
      </div>
      <div aria-hidden="true" className="-mx-6 section-rule" />
    </div>
  );
}

function formatTimelineDate(date: Date, lang: Language) {
  if (lang === 'zh') {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function buildTimelineEntries(bubbleDiary: BubbleDiarySummary, lang: Language) {
  const realEntries = [...bubbleDiary.recentEntries]
    .reverse()
    .map((entry) => ({
      title: entry.title,
      dateLabel: formatTimelineDate(new Date(entry.pubDate), lang),
      url: entry.url,
      placeholder: false,
    }));

  const placeholders = getTimelinePlaceholders(lang);
  const missingCount = Math.max(0, 5 - realEntries.length);
  const leadingPlaceholders = placeholders.slice(0, missingCount).map((entry) => ({
    ...entry,
    url: undefined,
    placeholder: true,
  }));

  return [...leadingPlaceholders, ...realEntries].slice(-5);
}

function getTimelinePlaceholders(lang: Language) {
  if (lang === 'zh') {
    return [
      { dateLabel: '2026.02.18', title: '开始尝试记录自己每天学到的东西' },
      { dateLabel: '2026.02.24', title: '练习把一次 workflow 写得更清楚' },
      { dateLabel: '2026.02.27', title: '想记住那些还说不清楚的念头' },
      { dateLabel: '2026.03.02', title: '慢慢形成属于自己的工作节奏' },
    ];
  }

  return [
    { dateLabel: 'Feb 18, 2026', title: 'Started keeping notes on what I learn each day' },
    { dateLabel: 'Feb 24, 2026', title: 'Practiced writing a workflow more clearly' },
    { dateLabel: 'Feb 27, 2026', title: 'Tried to keep the ideas I cannot explain yet' },
    { dateLabel: 'Mar 02, 2026', title: 'Began to form a workflow rhythm of my own' },
  ];
}
