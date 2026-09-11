/**
 * Project deck interaction: click lifts a card (FLIP to the stage anchor),
 * the rest retreat via CSS; a second click follows the card's href.
 * Narrow viewports skip the lift and open the project directly.
 */
const LIFT_SCALE = 1.35;
const NARROW = '(max-width: 720px)';

function wireDeck(stage: HTMLElement) {
  if (stage.dataset.deckReady) return;
  stage.dataset.deckReady = '';

  const anchor = stage.querySelector<HTMLElement>('.deck-anchor');
  const items = Array.from(stage.querySelectorAll<HTMLElement>('.deck-item'));
  if (!anchor || items.length === 0) return;

  const close = () => {
    stage.removeAttribute('data-open');
    for (const li of items) {
      li.removeAttribute('data-open');
      li.querySelector('.deck-card')?.setAttribute('aria-expanded', 'false');
    }
  };

  const open = (li: HTMLElement, card: HTMLElement) => {
    close();
    // FLIP: measure the card's untransformed slot, aim its top edge at the anchor.
    const prev = card.style.transform;
    card.style.transform = 'none';
    const from = card.getBoundingClientRect();
    card.style.transform = prev;
    const to = anchor.getBoundingClientRect();
    card.style.setProperty('--lx', `${to.left - (from.width * LIFT_SCALE) / 2 - from.left}px`);
    card.style.setProperty('--ly', `${to.top - from.top}px`);
    stage.setAttribute('data-open', '');
    li.setAttribute('data-open', '');
    card.setAttribute('aria-expanded', 'true');
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
  });
}

export function initProjectDecks() {
  for (const stage of document.querySelectorAll<HTMLElement>('[data-project-deck]')) {
    wireDeck(stage);
  }
}
