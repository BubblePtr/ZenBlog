import type { Language } from '@/i18n/config';
import { withTrailingSlash } from '@/shared/urls';

interface LanguageSwitcherProps {
  currentLang: Language;
  currentPath: string;
  localizedPaths?: Partial<Record<Language, string>>;
}

export default function LanguageSwitcher({
  currentLang,
  currentPath,
  localizedPaths,
}: LanguageSwitcherProps) {
  const getLocalizedPath = (lang: Language) => {
    if (localizedPaths && !(lang in localizedPaths)) {
      return '';
    }

    const explicitPath = localizedPaths?.[lang];
    if (explicitPath !== undefined) {
      return explicitPath;
    }

    let path = currentPath;

    if (path.startsWith('/zh/')) {
      path = path.replace('/zh/', '/');
    } else if (path === '/zh') {
      path = '/';
    }

    if (lang === 'zh') {
      return withTrailingSlash(path === '/' ? '/zh' : `/zh${path}`);
    }

    return withTrailingSlash(path);
  };

  const renderLanguage = (lang: Language, label: string) => {
    const localizedPath = getLocalizedPath(lang);
    const isCurrent = currentLang === lang;
    const className = `no-underline transition-colors ${
      isCurrent
        ? 'text-zinc-900 dark:text-zinc-100 font-normal'
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400'
    }`;

    if (!localizedPath) {
      return <span className="text-zinc-300 dark:text-zinc-700">{label}</span>;
    }

    return (
      <a href={localizedPath} className={className}>
        {label}
      </a>
    );
  };

  return (
    <div className="flex items-center gap-2 text-sm font-normal">
      {renderLanguage('en', 'EN')}
      <span className="text-zinc-300 dark:text-zinc-700">/</span>
      {renderLanguage('zh', 'ZH')}
    </div>
  );
}
