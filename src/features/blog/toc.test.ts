import { describe, expect, test } from 'bun:test';
import { extractMarkdownHeadings } from '../../remark/extract-markdown-headings.mjs';
import { shouldShowToc } from '@/features/blog/toc';

describe('extractMarkdownHeadings', () => {
  test('extracts h2 and h3 with anchor-compatible slugs', () => {
    const markdown = `
## 1. 确定选题
Some text
### 4.1 如何使用 YouMind 迭代一个想要的公众号改写 prompt
#### 4.1.1 收集顶流的爆款文章
## 2. 生成调查报告
`;

    expect(extractMarkdownHeadings(markdown)).toEqual([
      {
        slug: 'choose-your-topic',
        text: '1. 确定选题',
        depth: 2,
      },
      {
        slug: 'use-youmind-iterate-wechat-rewriting-prompt',
        text: '4.1 如何使用 YouMind 迭代一个想要的公众号改写 prompt',
        depth: 3,
      },
      {
        slug: 'generate-research-report',
        text: '2. 生成调查报告',
        depth: 2,
      },
    ]);
  });
});

describe('shouldShowToc', () => {
  test('requires at least two headings', () => {
    expect(shouldShowToc([{ slug: 'a', text: 'A', depth: 2 }])).toBe(false);
    expect(
      shouldShowToc([
        { slug: 'a', text: 'A', depth: 2 },
        { slug: 'b', text: 'B', depth: 2 },
      ]),
    ).toBe(true);
  });
});
