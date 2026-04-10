import { motion } from 'framer-motion';

export default function AnimationDemo() {
  return (
    <div className="h-32 flex items-center justify-center gap-8 my-8 bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <motion.div
        className="w-12 h-12 bg-zinc-600 dark:bg-zinc-400 rounded-xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="w-12 h-12 bg-blue-500 rounded-full"
        animate={{ y: [-20, 20, -20] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
