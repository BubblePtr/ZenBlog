/** Xiaomi ships optical weights (330/380/520/630). Map them onto the
 *  site's 400/500/600/700 scale so `font-medium` / `font-semibold` hit
 *  the intended cut instead of the nearest odd number. */
const WEIGHT_REMAP: Record<string, string> = {
  '330': '400',
  '380': '500',
  '520': '600',
  '630': '700',
};

export const MISANS_WEIGHT_FILES = ['Regular', 'Medium', 'Semibold', 'Bold'] as const;

export function remapMisansCss(css: string): string {
  return css.replace(
    /font-weight:(330|380|520|630)/g,
    (_match, weight: string) => `font-weight:${WEIGHT_REMAP[weight]}`,
  );
}

/** Rewrite package-relative `url('file.woff2')` to a path Vite can emit. */
export function buildMisansFacesCss(
  readWeightCss: (weight: (typeof MISANS_WEIGHT_FILES)[number]) => string,
  urlFor: (fileName: string) => string,
): string {
  return MISANS_WEIGHT_FILES.map((weight) =>
    remapMisansCss(readWeightCss(weight)).replace(
      /url\('([^']+)'\)/g,
      (_match, fileName: string) => `url('${urlFor(fileName)}')`,
    ),
  ).join('\n');
}
