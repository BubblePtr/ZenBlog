import { useState } from 'react';
import { motion } from 'framer-motion';
import { RiAddLine, RiSubtractLine } from '@remixicon/react';

export default function InteractiveCounter() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between max-w-sm my-8">
      <div className="flex flex-col">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
          Interactive State
        </span>
        <span className="font-heading text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Count: {count}
        </span>
      </div>
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCount((c) => c - 1)}
          className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors"
        >
          <RiSubtractLine size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCount((c) => c + 1)}
          className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors"
        >
          <RiAddLine size={16} />
        </motion.button>
      </div>
    </div>
  );
}
