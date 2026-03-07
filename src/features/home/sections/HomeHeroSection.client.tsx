import { motion } from 'framer-motion';
import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  RiGithubLine,
  RiRssLine,
  RiTwitterXLine,
} from '@remixicon/react';
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
}

export default function HomeHeroSection({ t }: HomeHeroSectionProps) {
  const translate = (key: TranslationKey) => t[key] || key;

  return (
    <section className="mb-24 sm:mb-32">
      <motion.h1
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-2xl sm:text-3xl font-normal tracking-tight text-zinc-900 dark:text-zinc-100"
      >
        {translate('home.hero.name')}
      </motion.h1>
      <motion.p
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mt-3 text-[17px] text-zinc-900 dark:text-zinc-100"
      >
        {translate('home.hero.tagline')}
      </motion.p>
      <motion.p
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mt-5 max-w-4xl text-base font-light leading-8 text-[var(--color-text-primary)]"
      >
        {translate('home.hero.intro')}
      </motion.p>
      <motion.div
        custom={3}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="mt-8 flex flex-wrap items-center gap-2.5"
      >
        <a
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 h-10 px-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 no-underline font-ui text-[11px] sm:text-[0.95rem] leading-none"
        >
          <span className="inline-flex items-center gap-1 leading-none">
            <RiTwitterXLine className="h-4 w-4 shrink-0" />
            <span className="block leading-none">Follow me on X</span>
          </span>
        </a>

        <RssPopoverButton />

        <a
          href="https://github.com/BubblePtr"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 no-underline"
          aria-label="Open GitHub"
        >
          <RiGithubLine className="h-[18px] w-[18px] shrink-0" />
        </a>
      </motion.div>
    </section>
  );
}

function RssPopoverButton() {
  const [open, setOpen] = React.useState(false);
  const closeTimerRef = React.useRef<number | null>(null);

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
          onMouseEnter={openNow}
          onMouseLeave={closeLater}
          className="inline-flex h-10 items-center gap-1 rounded-full bg-zinc-100 px-3.5 text-zinc-900 outline-none focus:outline-none focus-visible:outline-none dark:bg-zinc-800 dark:text-zinc-100"
        >
          <span className="inline-flex items-center gap-1 leading-none">
            <RiRssLine className="h-3.5 w-3.5 shrink-0" />
            <span className="font-ui text-[11px] sm:text-[0.95rem] leading-none">RSS</span>
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
}

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
      <h4 className="font-ui text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">订阅 RSS</h4>
      <p className="mt-2 font-ui text-[13px] leading-7 text-neutral-600 dark:text-neutral-400">
        复制下方链接到你喜欢的 RSS 阅读器（如 Feedly、Inoreader、NetNewsWire 等）即可订阅更新。
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-3 inline-flex h-10 w-full items-center justify-center border-0 bg-zinc-900 px-3 font-ui text-sm font-semibold text-white outline-none transition-colors hover:bg-zinc-800 focus:outline-none focus-visible:outline-none dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {copied ? '已复制' : '复制链接'}
      </button>
    </div>
  );
}
