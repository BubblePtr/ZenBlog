import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiFullscreenLine, RiFullscreenExitLine, RiExternalLinkLine } from '@remixicon/react';

interface DemoBrowserProps {
  src: string;
  title: string;
  height?: number;
}

export default function DemoBrowser({ src, title, height = 680 }: DemoBrowserProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // 监听全屏状态变化
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const openInNewTab = useCallback(() => {
    window.open(src, '_blank', 'noopener,noreferrer');
  }, [src]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="my-8 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm dark:shadow-none"
      style={isFullscreen ? { height: '100vh', borderRadius: 0 } : undefined}
    >
      {/* 浏览器标题栏 */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 select-none">
        {/* 窗口控制按钮 */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>

        {/* 地址栏 */}
        <button
          onClick={openInNewTab}
          className="flex-1 min-w-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer group"
          title="在新标签页打开"
        >
          <span className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
            <RiExternalLinkLine size={13} />
          </span>
          <span className="truncate text-left">{title}</span>
        </button>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={openInNewTab}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="在新标签页打开"
          >
            <RiExternalLinkLine size={15} />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? <RiFullscreenExitLine size={15} /> : <RiFullscreenLine size={15} />}
          </button>
        </div>
      </div>

      {/* iframe 内容区 */}
      <iframe
        src={src}
        title={title}
        className="w-full"
        style={{ height: isFullscreen ? 'calc(100vh - 44px)' : height }}
        allow="fullscreen"
        loading="lazy"
      />
    </motion.div>
  );
}
