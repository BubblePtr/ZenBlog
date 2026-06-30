import { Window } from 'happy-dom';
import { describe, expect, test } from 'bun:test';
import {
  LIGHTBOX_EXCLUDED_SELECTOR,
  isLightboxEligibleImage,
  resolveFullSizeSrc,
} from '@/features/blog/blog-image-lightbox';

const dom = new Window({ url: 'https://example.com' });

globalThis.window = dom as unknown as Window & typeof globalThis.window;
globalThis.document = dom.document;
globalThis.HTMLElement = dom.HTMLElement;
globalThis.Element = dom.Element;

describe('resolveFullSizeSrc', () => {
  test('returns src when srcset is absent', () => {
    expect(resolveFullSizeSrc('/img.png')).toBe('/img.png');
  });

  test('picks the widest candidate from srcset', () => {
    const srcset = '/small.png 400w, /large.png 1200w, /medium.png 800w';
    expect(resolveFullSizeSrc('/fallback.png', srcset)).toBe('/large.png');
  });

  test('falls back to src when srcset has no width descriptors', () => {
    expect(resolveFullSizeSrc('/fallback.png', '/one.png 1x, /two.png 2x')).toBe('/fallback.png');
  });
});

describe('isLightboxEligibleImage', () => {
  test('rejects images inside excluded ancestors', () => {
    document.body.innerHTML = `
      <a class="link-card"><img id="card" src="/card.png" alt="" /></a>
      <div class="article-prose"><img id="content" src="/content.png" alt="" /></div>
    `;

    const card = document.getElementById('card')!;
    const content = document.getElementById('content')!;

    expect(isLightboxEligibleImage(card)).toBe(false);
    expect(isLightboxEligibleImage(content)).toBe(true);
    expect(LIGHTBOX_EXCLUDED_SELECTOR).toContain('a.link-card');
  });

  test('rejects images explicitly opted out', () => {
    document.body.innerHTML = '<img id="skip" src="/skip.png" alt="" data-lightbox="false" />';

    expect(isLightboxEligibleImage(document.getElementById('skip')!)).toBe(false);
  });
});
