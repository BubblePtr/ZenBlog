import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { Window } from 'happy-dom';
import { createElement, act } from 'react';
import { createRoot } from 'react-dom/client';
import ImageWithSkeleton from '@/shared/components/media/ImageWithSkeleton.client';

describe('ImageWithSkeleton', () => {
  let dom: Window;
  let rootEl: HTMLElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    dom = new Window({ url: 'https://example.com' });
    globalThis.window = dom as unknown as Window & typeof globalThis.window;
    globalThis.document = dom.document;
    globalThis.HTMLElement = dom.HTMLElement;
    globalThis.Element = dom.Element;
    // @ts-expect-error React act flag for happy-dom
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    rootEl = document.createElement('div');
    document.body.appendChild(rootEl);
    root = createRoot(rootEl);
  });

  afterEach(() => {
    root.unmount();
    document.body.innerHTML = '';
  });

  test('keeps the skeleton visible until the image fires load', async () => {
    await act(async () => {
      root.render(
        createElement(ImageWithSkeleton, {
          src: 'https://cdn.ninthbit.org/photography/xixi-wetland-01-w800.webp',
          alt: 'Xixi Wetland',
          className: 'object-cover',
        }),
      );
    });

    expect(document.querySelector('[data-skeleton]')).not.toBeNull();

    const img = document.querySelector('img')!;
    expect(img.className).toContain('opacity-0');

    await act(async () => {
      img.dispatchEvent(new dom.Event('load'));
    });

    expect(document.querySelector('[data-skeleton]')).toBeNull();
    expect(img.className).toContain('opacity-100');
  });

  test('hides the skeleton on error so a broken image does not leave a forever pulse', async () => {
    await act(async () => {
      root.render(
        createElement(ImageWithSkeleton, {
          src: 'https://cdn.ninthbit.org/missing.webp',
          alt: 'Missing',
        }),
      );
    });

    const img = document.querySelector('img')!;
    await act(async () => {
      img.dispatchEvent(new dom.Event('error'));
    });

    expect(document.querySelector('[data-skeleton]')).toBeNull();
  });

  test('notifies onStatusChange when the image loads', async () => {
    const statuses: string[] = [];

    await act(async () => {
      root.render(
        createElement(ImageWithSkeleton, {
          src: 'https://cdn.ninthbit.org/photography/xixi-wetland-01-w800.webp',
          alt: 'Xixi',
          onStatusChange: (status) => {
            statuses.push(status);
          },
        }),
      );
    });

    const img = document.querySelector('img')!;
    await act(async () => {
      img.dispatchEvent(new dom.Event('load'));
    });

    expect(statuses).toEqual(['loaded']);
  });
});
