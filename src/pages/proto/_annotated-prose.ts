// Prototype copy + markup helpers. Throwaway.
// Anchors: the word in the prose is the link; the note points at it.
// Worst content: one note at the 8-word cap, one anchor that can wrap.
export const notes = {
  projects: { href: '/projects/', note: '4 shipped, 1 still building' },
  writing: { href: '/blog/', note: 'mostly in Chinese, some translated to English' },
  photos: { href: '/photography/', note: 'film + digital' },
  about: { href: '/about/', note: 'indie since Jun 2026' },
} as const;
export type Key = keyof typeof notes;
export const keys = Object.keys(notes) as Key[];

// Built as a string: Astro drops the whitespace around elements on their own line.
const link = (k: Key, text: string, inner = '') =>
  `<a class="ann-word" data-key="${k}" href="${notes[k].href}">${inner}${text}</a>`;
export const prose = (deco = (k: Key, text: string) => link(k, text)) =>
  `I'm Kieran, an AI-native indie builder in Nanjing. I ship ${deco('projects', 'small products')}, I ` +
  `${deco('writing', 'write')} about agentic engineering and the craft of building alone, and I ` +
  `${deco('photos', 'carry a camera')} whenever I leave the desk. There is a little more ` +
  `${deco('about', 'about me')} if you want it.`;
const circle =
  '<svg class="ann-circle" viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M10 21C8 6 48 2 84 7c18 3 16 26-8 30C40 41 6 38 10 21" /></svg>';
export const inlineProse = prose(
  (k, text) => `${link(k, text, circle)}<span class="ann-tag hand-note">${notes[k].note}</span>`,
);
