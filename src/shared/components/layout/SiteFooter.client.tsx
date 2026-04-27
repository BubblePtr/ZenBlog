import { useEffect } from 'react';
import { RiGithubFill, RiTwitterXFill, RiMailLine, RiRssLine } from '@remixicon/react';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary } from '@/shared/i18n/types';

// TODO: 考虑将导航数据提取到 src/shared/constants/navigation.ts
// 以便与 SiteHeader 共享，避免重复定义
const NAV_LINKS = [
  { href: '/', labelKey: 'nav.home' as const },
  { href: '/about', labelKey: 'nav.about' as const },
  { href: '/blog', labelKey: 'nav.blog' as const },
  { href: '/photography', labelKey: 'nav.photography' as const },
] as const;

const SOCIAL_LINKS = [
  { icon: RiGithubFill, href: 'https://github.com/BubblePtr', label: 'GitHub' },
  { icon: RiTwitterXFill, href: 'https://twitter.com/ninthbit_ai', label: 'Twitter' },
  { icon: RiMailLine, href: 'mailto:oldmeatovo@gmail.com', label: 'Email' },
  { icon: RiRssLine, href: '/rss.xml', label: 'RSS Feed' },
];

interface SiteFooterProps {
  lang: Language;
  t: TranslationDictionary;
}

export default function SiteFooter({ lang, t }: SiteFooterProps) {
  const brandName = 'Kieran Zhang';

  const getLocalizedPath = (path: string) => {
    return lang === 'zh' ? `/zh${path}` : path;
  };

  const formatFooterLabel = (label: string) => label.toUpperCase();

  useEffect(() => {
    console.log(
      `%c ${brandName} `,
      'background:#18181b;color:#f4f4f5;font-size:13px;font-weight:600;padding:3px 8px;border-radius:3px;',
    );
    console.log(
      '%c Curious enough to open DevTools? Built with Astro 5 + React 19.  kieranzhang.dev/about',
      'color:#71717a;font-size:11px;',
    );
  }, [brandName]);

  return (
    <footer className="bg-[oklch(98%_0.006_60)] dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left justify-between gap-12">
          {/* 左侧：品牌区 + 版权信息 */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{brandName}</h2>
            <div className="flex flex-col items-center gap-2 md:items-start">
              <p className="text-xs text-zinc-400">
                © {new Date().getFullYear()} {brandName} · All rights reserved
              </p>
              <p className="text-xs text-zinc-400">
                Illustrations from{' '}
                <a
                  href="https://absurd.design/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  absurd.design
                </a>{' '}
                by Diana Valeanu
              </p>
              <div className="flex items-center justify-center gap-1.5 md:justify-start">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-zinc-500 font-mono">All Systems Normal</span>
              </div>
            </div>
          </div>

          {/* 右侧：导航 + 社交 */}
          <div className="flex flex-col items-center gap-12 sm:flex-row sm:gap-40 md:items-start">
            {/* 导航区 */}
            <div className="text-center md:text-left">
              <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-3">
                {t['footer.navigate']}
              </h3>
              <nav className="flex flex-col items-center space-y-2 md:items-start">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={getLocalizedPath(link.href)}
                    className="inline-block text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:translate-x-0.5 transition-all duration-200"
                  >
                    {formatFooterLabel(t[link.labelKey])}
                  </a>
                ))}
              </nav>
            </div>

            {/* 社交区 */}
            <div className="text-center md:text-left">
              <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-3">
                {t['footer.connect']}
              </h3>
              <div className="flex flex-col items-center space-y-2 md:items-start">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors md:justify-start"
                    aria-label={link.label}
                  >
                    <link.icon size={20} />
                    <span>{formatFooterLabel(link.label)}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
