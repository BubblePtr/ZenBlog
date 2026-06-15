import { describe, expect, test } from 'bun:test';
import { buildSeriesIndexMap, type SeriesIndexInput } from '@/features/blog/series';

const d = (iso: string) => new Date(iso);

describe('buildSeriesIndexMap', () => {
  test('posts without a series are absent from the map', () => {
    const posts: SeriesIndexInput[] = [
      { id: 'en/hello', pubDate: d('2026-01-01') },
      { id: 'en/world', series: '', pubDate: d('2026-01-02') },
    ];

    const map = buildSeriesIndexMap(posts);

    expect(map.size).toBe(0);
  });

  test('numbers a series ascending by pubDate regardless of input order', () => {
    const posts: SeriesIndexInput[] = [
      { id: 'zh/week-3', series: '周记', pubDate: d('2026-03-15') },
      { id: 'zh/week-1', series: '周记', pubDate: d('2026-03-01') },
      { id: 'zh/week-2', series: '周记', pubDate: d('2026-03-08') },
    ];

    const map = buildSeriesIndexMap(posts);

    expect(map.get('zh/week-1')).toEqual({ no: 1, total: 3 });
    expect(map.get('zh/week-2')).toEqual({ no: 2, total: 3 });
    expect(map.get('zh/week-3')).toEqual({ no: 3, total: 3 });
  });

  test('tracks each series independently', () => {
    const posts: SeriesIndexInput[] = [
      { id: 'zh/a1', series: '周记', pubDate: d('2026-03-01') },
      { id: 'zh/b1', series: '札记', pubDate: d('2026-02-01') },
      { id: 'zh/a2', series: '周记', pubDate: d('2026-03-08') },
    ];

    const map = buildSeriesIndexMap(posts);

    expect(map.get('zh/a1')).toEqual({ no: 1, total: 2 });
    expect(map.get('zh/a2')).toEqual({ no: 2, total: 2 });
    expect(map.get('zh/b1')).toEqual({ no: 1, total: 1 });
  });

  test('breaks pubDate ties deterministically by id', () => {
    const posts: SeriesIndexInput[] = [
      { id: 'zh/beta', series: '周记', pubDate: d('2026-03-01') },
      { id: 'zh/alpha', series: '周记', pubDate: d('2026-03-01') },
    ];

    const map = buildSeriesIndexMap(posts);

    expect(map.get('zh/alpha')).toEqual({ no: 1, total: 2 });
    expect(map.get('zh/beta')).toEqual({ no: 2, total: 2 });
  });
});
