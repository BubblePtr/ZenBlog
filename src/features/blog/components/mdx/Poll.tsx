import { useState } from 'react';
import { motion } from 'framer-motion';

interface PollProps {
  question: string;
  options: string[];
}

export default function Poll({ question, options }: PollProps) {
  const [voted, setVoted] = useState<number | null>(null);

  // 模拟初始数据：生成一些随机票数，让演示看起来不空
  const [votes, setVotes] = useState(() => options.map(() => Math.floor(Math.random() * 20) + 5));

  const totalVotes = votes.reduce((a, b) => a + b, 0);

  const handleVote = (index: number) => {
    if (voted !== null) return;
    setVoted(index);
    const newVotes = [...votes];
    newVotes[index] += 1;
    setVotes(newVotes);
  };

  return (
    <div className="my-8 p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
      <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        {question}
      </h3>
      <div className="space-y-3">
        {options.map((option, index) => {
          const percent = voted !== null ? Math.round((votes[index] / totalVotes) * 100) : 0;
          const isSelected = voted === index;

          return (
            <button
              key={option}
              onClick={() => handleVote(index)}
              disabled={voted !== null}
              className="relative w-full text-left group focus:outline-none"
            >
              {/* 进度条背景 (投票后显示) */}
              {voted !== null && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`absolute top-0 bottom-0 left-0 rounded-lg opacity-10 ${isSelected ? 'bg-zinc-700 dark:bg-zinc-300' : 'bg-zinc-500'}`}
                />
              )}

              {/* 选项内容 */}
              <div
                className={`relative p-3 rounded-lg border transition-all flex justify-between items-center
                ${
                  voted === null
                    ? 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-500 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-800/50'
                    : `border-transparent ${isSelected ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`
                }
              `}
              >
                <span className="font-medium text-sm">{option}</span>
                {voted !== null && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs font-mono"
                  >
                    {percent}%
                  </motion.span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {voted !== null && (
        <p className="text-center text-[10px] text-zinc-400 mt-4 font-mono uppercase tracking-wider">
          Total votes: {totalVotes}
        </p>
      )}
    </div>
  );
}
