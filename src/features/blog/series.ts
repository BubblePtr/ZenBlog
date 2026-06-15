export interface SeriesIndexInput {
  id: string;
  series?: string;
  pubDate: Date;
}

export interface SeriesPosition {
  no: number;
  total: number;
}

// Number every post within its series by publication order (oldest = №1), so a
// reader sees a stable volume number. Posts without a series are skipped. The id
// tie-breaks same-day entries to keep numbering deterministic across builds.
export function buildSeriesIndexMap(posts: SeriesIndexInput[]): Map<string, SeriesPosition> {
  const groups = new Map<string, SeriesIndexInput[]>();

  for (const post of posts) {
    if (!post.series) {
      continue;
    }

    const group = groups.get(post.series) ?? [];
    group.push(post);
    groups.set(post.series, group);
  }

  const index = new Map<string, SeriesPosition>();

  for (const group of groups.values()) {
    const ordered = [...group].sort((a, b) => {
      const byDate = a.pubDate.valueOf() - b.pubDate.valueOf();
      return byDate !== 0 ? byDate : a.id.localeCompare(b.id);
    });

    ordered.forEach((post, position) => {
      index.set(post.id, { no: position + 1, total: ordered.length });
    });
  }

  return index;
}
