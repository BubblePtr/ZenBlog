import type { Language } from '@/i18n/config';

interface SeriesBadgeProps {
  series: string;
  no?: number;
  lang: Language;
  variant?: 'seal' | 'compact';
}

// Latin label kept identical across locales: it mirrors the existing English
// eyebrow convention and lets us track-space it without breaking the
// no-letter-spacing-on-Chinese rule (the localized series name carries none).
const SERIES_LABEL = 'SERIES';
const FLEURON = '❧'; // ❧ rotated floral heart — a letterpress printer's ornament

function serifFamily(lang: Language): string {
  return lang === 'zh' ? 'var(--font-serif)' : 'var(--font-serif-en)';
}

function numero(no?: number): string | null {
  return typeof no === 'number' ? `№ ${String(no).padStart(2, '0')}` : null;
}

export default function SeriesBadge({ series, no, lang, variant = 'seal' }: SeriesBadgeProps) {
  const fontFamily = serifFamily(lang);
  const num = numero(no);

  if (variant === 'compact') {
    return (
      <span className="inline-flex items-center gap-[7px] rounded-[2px] border border-zinc-300 px-2 py-[3px] align-middle dark:border-zinc-700">
        <span aria-hidden="true" className="text-[9px] text-zinc-400 dark:text-zinc-600">
          {FLEURON}
        </span>
        <span
          className="text-[12px] font-semibold leading-none text-zinc-700 dark:text-zinc-300"
          style={{ fontFamily }}
        >
          {series}
        </span>
        {num && (
          <span className="pl-[0.18em] font-mono text-[9.5px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            {num}
          </span>
        )}
      </span>
    );
  }

  const label = num ? `${SERIES_LABEL} · ${num}` : SERIES_LABEL;

  return (
    <span className="inline-flex flex-col items-center gap-[7px] rounded-[2px] border border-zinc-900 px-5 pb-[13px] pt-[11px] dark:border-zinc-100">
      <span className="pl-[0.34em] font-mono text-[10.5px] uppercase tracking-[0.34em] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <span className="flex items-center gap-[10px] text-zinc-900 dark:text-zinc-100">
        <span aria-hidden="true" className="text-[11px] text-zinc-400 dark:text-zinc-600">
          {FLEURON}
        </span>
        <span className="text-[18px] font-semibold leading-none" style={{ fontFamily }}>
          {series}
        </span>
        <span
          aria-hidden="true"
          className="text-[11px] text-zinc-400 [transform:scaleX(-1)] dark:text-zinc-600"
        >
          {FLEURON}
        </span>
      </span>
    </span>
  );
}
