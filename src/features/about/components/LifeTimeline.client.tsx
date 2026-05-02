import { useId, useState } from 'react';
import type { TranslationDictionary, TranslationKey } from '@/shared/i18n/types';
import type { Language } from '@/i18n/config';
import type { TimelineEntry, TimelineEntryType } from '@/features/about/content';

interface Props {
  t: TranslationDictionary;
  lang: Language;
  entries: TimelineEntry[];
}

const BADGE_KEY_BY_TYPE: Record<TimelineEntryType, TranslationKey> = {
  role: 'about.timeline.badge.role',
  education: 'about.timeline.badge.education',
  making: 'about.timeline.badge.making',
  life: 'about.timeline.badge.life',
};

type TimelineItem =
  | { kind: 'decade'; key: string; label: string }
  | { kind: 'entry'; key: string; entry: TimelineEntry };

// Decade labels are translated via dedicated keys when present (e.g. about.timeline.decade.2020s);
// future decades without a translation fall back to a locale-agnostic `${decade}s` so a content
// addition for 2030+ does not silently inherit the wrong label.
const DECADE_KEYS: Record<number, TranslationKey> = {
  2010: 'about.timeline.decade.2010s',
  2020: 'about.timeline.decade.2020s',
};

function buildItems(entries: TimelineEntry[], t: TranslationDictionary): TimelineItem[] {
  const out: TimelineItem[] = [];
  let lastDecade: number | null = null;
  for (const entry of entries) {
    const decade = Math.floor(entry.year / 10) * 10;
    if (decade !== lastDecade) {
      const labelKey = DECADE_KEYS[decade];
      const label = labelKey ? t[labelKey] : `${decade}s`;
      out.push({ kind: 'decade', key: `decade-${decade}`, label });
      lastDecade = decade;
    }
    out.push({ kind: 'entry', key: entry.id, entry });
  }
  return out;
}

export default function LifeTimeline({ t, lang, entries }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const baseId = useId();
  const isZh = lang === 'zh';
  // Small-caps tracking (uppercase + wide letter-spacing) is an English-typography idiom;
  // applying 0.2em+ tracking to CJK characters spaces them so wide the label reads as broken.
  const decadeLabelClass = isZh ? 'tracking-[0.12em]' : 'uppercase tracking-[0.28em]';
  const badgeLabelClass = isZh ? 'tracking-[0.08em]' : 'uppercase tracking-[0.2em]';

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const items = buildItems(entries, t);

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className="pt-[clamp(2rem,4vw,3.5rem)] pb-[clamp(3rem,6vw,5rem)]"
    >
      <h2 id={`${baseId}-title`} className="sr-only">
        {t['about.timeline.title']}
      </h2>
      <ol className="flex flex-col">
        {items.map((item) => {
          if (item.kind === 'decade') {
            return (
              <li key={item.key} className="pt-14 pb-3 first:pt-2" aria-hidden="true">
                <div className="flex items-baseline gap-5">
                  <span
                    className={`tabular-nums text-[0.6875rem] text-[var(--color-text-secondary)]/70 ${decadeLabelClass}`}
                  >
                    {item.label}
                  </span>
                  <span className="flex-1 section-rule" />
                </div>
              </li>
            );
          }

          const entry = item.entry;
          const isOpen = open.has(entry.id);
          const panelId = `${baseId}-panel-${entry.id}`;
          const buttonId = `${baseId}-button-${entry.id}`;
          const badgeLabel = t[BADGE_KEY_BY_TYPE[entry.type]];

          return (
            <li key={item.key}>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(entry.id)}
                className="group block w-full py-3.5 text-left focus-ring"
              >
                <div className="grid grid-cols-1 gap-y-1.5 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-x-7 sm:items-baseline">
                  <span className="tabular-nums text-[0.8125rem] font-light text-[var(--color-text-secondary)]/80">
                    {entry.year}
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span
                      className={`text-[10px] text-[var(--color-text-secondary)]/60 ${badgeLabelClass}`}
                    >
                      {badgeLabel}
                    </span>
                    <span className="text-[1.0625rem] font-light text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-text-emphasis)]">
                      {entry.summary}
                    </span>
                    <span
                      aria-hidden="true"
                      className="ml-auto tabular-nums text-sm font-light text-[var(--color-text-secondary)]/40 transition-colors group-hover:text-[var(--color-text-secondary)]"
                    >
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                </div>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                aria-hidden={!isOpen}
                inert={!isOpen}
                className="grid motion-safe:transition-[grid-template-rows] motion-safe:duration-[260ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="grid grid-cols-1 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-x-7 pt-1 pb-6">
                    <span aria-hidden="true" className="hidden sm:block" />
                    <div className="max-w-[58ch] text-[0.9375rem] font-light leading-[1.85] text-[var(--color-text-primary)]/95">
                      {entry.body && <p className="whitespace-pre-line">{entry.body}</p>}
                      {entry.links && entry.links.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                          {entry.links.map((link) => (
                            <li key={link.href}>
                              <a
                                href={link.href}
                                className="underline underline-offset-4 decoration-[var(--color-text-secondary)]/40 transition-colors hover:text-[var(--color-text-emphasis)] hover:decoration-[var(--color-text-primary)]/60 focus-ring"
                              >
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
