import { motion } from 'framer-motion';

interface MobileNavItem {
  key: string;
  label: string;
  href: string;
  active: boolean;
}

interface MobileNavMenuProps {
  items: MobileNavItem[];
  onItemClick: () => void;
}

export default function MobileNavMenu({ items, onItemClick }: MobileNavMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
      className="sm:hidden bg-white dark:bg-black relative z-50"
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
              className={`block px-6 py-4 rounded-2xl text-lg font-normal transition-colors no-underline ${
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
