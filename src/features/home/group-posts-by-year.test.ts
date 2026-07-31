import { describe, expect, it } from 'bun:test';
import { groupPostsByYear } from './group-posts-by-year';
import type { BlogListItem } from '@/types/content';

function makePost(slug: string, pubDate: string): BlogListItem {
  return {
    slug,
    data: {
      title: slug,
      description: '',
      pubDate: new Date(pubDate),
      author: undefined,
      authorName: '',
      tags: [],
      showOnHome: false,
    },
  } as BlogListItem;
}

describe('groupPostsByYear', () => {
  it('groups a date-desc post list into year buckets, newest year first', () => {
    const posts = [
      makePost('weekly-2', '2026-06-30'),
      makePost('charlie', '2026-06-21'),
      makePost('summary', '2025-12-25'),
      makePost('quant-1', '2025-11-25'),
    ];

    const groups = groupPostsByYear(posts);

    expect(groups.map((g) => g.year)).toEqual([2026, 2025]);
    expect(groups[0].posts.map((p) => p.slug)).toEqual(['weekly-2', 'charlie']);
    expect(groups[1].posts.map((p) => p.slug)).toEqual(['summary', 'quant-1']);
  });

  it('keeps the incoming order inside each bucket', () => {
    const posts = [makePost('b', '2026-05-01'), makePost('a', '2026-01-01')];

    expect(groupPostsByYear(posts)[0].posts.map((p) => p.slug)).toEqual(['b', 'a']);
  });

  it('returns an empty list for no posts', () => {
    expect(groupPostsByYear([])).toEqual([]);
  });
});
