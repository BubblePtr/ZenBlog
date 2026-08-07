import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RiMoonFill, RiSunFill } from '@remixicon/react';
import { flushSync } from 'react-dom';

type ThemeToggleProps = React.ComponentPropsWithoutRef<'button'>;

export default function ThemeToggle({ className = '', ...props }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = useCallback(() => {
    const applyTheme = () => {
      const newTheme = !isDark;
      setIsDark(newTheme);
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    // .theme-switching (global.css) drives the whole-page cross-fade. It also
    // collapses all named snapshot groups into root and suppresses per-element
    // color transitions — without that, named groups (hero-avatar, bt-*) fade
    // on their own schedule and the live "new" capture lags behind on its own
    // transitions, breaking the uniform fade.
    const root = document.documentElement;
    root.classList.add('theme-switching');

    const transition = document.startViewTransition(() => {
      flushSync(applyTheme);
    });
    transition.finished.finally(() => root.classList.remove('theme-switching'));
  }, [isDark]);

  return (
    <button onClick={toggleTheme} className={`relative overflow-hidden ${className}`} {...props}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'sun' : 'moon'}
          initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {isDark ? <RiSunFill size={18} /> : <RiMoonFill size={18} />}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
