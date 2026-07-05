import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';

describe('ArticleToc Astro integration', () => {
  test('passes the article toc class through the React className prop', () => {
    const source = readFileSync(new URL('./ArticleToc.astro', import.meta.url), 'utf8');

    expect(source).toContain('className="article-toc"');
  });

  test('keeps the crisp tick sound enabled on article pages', () => {
    const source = readFileSync(new URL('./ArticleToc.astro', import.meta.url), 'utf8');

    expect(source).not.toContain('soundEnabled={false}');
  });
});
