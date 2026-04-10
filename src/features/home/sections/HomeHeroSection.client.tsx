import { motion } from 'framer-motion';
import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  RiArrowRightUpLine,
  RiGithubLine,
  RiSparklingLine,
  RiRssLine,
  RiTwitterXLine,
} from '@remixicon/react';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

interface HomeHeroSectionProps {
  t: TranslationDictionary;
  lang: Language;
}

const HERO_IMAGE_URL = '/images/home-hero.jpg';

export default function HomeHeroSection({ t, lang }: HomeHeroSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;
  const photographyHref = lang === 'zh' ? '/zh/photography' : '/photography';
  const blogHref = lang === 'zh' ? '/zh/blog' : '/blog';

  return (
    <section className="flex min-h-[calc(100svh-4rem-1px)] items-center py-8 sm:py-10">
      <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.82fr)] lg:items-center">
        <div className="max-w-3xl">
          <motion.h1
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="font-heading text-5xl leading-[0.95] tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl lg:text-[5.5rem]"
          >
            {translate('home.hero.name')}
          </motion.h1>
          <motion.p
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mt-4 max-w-xl text-lg text-zinc-900 dark:text-zinc-100"
          >
            {translate('home.hero.tagline')}
          </motion.p>
          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mt-6 max-w-2xl text-base font-light leading-8 text-[var(--color-text-primary)]"
          >
            {translate('home.hero.intro')}
          </motion.p>
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a
              href={blogHref}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-zinc-900 px-4 text-sm text-white no-underline transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <span>{translate('home.writing')}</span>
              <RiArrowRightUpLine className="h-4 w-4 shrink-0" />
            </a>
            <a
              href={photographyHref}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-300 px-4 text-sm text-zinc-700 no-underline transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
            >
              <RiSparklingLine className="h-4 w-4 shrink-0" />
              <span>{translate('home.photography')}</span>
            </a>
            <RssPopoverButton lang={lang} />
            <a
              href="https://github.com/BubblePtr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 no-underline transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
              aria-label="Open GitHub"
            >
              <RiGithubLine className="h-[18px] w-[18px] shrink-0" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 no-underline transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
              aria-label="Open X"
            >
              <RiTwitterXLine className="h-[18px] w-[18px] shrink-0" />
            </a>
          </motion.div>
        </div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="block"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={HERO_IMAGE_URL}
              alt={lang === 'zh' ? '抽象金属球体' : 'Abstract metallic sphere'}
              loading="eager"
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RssPopoverButton({ lang }: { lang: Language }) {
  const [open, setOpen] = React.useState(false);
  const closeTimerRef = React.useRef<number | null>(null);
  const copyLabel = lang === 'zh' ? '复制链接' : 'Copy feed URL';
  const copiedLabel = lang === 'zh' ? '已复制' : 'Copied';
  const title = lang === 'zh' ? '订阅 RSS' : 'Subscribe via RSS';
  const description =
    lang === 'zh'
      ? '复制链接到你喜欢的 RSS 阅读器，比如 Feedly、Inoreader 或 NetNewsWire。'
      : 'Copy the feed URL into your preferred RSS reader, such as Feedly, Inoreader, or NetNewsWire.';

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openNow = React.useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const closeLater = React.useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 220);
  }, [clearCloseTimer]);

  React.useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setOpen(false);
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          onMouseEnter={openNow}
          onMouseLeave={closeLater}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-300 px-4 text-sm text-zinc-700 outline-none transition-colors hover:border-zinc-900 hover:text-zinc-900 focus:outline-none focus-visible:outline-none dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
        >
          <span className="inline-flex items-center gap-1 leading-none">
            <RiRssLine className="h-4 w-4 shrink-0" />
            <span className="font-ui leading-none">RSS</span>
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={6}
          onMouseEnter={openNow}
          onMouseLeave={closeLater}
          onEscapeKeyDown={() => setOpen(false)}
          onPointerDownOutside={() => setOpen(false)}
          onFocusOutside={() => setOpen(false)}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="z-50 w-[19rem] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:bg-zinc-900"
        >
          <RssTooltipContent />
          <Popover.Arrow className="fill-white dark:fill-neutral-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );

  function RssTooltipContent() {
    const [copied, setCopied] = React.useState(false);
    const rssUrl = 'https://ninthbit.org/rss.xml';

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(rssUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } catch {
        setCopied(false);
      }
    };

    return (
      <div className="w-full">
        <h4 className="font-ui text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          {title}
        </h4>
        <p className="mt-2 font-ui text-[13px] leading-7 text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="mt-3 inline-flex h-10 w-full items-center justify-center border-0 bg-zinc-900 px-3 font-ui text-sm font-semibold text-white outline-none transition-colors hover:bg-zinc-800 focus:outline-none focus-visible:outline-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    );
  }
}
