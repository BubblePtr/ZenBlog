import { RiMenuLine, RiCloseLine } from '@remixicon/react';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
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

type NavItemKey = 'home' | 'blog' | 'photography' | 'about';

/** Home (en + zh). Path is trailing-slash normalized by PageShell. */
function isHomePath(path: string): boolean {
  return path === '/' || path === '/zh' || path === '/zh/';
}

/** Scroll distance (px) over which home frost eases from 0 → full (matches blog). */
const HOME_FROST_RANGE_PX = 160;
/** Peak fill opacity — same as non-home `bg-…/80`. */
const HOME_FROST_MAX_OPACITY = 0.8;
/** Peak blur (px) — same as Tailwind `backdrop-blur-md`. */
const HOME_FROST_MAX_BLUR_PX = 12;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Ease-out so early scroll stays soft; full frost arrives near end of range. */
function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}

function homeFrostFromScroll(scrollY: number) {
  return easeOutQuad(clamp01(scrollY / HOME_FROST_RANGE_PX));
}

export default function SiteHeader({ currentPath, lang, t, localizedPaths }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = isHomePath(currentPath);
  // 0 = continuous paper; 1 = same frosted bar as blog. Driven by scroll on home only.
  const [homeFrost, setHomeFrost] = useState(0);

  useEffect(() => {
    if (!isHome) {
      setHomeFrost(0);
      return;
    }

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = homeFrostFromScroll(window.scrollY);
        setHomeFrost((prev) => (Math.abs(prev - next) < 0.008 ? prev : next));
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
    };
  }, [isHome]);

  const homeHref = lang === 'zh' ? '/zh' : '/';

  const getHref = (item: NavItemKey) => {
    if (item === 'home') return homeHref;
    return lang === 'zh' ? `/zh/${item}` : `/${item}`;
  };

  const isActive = (item: NavItemKey) => {
    if (item === 'home') return isHome;
    const path = currentPath.toLowerCase();
    const itemPath = lang === 'zh' ? `/zh/${item}` : `/${item}`;
    return path === itemPath || path.startsWith(`${itemPath}/`);
  };

  const navItems = useMemo(
    () => [
      { key: 'home' as const, label: t['nav.home'] || 'nav.home' },
      { key: 'blog' as const, label: t['nav.blog'] || 'nav.blog' },
      { key: 'photography' as const, label: t['nav.photography'] || 'nav.photography' },
      { key: 'about' as const, label: t['nav.about'] || 'nav.about' },
    ],
    [t],
  );

  const mobileItems = navItems.map((item) => ({
    ...item,
    href: getHref(item.key),
    active: isActive(item.key),
  }));

  // Frost recipe must match blog: alpha lives in the *color* (bg/80), element stays
  // fully opaque, then backdrop-filter. Element-level opacity multiplies the blur
  // pass and reads thinner than the same nominal /80 on article pages.
  // When fully on, reuse the exact blog class string so compositing is identical.
  const frostFullyOn = !isHome || homeFrost >= 0.995;
  const frostAlpha = HOME_FROST_MAX_OPACITY * homeFrost;
  // Full blur once any frost starts; only fill alpha eases (closer to blog glass).
  const frostBlurPx = homeFrost > 0.01 ? HOME_FROST_MAX_BLUR_PX : 0;

  return (
    <header className="sticky top-0 z-40 w-full">
      {frostFullyOn ? (
        <div className="absolute inset-0 bg-paper/80 backdrop-blur-md" />
      ) : (
        // Progressive: same alpha-in-color recipe; --color-paper flips with .dark
        // so one layer covers both modes.
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `color-mix(in oklab, var(--color-paper) ${frostAlpha * 100}%, transparent)`,
            backdropFilter: frostBlurPx > 0 ? `blur(${frostBlurPx}px)` : undefined,
            WebkitBackdropFilter: frostBlurPx > 0 ? `blur(${frostBlurPx}px)` : undefined,
          }}
        />
      )}

      <div className="relative mx-auto max-w-content px-6 h-16 flex items-center justify-between">
        <nav
          className="hidden sm:flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400"
          aria-label="Primary"
        >
          {navItems.map((item) => {
            const active = isActive(item.key);
            const href = getHref(item.key);

            return (
              <a
                key={item.key}
                href={href}
                className={`block px-2.5 py-2 transition-colors no-underline focus-ring ${
                  active ? 'text-accent' : 'hover:text-accent'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* ml-auto: below `sm` the primary nav is display:none, leaving this as the
            only flex child — justify-between alone would park it at the left edge */}
        <div className="ml-auto flex items-center gap-3">
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
            appearanceLabel={t['nav.appearance'] || 'Appearance'}
            onItemClick={() => setMobileMenuOpen(false)}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
