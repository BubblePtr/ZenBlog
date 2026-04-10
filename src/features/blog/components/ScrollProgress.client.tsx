import { useEffect, useState } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'framer-motion';

interface TickProps {
  index: number;
  total: number;
  progress: MotionValue<number>;
  velocity: MotionValue<number>;
}

function Tick({ index, total, progress, velocity }: TickProps) {
  const position = index / (total - 1);
  const threshold = 0.05;
  const isLong = index % 5 === 0;
  const baseWidth = isLong ? 24 : 12;

  const waveValue = useTransform(
    progress,
    [position - threshold, position, position + threshold],
    [0, 1, 0],
  );
  const amplitudeFactor = useTransform(velocity, (v) => 1 + Math.min(Math.abs(v) * 0.2, 0.5));

  const width = useTransform([waveValue, amplitudeFactor], ([wave, amp]) => {
    const extra = isLong ? 8 : 4;
    return baseWidth + (wave as number) * extra * (amp as number);
  });

  const colorClass = isLong ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700';

  return (
    <motion.div
      style={{ width }}
      className={`h-px ${colorClass} rounded-full origin-left will-change-transform`}
    />
  );
}

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 25,
    restDelta: 0.001,
  });

  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness: 100,
    damping: 30,
  });

  const y = useTransform(smoothProgress, (value) => `${value * 100}%`);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const totalTicks = 31;
  const ticks = Array.from({ length: totalTicks }).map((_, i) => i);

  return (
    <motion.div
      className="fixed left-8 top-[50%] -translate-y-1/2 h-[40vh] w-24 z-50 hidden xl:flex flex-col items-start pointer-events-none"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute left-[14px] top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
      <div className="absolute left-[14px] top-0 bottom-0 flex flex-col justify-between w-full py-[2px]">
        {ticks.map((i) => (
          <Tick
            key={i}
            index={i}
            total={totalTicks}
            progress={smoothProgress}
            velocity={smoothVelocity}
          />
        ))}
      </div>

      <motion.div
        className="absolute left-0 w-full flex items-center z-10"
        style={{ top: y, translateY: '-50%' }}
      >
        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-8 border-l-orange-500 drop-shadow-sm" />
        <div className="h-px w-12 bg-orange-500 ml-1 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
      </motion.div>
    </motion.div>
  );
}
