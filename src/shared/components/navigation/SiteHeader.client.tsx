import { RiMenuLine, RiCloseLine } from '@remixicon/react';
import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { Language } from '@/i18n/config';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';
import LanguageSwitcher from './LanguageSwitcher.client';
import ThemeToggle from '@/shared/components/theme/ThemeToggle.client';
import MobileNavMenu from './MobileNavMenu.client';

interface SiteHeaderProps {
  currentPath: string;
  lang: Language;
  t: TranslationDictionary;
}

type NavItemKey = 'blog' | 'photography' | 'about';

export default function SiteHeader({ currentPath, lang, t }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const translate = (key: TranslationKey) => t[key] || key;
  const getHref = (item: NavItemKey) => (lang === 'zh' ? `/zh/${item}` : `/${item}`);

  const isActive = (item: NavItemKey) => {
    const path = currentPath.toLowerCase();
    const itemPath = lang === 'zh' ? `/zh/${item}` : `/${item}`;
    return path === itemPath || path.startsWith(`${itemPath}/`);
  };

  const navItems = useMemo(
    () => [
      { key: 'blog' as const, label: translate('nav.blog') },
      { key: 'photography' as const, label: translate('nav.photography') },
      { key: 'about' as const, label: translate('nav.about') },
    ],
    [t],
  );

  const mobileItems = navItems.map((item) => ({
    ...item,
    href: getHref(item.key),
    active: isActive(item.key),
  }));

  return (
    <header className="relative z-40 w-full transition-all duration-300">
      <div className="absolute inset-0 bg-[oklch(98%_0.006_60)]/80 dark:bg-zinc-950/80 backdrop-blur-md" />

      <div className="relative max-w-[84rem] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a
            href={lang === 'zh' ? '/zh' : '/'}
            className="font-heading font-normal text-xl tracking-tight flex items-center gap-2 no-underline text-zinc-900 dark:text-zinc-100 leading-none"
          >
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            NinthBit
          </a>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-normal text-zinc-500 dark:text-zinc-400">
            {navItems.map((item) => {
              const active = isActive(item.key);
              const href = getHref(item.key);

              return (
                <a
                  key={item.key}
                  href={href}
                  className={`block px-2 py-2 transition-colors relative group no-underline ${
                    active
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-1 left-2 h-px bg-zinc-900 dark:bg-zinc-100 transition-all ${
                      active
                        ? 'w-[calc(100%-16px)]'
                        : 'w-0 group-hover:w-[calc(100%-16px)] opacity-50'
                    }`}
                  />
                </a>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLang={lang} currentPath={currentPath} />
          <ThemeToggle
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Toggle theme"
          />

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
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
          />
        )}
      </AnimatePresence>
    </header>
  );
}
