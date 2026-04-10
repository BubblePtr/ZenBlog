import { motion, useScroll, useTransform } from 'framer-motion';
import { RiBriefcaseLine, RiGraduationCapLine, RiCalendarLine } from '@remixicon/react';
import { useRef } from 'react';

const EXPERIENCES = [
  {
    id: 1,
    role: 'Senior Frontend Engineer',
    company: 'Tech Corp',
    period: '2022 - Present',
    type: 'work',
    description:
      'Leading the design system migration and building the next-gen dashboard using React and Astro.',
  },
  {
    id: 2,
    role: 'Full Stack Developer',
    company: 'StartUp Inc.',
    period: '2020 - 2022',
    type: 'work',
    description:
      'Shipped the MVP in 3 months. Handled everything from Postgres DB design to Tailwind UI components.',
  },
  {
    id: 3,
    role: 'Computer Science Degree',
    company: 'University of Technology',
    period: '2016 - 2020',
    type: 'education',
    description: 'Major in Software Engineering. Specialized in Human-Computer Interaction.',
  },
] as const;

export default function CareerTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end center'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className="relative ml-3 space-y-12 py-4">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
      <motion.div
        style={{ height: lineHeight }}
        className="absolute left-0 top-0 w-px bg-gradient-to-b from-zinc-400 to-zinc-600 dark:from-zinc-500 dark:to-zinc-400 origin-top"
      />

      {EXPERIENCES.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ delay: index * 0.2, duration: 0.5 }}
          className="relative pl-8 group"
        >
          <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 z-10 transition-all duration-300 group-hover:scale-125 group-hover:border-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700">
            <div className="absolute inset-0.5 rounded-full bg-zinc-600 dark:bg-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {item.role}
            </h3>
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 shrink-0 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
              <RiCalendarLine size={11} />
              {item.period}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            {item.type === 'work' ? (
              <RiBriefcaseLine size={14} className="text-zinc-400" />
            ) : (
              <RiGraduationCapLine size={14} className="text-zinc-400" />
            )}
            <span>{item.company}</span>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-prose">
            {item.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
