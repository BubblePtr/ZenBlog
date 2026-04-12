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

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

interface HomeHeroSectionProps {
  t: TranslationDictionary;
  lang: Language;
}

const AVATAR_URL = 'https://cdn.ninthbit.org/avatar.jpg';

export default function HomeHeroSection({ t, lang }: HomeHeroSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;
  const photographyHref = lang === 'zh' ? '/zh/photography' : '/photography';
  const blogHref = lang === 'zh' ? '/zh/blog' : '/blog';
  const isZh = lang === 'zh';

  return (
    <motion.section
      className="py-14 sm:py-20 text-center"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {/* 头像 */}
      <motion.div
        variants={item}
        style={{ viewTransitionName: 'hero-avatar' }}
        className="mx-auto h-24 w-24 overflow-hidden rounded-full sm:h-32 sm:w-32"
      >
        <img
          src={AVATAR_URL}
          alt={translate('home.hero.name')}
          loading="eager"
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* 名字 */}
      <motion.h1
        variants={item}
        className={`mt-6 text-4xl font-normal leading-none tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl ${isZh ? 'font-article-title' : 'font-serif-en'}`}
      >
        {translate('home.hero.name')}
      </motion.h1>

      {/* Tagline */}
      <motion.p
        variants={item}
        className={`mt-3 text-zinc-400 dark:text-zinc-500 ${isZh ? 'text-sm font-light' : 'text-xs tracking-[0.14em] uppercase'}`}
      >
        {translate('home.hero.tagline')}
      </motion.p>

      {/* 介绍段落 */}
      <motion.p
        variants={item}
        className="mx-auto mt-6 max-w-lg text-[0.9375rem] leading-7 text-[var(--color-text-primary)]"
      >
        {translate('home.hero.intro')}
      </motion.p>

      {/* 链接行 */}
      <motion.nav
        variants={item}
        className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
        aria-label="Links"
      >
        <a
          href={blogHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-800 no-underline transition-colors hover:text-zinc-500 dark:text-zinc-200 dark:hover:text-zinc-400"
        >
          {translate('home.writing')}
          <RiArrowRightUpLine className="h-3.5 w-3.5 shrink-0" />
        </a>
        <a
          href={photographyHref}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 no-underline transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <RiSparklingLine className="h-3.5 w-3.5 shrink-0" />
          {translate('home.photography')}
        </a>
        <RssPopoverButton lang={lang} />
        <a
          href="https://github.com/BubblePtr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 no-underline transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
          aria-label="GitHub"
        >
          <RiGithubLine className="h-[18px] w-[18px]" />
        </a>
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 no-underline transition-colors hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100"
          aria-label="X"
        >
          <RiTwitterXLine className="h-[18px] w-[18px]" />
        </a>
      </motion.nav>
    </motion.section>
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
        if (!nextOpen) setOpen(false);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={openNow}
          onMouseLeave={closeLater}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 outline-none transition-colors hover:text-zinc-900 focus:outline-none dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <RiRssLine className="h-3.5 w-3.5 shrink-0" />
          <span className="font-ui leading-none">RSS</span>
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
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 w-[19rem] bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:bg-zinc-900"
        >
          <RssTooltipContent
            title={title}
            description={description}
            copyLabel={copyLabel}
            copiedLabel={copiedLabel}
          />
          <Popover.Arrow className="fill-white dark:fill-neutral-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function RssTooltipContent({
  title,
  description,
  copyLabel,
  copiedLabel,
}: {
  title: string;
  description: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('https://ninthbit.org/rss.xml');
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
        className="mt-3 inline-flex h-10 w-full items-center justify-center border-0 bg-zinc-900 px-3 font-ui text-sm font-semibold text-white outline-none transition-colors hover:bg-zinc-800 focus:outline-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
