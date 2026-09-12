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
});
