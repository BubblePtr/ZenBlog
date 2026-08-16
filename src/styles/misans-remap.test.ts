import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'bun:test';
import { buildMisansFacesCss, remapMisansCss } from './misans-remap';

const sample = `
@font-face{font-family:MiSans;font-style:normal;font-weight:330;font-display:swap;src: url('MiSans-Regular.21.woff2') format('woff2');unicode-range:U+4e00-9fff;}
@font-face{font-family:MiSans;font-style:normal;font-weight:380;font-display:swap;src: url('MiSans-Medium.21.woff2') format('woff2');unicode-range:U+4e00-9fff;}
@font-face{font-family:MiSans;font-style:normal;font-weight:520;font-display:swap;src: url('MiSans-Semibold.21.woff2') format('woff2');unicode-range:U+4e00-9fff;}
@font-face{font-family:MiSans;font-style:normal;font-weight:630;font-display:swap;src: url('MiSans-Bold.21.woff2') format('woff2');unicode-range:U+4e00-9fff;}
@font-face{font-family:MiSans;font-style:normal;font-weight:330;font-display:swap;src: url('MiSans-Regular.latin.woff2') format('woff2');unicode-range:U+20-7f;}
@font-face{font-family:MiSans;font-style:normal;font-weight:330;font-display:swap;src: url('MiSans-Regular.latin-ext.woff2') format('woff2');unicode-range:U+100-17f;}
@font-face{font-family:MiSans;font-style:normal;font-weight:330;font-display:swap;src: url('MiSans-Regular.cyrillic.woff2') format('woff2');unicode-range:U+400-4ff;}
@font-face{font-family:MiSans;font-style:normal;font-weight:330;font-display:swap;src: url('MiSans-Regular.vietnamese.woff2') format('woff2');unicode-range:U+1ea0-1ef9;}
`;

describe('remapMisansCss', () => {
  test('remaps Xiaomi optical weights onto CSS 400/500/600/700', () => {
    const css = remapMisansCss(sample);

    expect(css).toContain('font-weight:400');
    expect(css).toContain('font-weight:500');
    expect(css).toContain('font-weight:600');
    expect(css).toContain('font-weight:700');
    expect(css).not.toMatch(/font-weight:330|font-weight:380|font-weight:520|font-weight:630/);
  });

  test('keeps Latin faces so UI Western text renders in MiSans', () => {
    const css = remapMisansCss(sample);

    expect(css).toContain('MiSans-Regular.21.woff2');
    expect(css).toContain('.latin.woff2');
    expect(css).toContain('.latin-ext.woff2');
  });

  test('keeps the generated faces file in sync with the misans package', () => {
    const generated = readFileSync(
      new URL('./misans-faces.generated.css', import.meta.url),
      'utf8',
    );
    const expected = buildMisansFacesCss(
      (weight) =>
        readFileSync(
          new URL(`../../node_modules/misans/lib/Normal/MiSans-${weight}.min.css`, import.meta.url),
          'utf8',
        ),
      (fileName) => `../../node_modules/misans/lib/Normal/${fileName}`,
    );

    expect(generated).toBe(expected);
    expect(generated).toContain('font-weight:400');
    expect(generated).not.toContain('font-weight:330');
    expect(generated).toContain('.latin.woff2');
  });
});
