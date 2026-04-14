import type { Language } from '@/i18n/config';

interface LanguageSwitcherProps {
  currentLang: Language;
  currentPath: string;
}

export default function LanguageSwitcher({ currentLang, currentPath }: LanguageSwitcherProps) {
  const getLocalizedPath = (lang: Language) => {
    let path = currentPath;

    if (path.startsWith('/zh/')) {
      path = path.replace('/zh/', '/');
    } else if (path === '/zh') {
      path = '/';
    }

    if (lang === 'zh') {
      return path === '/' ? '/zh' : `/zh${path}`;
    }

    return path;
  };

  return (
    <div className="flex items-center gap-2 text-sm font-normal">
      <a
        href={getLocalizedPath('en')}
        className={`no-underline transition-colors ${
          currentLang === 'en'
            ? 'text-zinc-900 dark:text-zinc-100 font-normal'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400'
        }`}
      >
        EN
      </a>
      <span className="text-zinc-300 dark:text-zinc-700">/</span>
      <a
        href={getLocalizedPath('zh')}
        className={`no-underline transition-colors ${
          currentLang === 'zh'
            ? 'text-zinc-900 dark:text-zinc-100 font-normal'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400'
        }`}
      >
        ZH
      </a>
    </div>
  );
}
