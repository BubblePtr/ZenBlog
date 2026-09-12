import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { initProjectDecks } from './project-deck.client';

function rect(left: number, top: number, width: number, height: number) {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('project deck', () => {
  let dom: Window;
  let stage: HTMLElement;
  let anchor: HTMLElement;
  let items: HTMLElement[];
  let cards: HTMLElement[];

  beforeEach(() => {
    dom = new Window({ url: 'https://example.com' });
    globalThis.window = dom as unknown as Window & typeof globalThis.window;
    globalThis.document = dom.document;
    globalThis.HTMLElement = dom.HTMLElement;
    globalThis.Element = dom.Element;

    document.body.innerHTML = `
      <div class="deck-stage" data-project-deck>
        <span class="deck-anchor"></span>
        <ul class="deck">
          <li class="deck-item"><button class="deck-card" data-href="#a"></button></li>
          <li class="deck-item"><button class="deck-card" data-href="#b"></button></li>
          <li class="deck-item"><button class="deck-card" data-href="#c"></button></li>
        </ul>
      </div>`;

    stage = document.querySelector<HTMLElement>('.deck-stage')!;
    anchor = stage.querySelector<HTMLElement>('.deck-anchor')!;
    items = Array.from(stage.querySelectorAll<HTMLElement>('.deck-item'));
    cards = items.map((li) => li.querySelector<HTMLElement>('.deck-card')!);

    anchor.getBoundingClientRect = () => rect(500, 100, 0, 0);
    items.forEach((li, i) => {
      li.getBoundingClientRect = () => rect(100 + i * 200, 300, 240, 320);
    });
    // Cards report a different rect than their slots, simulating a read taken
    // while a transform transition is still in flight (e.g. the retreat pose).
    cards.forEach((card, i) => {
      card.getBoundingClientRect = () => rect(110 + i * 200, 680, 204, 272);
    });

    initProjectDecks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('measures the lift from the card slot, not the card live transform', () => {
    cards[0].click();

    expect(items[0].hasAttribute('data-open')).toBe(true);
    // li rect top is 300, anchor top is 100 → --ly = -200px.
    // Reading the card rect (top 680, mid-transition) would give -580px.
    expect(cards[0].style.getPropertyValue('--ly')).toBe('-200px');
  });

  test('lifting a second card lands it at the same anchor height', () => {
    cards[0].click();
    cards[1].click();

    expect(items[0].hasAttribute('data-open')).toBe(false);
    expect(items[1].hasAttribute('data-open')).toBe(true);
    expect(cards[1].style.getPropertyValue('--ly')).toBe('-200px');
    // --lx uses the untransformed slot width (240), not the mid-flight one (204).
    expect(cards[1].style.getPropertyValue('--lx')).toBe('38px');
  });

  describe('viewport centering', () => {
    let scrolls: ScrollToOptions[];

    beforeEach(() => {
      // Stage spans y 100..500; --retreat grows it by 380 below when open.
      stage.getBoundingClientRect = () => rect(0, 100, 1000, 400);
      stage.style.setProperty('--retreat', '380px');
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 4000,
        configurable: true,
      });
      scrolls = [];
      window.scrollTo = ((opts: ScrollToOptions) => {
        scrolls.push(opts);
      }) as typeof window.scrollTo;
    });

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    test('opening glides to the centred position over ~480ms', async () => {
      cards[0].click();

      // Centre of 100..880 is 490; happy-dom innerHeight is 768 → target 106.
      // The rAF glide issues per-frame instant scrolls ending exactly there.
      await sleep(600);
      expect(scrolls.length).toBeGreaterThan(1);
      expect(scrolls.at(-1)).toEqual({ top: 106, behavior: 'instant' });
    });

    test('the glide aborts when the user scrolls manually', async () => {
      cards[0].click();
      await sleep(100);
      window.dispatchEvent(new dom.Event('wheel'));
      const count = scrolls.length;

      await sleep(600);
      expect(scrolls.length).toBe(count);
    });

    test('closing scrolls back to the pre-open position', async () => {
      cards[0].click();
      await sleep(50);
      stage.dispatchEvent(new dom.Event('click', { bubbles: true }));

      expect(scrolls.at(-1)).toEqual({ top: 0, behavior: 'smooth' });
      // The open glide is cancelled: no further per-frame scrolls.
      const count = scrolls.length;
      await sleep(600);
      expect(scrolls.length).toBe(count);
    });

    test('closing does not scroll back after the user scrolled manually', async () => {
      cards[0].click();
      await sleep(50);
      window.dispatchEvent(new dom.Event('wheel'));
      const count = scrolls.length;
      stage.dispatchEvent(new dom.Event('click', { bubbles: true }));

      await sleep(600);
      expect(scrolls.length).toBe(count);
    });
  });
});
