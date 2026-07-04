const PROSE_SELECTOR = '.article-prose';
const TOC_TOP_NUDGE = 6;

let activeLayoutCleanup: (() => void) | undefined;

function getFirstArticleHeadingElement(prose: HTMLElement): HTMLElement | null {
  return prose.querySelector<HTMLElement>('h2[id]');
}

export function alignArticleCrispTocAside(): void {
  const shell = document.querySelector<HTMLElement>('.article-body-shell');
  const prose = document.querySelector<HTMLElement>(PROSE_SELECTOR);
  const aside = document.querySelector<HTMLElement>('.article-toc-aside');

  if (!shell || !aside) {
    return;
  }

  if (!window.matchMedia('(min-width: 1280px)').matches) {
    aside.style.top = '';
    return;
  }

  const firstHeading = prose ? getFirstArticleHeadingElement(prose) : null;
  if (!firstHeading) {
    aside.style.top = '';
    return;
  }

  const shellRect = shell.getBoundingClientRect();
  const headingRect = firstHeading.getBoundingClientRect();
  const offset = headingRect.top - shellRect.top + TOC_TOP_NUDGE;

  aside.style.top = `${Math.max(0, offset)}px`;
}

function watchArticleCrispTocLayout(signal: AbortSignal): void {
  const prose = document.querySelector<HTMLElement>(PROSE_SELECTOR);
  if (!prose) {
    return;
  }

  for (const image of prose.querySelectorAll('img')) {
    if (!image.complete) {
      image.addEventListener('load', alignArticleCrispTocAside, { once: true, signal });
    }
  }
}

export function teardownArticleCrispTocLayout(): void {
  activeLayoutCleanup?.();
  activeLayoutCleanup = undefined;
}

export function initArticleCrispTocLayout(): void {
  teardownArticleCrispTocLayout();

  alignArticleCrispTocAside();

  const controller = new AbortController();
  const { signal } = controller;

  window.addEventListener('resize', alignArticleCrispTocAside, { passive: true, signal });
  watchArticleCrispTocLayout(signal);

  activeLayoutCleanup = () => {
    controller.abort();
  };
}
