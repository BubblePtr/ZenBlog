import Giscus from '@giscus/react';
import { useEffect, useState } from 'react';
import type { Language } from '@/i18n/config';

interface GiscusCommentsProps {
  lang: Language;
}

export default function GiscusComments({ lang }: GiscusCommentsProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const nextTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          setTheme(nextTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Giscus
      repo="BubblePtr/ZenBlog"
      repoId="R_kgDOQZxLYQ"
      category="Announcements"
      categoryId="DIC_kwDOQZxLYc4C04o7"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={theme}
      lang={lang === 'zh' ? 'zh-CN' : 'en'}
      loading="eager"
    />
  );
}
