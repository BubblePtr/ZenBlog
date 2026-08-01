import type { BlogListItem } from '@/types/content';

export interface YearGroup {
  year: number;
  posts: BlogListItem[];
}

// Input is already sorted date-desc by the blog query; grouping only buckets
// consecutive runs, so bucket order and in-bucket order both come for free.
export function groupPostsByYear(posts: BlogListItem[]): YearGroup[] {
  const groups: YearGroup[] = [];

  for (const post of posts) {
    const year = post.data.pubDate.getFullYear();
    const current = groups[groups.length - 1];

    if (current && current.year === year) {
      current.posts.push(post);
    } else {
      groups.push({ year, posts: [post] });
    }
  }

  return groups;
}
