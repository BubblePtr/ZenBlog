import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';

const typography = readFileSync(new URL('./typography.css', import.meta.url), 'utf8');
const baseHead = readFileSync(new URL('../components/BaseHead.astro', import.meta.url), 'utf8');
const postLayout = readFileSync(
  new URL('../features/blog/components/BlogPostLayout.astro', import.meta.url),
  'utf8',
);

function themeBlock(name: string): string {
  const match = typography.match(new RegExp(`${name}:([^;]+);`));
  if (!match) {
    throw new Error(`Missing ${name} in typography.css`);
  }
  return match[1];
}

describe('Chinese typeface', () => {
  test('puts MiSans first in the sans stack so UI Latin and CJK share one face', () => {
    const stack = themeBlock('--font-sans-stack');

    expect(stack).toContain("'MiSans'");
    expect(stack.trimStart().startsWith("'MiSans'")).toBe(true);
  });

  test('keeps Chinese article titles on the Noto Serif SC stack', () => {
    expect(themeBlock('--font-serif-stack')).toContain("'Noto Serif SC'");
    expect(themeBlock('--font-article-title')).toContain('--font-serif-stack');
    expect(themeBlock('--font-article-title')).not.toContain('--font-sans-stack');
  });

  test('loads MiSans for UI/body and Noto Serif SC for Chinese titles', () => {
    expect(baseHead).toContain('MiSans');
    expect(baseHead).toContain('Noto+Serif+SC');
  });

  test('applies the article-title token to Chinese post titles and standfirsts', () => {
    expect(postLayout).toContain("lang === 'zh' ? 'font-family: var(--font-article-title)'");
  });
});
