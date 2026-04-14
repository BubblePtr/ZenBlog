import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface MobileNavItem {
  key: string;
  label: string;
  href: string;
  active: boolean;
}

interface MobileNavMenuProps {
  items: MobileNavItem[];
  onItemClick: () => void;
  onClose: () => void;
}

export default function MobileNavMenu({ items, onItemClick, onClose }: MobileNavMenuProps) {
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
      className="sm:hidden bg-[oklch(98%_0.006_60)] dark:bg-zinc-950 relative z-50"
    >
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-4 space-y-2">
          {items.map((item, i) => (
            <motion.a
              key={item.key}
              href={item.href}
              onClick={onItemClick}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2, ease: 'easeOut' }}
              className={`block px-6 py-4 rounded-2xl text-lg font-normal transition-colors no-underline focus-ring ${
                item.active
                  ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {item.label}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
