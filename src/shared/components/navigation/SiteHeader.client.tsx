import { RiMenuLine, RiCloseLine } from '@remixicon/react';
import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary } from '@/shared/i18n/types';
import LanguageSwitcher from './LanguageSwitcher.client';
import ThemeToggle from '@/shared/components/theme/ThemeToggle.client';
import MobileNavMenu from './MobileNavMenu.client';

interface SiteHeaderProps {
  currentPath: string;
  lang: Language;
  t: TranslationDictionary;
  localizedPaths?: Partial<Record<Language, string>>;
}

type NavItemKey = 'blog' | 'photography' | 'about';

export default function SiteHeader({ currentPath, lang, t, localizedPaths }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const getHref = (item: NavItemKey) => (lang === 'zh' ? `/zh/${item}` : `/${item}`);

  const isActive = (item: NavItemKey) => {
    const path = currentPath.toLowerCase();
    const itemPath = lang === 'zh' ? `/zh/${item}` : `/${item}`;
    return path === itemPath || path.startsWith(`${itemPath}/`);
  };

  const navItems = useMemo(
    () => [
      { key: 'blog' as const, label: t['nav.blog'] || 'nav.blog' },
      { key: 'photography' as const, label: t['nav.photography'] || 'nav.photography' },
      { key: 'about' as const, label: t['nav.about'] || 'nav.about' },
    ],
    [t],
  );

  const homeHref = lang === 'zh' ? '/zh' : '/';
  const mobileItems = [
    {
      key: 'home',
      label: t['nav.home'] || 'HOME',
      href: homeHref,
      active: currentPath === homeHref,
    },
    ...navItems.map((item) => ({
      ...item,
      href: getHref(item.key),
      active: isActive(item.key),
    })),
  ];

  return (
    <header className="relative z-40 w-full transition-all duration-300">
      <div className="absolute inset-0 bg-[oklch(98%_0.006_60)]/80 dark:bg-zinc-950/80 backdrop-blur-md" />

      <div className="relative px-[var(--page-gutter)] h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* 刊头字标：兼作首页链接，桌面端替代 HOME 导航项 */}
          <a
            href={homeHref}
            className={`font-mono text-[13px] font-semibold tracking-[0.18em] no-underline transition-colors focus-ring ${
              currentPath === '/' || currentPath === '/zh'
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100'
            }`}
          >
            KIERAN<span className="text-[var(--color-accent)]">·</span>ZHANG
          </a>

          <nav className="hidden sm:flex items-center gap-5 font-mono text-xs uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
            {navItems.map((item) => {
              const active = isActive(item.key);
              const href = getHref(item.key);

              return (
                <a
                  key={item.key}
                  href={href}
                  className={`block px-2 py-2 transition-colors relative group no-underline focus-ring ${
                    active
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-1 left-2 h-px transition-all ${
                      active
                        ? 'w-[calc(100%-16px)] bg-[var(--color-accent)]'
                        : 'w-0 group-hover:w-[calc(100%-16px)] bg-zinc-900 opacity-50 dark:bg-zinc-100'
                    }`}
                  />
                </a>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher
            currentLang={lang}
            currentPath={currentPath}
            localizedPaths={localizedPaths}
          />
          <ThemeToggle
            className="hidden sm:flex items-center justify-center min-w-11 min-h-11 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Toggle theme"
          />

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="sm:hidden flex items-center justify-center min-w-11 min-h-11 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileNavMenu
            key="mobile-nav"
            items={mobileItems}
            onItemClick={() => setMobileMenuOpen(false)}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
