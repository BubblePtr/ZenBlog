import { describe, expect, test } from 'bun:test';
import {
  PHOTOGRAPHY_DISPLAY_WIDTHS,
  buildPhotographyImageVariants,
} from '@/features/photography/photography-image-variants';

describe('buildPhotographyImageVariants', () => {
  test('maps a CDN original JPG to WebP display variants with srcset', () => {
    const result = buildPhotographyImageVariants(
      'https://cdn.ninthbit.org/photography/xixi-wetland-01.jpg',
    );

    expect(result.src).toBe('https://cdn.ninthbit.org/photography/xixi-wetland-01-w1600.webp');
    expect(result.srcSet).toBe(
      [
        'https://cdn.ninthbit.org/photography/xixi-wetland-01-w800.webp 800w',
        'https://cdn.ninthbit.org/photography/xixi-wetland-01-w1600.webp 1600w',
      ].join(', '),
    );
    expect(result.widths).toEqual([...PHOTOGRAPHY_DISPLAY_WIDTHS]);
    expect(result.originalSrc).toBe('https://cdn.ninthbit.org/photography/xixi-wetland-01.jpg');
  });

  test('leaves non-CDN URLs unchanged so local/dev assets still work', () => {
    const result = buildPhotographyImageVariants('/local/photo.jpg');

    expect(result.src).toBe('/local/photo.jpg');
    expect(result.srcSet).toBeUndefined();
    expect(result.originalSrc).toBe('/local/photo.jpg');
  });

  test('is idempotent when given an already-variant URL', () => {
    const result = buildPhotographyImageVariants(
      'https://cdn.ninthbit.org/photography/xixi-wetland-01-w1600.webp',
    );

    expect(result.src).toBe('https://cdn.ninthbit.org/photography/xixi-wetland-01-w1600.webp');
    expect(result.srcSet).toBe(
      [
        'https://cdn.ninthbit.org/photography/xixi-wetland-01-w800.webp 800w',
        'https://cdn.ninthbit.org/photography/xixi-wetland-01-w1600.webp 1600w',
      ].join(', '),
    );
  });
});
