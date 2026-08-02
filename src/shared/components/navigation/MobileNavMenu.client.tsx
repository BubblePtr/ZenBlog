import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import ThemeToggle from '@/shared/components/theme/ThemeToggle.client';

interface MobileNavItem {
  key: string;
  label: string;
  href: string;
  active: boolean;
}

interface MobileNavMenuProps {
  items: MobileNavItem[];
  appearanceLabel: string;
  onItemClick: () => void;
  onClose: () => void;
}

export default function MobileNavMenu({
  items,
  appearanceLabel,
  onItemClick,
  onClose,
}: MobileNavMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 菜单打开时自动聚焦第一个链接
  useEffect(() => {
    const firstLink = menuRef.current?.querySelector<HTMLElement>('a');
    firstLink?.focus();
  }, []);

  // 焦点陷阱 + Escape 关闭
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
      className="sm:hidden bg-paper relative z-50"
    >
      <div className="max-w-content mx-auto px-6 pb-4">
        <nav aria-label="Primary" className="divide-y divide-line border-y border-line">
          {items.map((item, i) => (
            <motion.a
              key={item.key}
              href={item.href}
              onClick={onItemClick}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2, ease: 'easeOut' }}
              className={`block py-4 text-lg transition-colors no-underline focus-ring ${
                item.active ? 'text-accent' : 'text-ink-secondary hover:text-accent'
              }`}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.label}
            </motion.a>
          ))}

          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: items.length * 0.04, duration: 0.2, ease: 'easeOut' }}
            className="flex items-center justify-between py-2"
          >
            <span className="text-sm text-ink-tertiary">{appearanceLabel}</span>
            <ThemeToggle
              className="flex items-center justify-center min-w-11 min-h-11 rounded-full text-ink-secondary hover:text-ink-strong transition-colors focus-ring"
              aria-label="Toggle theme"
            />
          </motion.div>
        </nav>
      </div>
    </motion.div>
  );
}
