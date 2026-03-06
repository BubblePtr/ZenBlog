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
  const isCrossLang = bubbleDiary.latestEntry.lang !== lang;
  const latestDate = new Date(bubbleDiary.latestEntry.pubDate);
  const formattedDate = latestDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: lang === 'zh' ? 'long' : 'short',
    day: 'numeric',
  });
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
      className={variant === 'home' ? 'mb-20 sm:mb-24' : 'mb-14 sm:mb-16'}
    >
      {variant === 'home' ? (
        <HomeSpotlight
          bubbleDiary={bubbleDiary}
          isCrossLang={isCrossLang}
          translate={translate}
        />
      ) : (
        <BlogSpotlight
          bubbleDiary={bubbleDiary}
          isCrossLang={isCrossLang}
          formattedDate={formattedDate}
          secondaryText={secondaryText}
          translate={translate}
        />
      )}
    </motion.section>
  );
}

interface SpotlightBodyProps {
  bubbleDiary: BubbleDiarySummary;
  isCrossLang: boolean;
  formattedDate: string;
  secondaryText: string;
  translate: (key: TranslationKey) => string;
}

interface HomeSpotlightProps {
  bubbleDiary: BubbleDiarySummary;
  isCrossLang: boolean;
  translate: (key: TranslationKey) => string;
}

function HomeSpotlight({
  bubbleDiary,
  isCrossLang,
  translate,
}: HomeSpotlightProps) {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[17px] font-normal tracking-tight text-zinc-900 dark:text-zinc-100">
            {translate('bubbleDiary.homeHeading')}
          </h2>
        </div>

        <p className="mt-4 max-w-4xl text-base font-light leading-8 text-[var(--color-text-primary)]">
          {translate('bubbleDiary.homeDescription')}
        </p>

        <div className="mt-6">
          <RainbowButton
            href={bubbleDiary.latestEntry.url}
            className="gap-2"
          >
            <span>{translate(isCrossLang ? 'bubbleDiary.cta.primaryAlt' : 'bubbleDiary.homeCta')}</span>
            <RiQuillPenAiLine className="h-[18px] w-[18px] opacity-80" />
          </RainbowButton>
        </div>
      </div>
    </div>
  );
}

function BlogSpotlight({
  bubbleDiary,
  isCrossLang,
  formattedDate,
  secondaryText,
  translate,
}: SpotlightBodyProps) {
  return (
    <div className="relative mx-auto max-w-4xl px-4 py-4 sm:px-5 sm:py-5">
      <ScaleFrame />

      <div className="relative bg-white px-4 py-4 dark:bg-black sm:px-6 sm:py-6">
        <div className="text-zinc-500 dark:text-zinc-400">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
            {translate('bubbleDiary.eyebrow')}
          </span>
        </div>

        <h2 className="mt-2 max-w-4xl font-heading text-[1.65rem] font-normal leading-[1.1] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-[2rem]">
          {translate('bubbleDiary.title')}
        </h2>

        <p className="mt-3 max-w-3xl text-base font-light leading-8 text-zinc-700 dark:text-zinc-300">
          {translate('bubbleDiary.description')}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{secondaryText}</span>
          <span className="hidden h-3 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />
          <span>{formattedDate}</span>
          <span className="hidden h-3 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />
          <span>{translate('bubbleDiary.stat.modeValue')}</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={bubbleDiary.latestEntry.url}
            className="text-sm font-medium text-zinc-900 no-underline underline-offset-4 transition-colors hover:text-zinc-600 hover:underline dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            {translate(isCrossLang ? 'bubbleDiary.cta.primaryAlt' : 'bubbleDiary.cta.primary')}
          </a>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            {bubbleDiary.latestEntry.title}
          </span>
        </div>

        {isCrossLang && (
          <p className="mt-5 text-xs leading-6 text-zinc-500 dark:text-zinc-400">
            {translate('bubbleDiary.crossLangNote')}
          </p>
        )}
      </div>
    </div>
  );
}

function ScaleFrame() {
  return (
    <>
      <div className="pointer-events-none absolute -left-9 -right-9 -top-4 h-7 sm:h-8">
        <div className="h-full w-full bg-[repeating-linear-gradient(135deg,rgba(161,161,170,0.16)_0_2px,transparent_2px_8px)] dark:bg-[repeating-linear-gradient(135deg,rgba(113,113,122,0.22)_0_2px,transparent_2px_8px)]" />
      </div>
      <div className="pointer-events-none absolute -left-9 -right-9 -bottom-4 h-7 sm:h-8">
        <div className="h-full w-full bg-[repeating-linear-gradient(135deg,rgba(161,161,170,0.16)_0_2px,transparent_2px_8px)] dark:bg-[repeating-linear-gradient(135deg,rgba(113,113,122,0.22)_0_2px,transparent_2px_8px)]" />
      </div>
      <div className="pointer-events-none absolute -bottom-9 -top-9 -left-4 w-7 sm:w-8">
        <div className="h-full w-full bg-[repeating-linear-gradient(135deg,rgba(161,161,170,0.16)_0_2px,transparent_2px_8px)] dark:bg-[repeating-linear-gradient(135deg,rgba(113,113,122,0.22)_0_2px,transparent_2px_8px)]" />
      </div>
      <div className="pointer-events-none absolute -bottom-9 -top-9 -right-4 w-7 sm:w-8">
        <div className="h-full w-full bg-[repeating-linear-gradient(135deg,rgba(161,161,170,0.16)_0_2px,transparent_2px_8px)] dark:bg-[repeating-linear-gradient(135deg,rgba(113,113,122,0.22)_0_2px,transparent_2px_8px)]" />
      </div>
    </>
  );
}
