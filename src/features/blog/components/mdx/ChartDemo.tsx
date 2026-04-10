import { motion } from 'framer-motion';

const data = [10, 40, 30, 70, 45, 90, 65];

export default function ChartDemo() {
  const max = Math.max(...data);

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (val / max) * 80;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="my-8 p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">
            Analytics
          </div>
          <div className="text-2xl font-heading font-bold text-zinc-900 dark:text-zinc-100">
            User Growth
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-mono text-zinc-500">Live</span>
        </div>
      </div>

      <div className="relative h-40 w-full">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              className="text-zinc-100 dark:text-zinc-800"
              strokeWidth="0.5"
              strokeDasharray="2"
            />
          ))}

          {/* 修改：strokeWidth 从 2 改为 1，线条更精致 */}
          <motion.polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-zinc-600 dark:text-zinc-400"
            points={points}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            viewport={{ once: true }}
          />

          {/* 修改：数据点也相应调小一点，保持平衡 */}
          {data.map((val, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (val / max) * 80;
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="1.2" // 从 1.5 改为 1.2
                className="fill-white dark:fill-zinc-900 stroke-zinc-600 dark:stroke-zinc-400 cursor-pointer"
                strokeWidth="1"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5 + i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 3 }}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between mt-2 text-[10px] font-mono text-zinc-400">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
}
