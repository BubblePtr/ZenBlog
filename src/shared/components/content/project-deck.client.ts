/**
 * Project deck interaction: click lifts a card (FLIP to the stage anchor),
 * the rest retreat via CSS; a second click follows the card's href.
 * Opening scrolls the page so the lifted card plus the retreated row stay
 * centred in the viewport; closing scrolls back unless the user scrolled
 * manually. Narrow viewports skip the lift and open the project directly.
 */
const LIFT_SCALE = 1.35;
const NARROW = '(max-width: 720px)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const SCROLL_KEYS = new Set([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End']);

function wireDeck(stage: HTMLElement) {
  if (stage.dataset.deckReady) return;
  stage.dataset.deckReady = '';

  const anchor = stage.querySelector<HTMLElement>('.deck-anchor');
  const items = Array.from(stage.querySelectorAll<HTMLElement>('.deck-item'));
  if (!anchor || items.length === 0) return;

  let savedScrollY: number | null = null;
  let userScrolled = false;
  let scrollRaf = 0;
  const noteUserScroll = () => {
    userScrolled = true;
  };

  const scrollBehavior = (): ScrollBehavior =>
    window.matchMedia(REDUCED_MOTION).matches ? 'auto' : 'smooth';

  // Glide frame by frame rather than with one native smooth scroll: the stage
  // keeps growing for ~320ms (the retreat padding transition), and a native
  // smooth scroll that runs into the still-short scroll extent terminates
  // early. Each frame clamps to the current extent, so the glide follows the
  // layout as it grows — one continuous motion. Aborts on manual scrolling.
  const glideScrollTo = (target: number) => {
    if (window.matchMedia(REDUCED_MOTION).matches) {
      window.scrollTo({ top: target, behavior: 'instant' });
      return;
    }
    window.cancelAnimationFrame(scrollRaf);
    const start = window.scrollY;
    const delta = target - start;
    const t0 = window.performance.now();
    const DURATION = 480;
    const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
    const step = (now: number) => {
      if (userScrolled) return;
      const t = Math.min((now - t0) / DURATION, 1);
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: Math.min(start + delta * easeInOut(t), max), behavior: 'instant' });
      if (t < 1) scrollRaf = window.requestAnimationFrame(step);
    };
    scrollRaf = window.requestAnimationFrame(step);
  };

  const close = (restoreScroll = true) => {
    stage.removeAttribute('data-open');
    for (const li of items) {
      li.removeAttribute('data-open');
      li.querySelector('.deck-card')?.setAttribute('aria-expanded', 'false');
    }
    if (!restoreScroll) return;
    window.cancelAnimationFrame(scrollRaf);
    window.removeEventListener('wheel', noteUserScroll);
    window.removeEventListener('touchmove', noteUserScroll);
    if (savedScrollY !== null && !userScrolled) {
      window.scrollTo({ top: savedScrollY, behavior: scrollBehavior() });
    }
    savedScrollY = null;
    userScrolled = false;
  };

  const open = (li: HTMLElement, card: HTMLElement) => {
    const wasOpen = stage.hasAttribute('data-open');
    close(false);
    // FLIP: the li is never transformed, so its rect is the card's
    // untransformed slot even mid-transition; aim the card's top edge at the anchor.
    const from = li.getBoundingClientRect();
    const to = anchor.getBoundingClientRect();
    card.style.setProperty('--lx', `${to.left - (from.width * LIFT_SCALE) / 2 - from.left}px`);
    card.style.setProperty('--ly', `${to.top - from.top}px`);
    stage.setAttribute('data-open', '');
    li.setAttribute('data-open', '');
    card.setAttribute('aria-expanded', 'true');

    // The open composition spans the stage top (where the lifted card lands)
    // down to the stage bottom plus --retreat of growing padding. Scroll so
    // that span ends up vertically centred in the viewport.
    const y0 = window.scrollY;
    if (!wasOpen) {
      savedScrollY = y0;
      userScrolled = false;
      window.addEventListener('wheel', noteUserScroll, { passive: true });
      window.addEventListener('touchmove', noteUserScroll, { passive: true });
    }
    const computed = window.getComputedStyle(stage);
    const retreat = parseFloat(computed.getPropertyValue('--retreat')) || 0;
    const pad = parseFloat(computed.paddingBottom) || 0;
    const stageRect = stage.getBoundingClientRect();
    const top = stageRect.top + y0;
    const bottom = stageRect.bottom + y0 - pad + retreat;
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - pad + retreat - window.innerHeight,
    );
    const target = Math.min(Math.max((top + bottom - window.innerHeight) / 2, 0), maxScroll);
    if (Math.abs(target - y0) > 24) glideScrollTo(target);
  };

  for (const li of items) {
    const card = li.querySelector<HTMLElement>('.deck-card');
    if (!card) continue;
    card.addEventListener('click', () => {
      if (window.matchMedia(NARROW).matches || li.hasAttribute('data-open')) {
        const href = card.dataset.href;
        if (href) window.location.href = href;
        return;
      }
      open(li, card);
    });
  }

  stage.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('.deck-card')) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    else if (stage.hasAttribute('data-open') && SCROLL_KEYS.has(e.key)) noteUserScroll();
  });
}

export function initProjectDecks() {
  for (const stage of document.querySelectorAll<HTMLElement>('[data-project-deck]')) {
    wireDeck(stage);
  }
}
