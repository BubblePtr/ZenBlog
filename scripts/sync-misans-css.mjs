/**
 * Rebuild src/styles/misans-faces.generated.css from the misans package.
 * Run after `bun add misans@…`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMisansFacesCss } from '../src/styles/misans-remap.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'src/styles/misans-faces.generated.css');

const css = buildMisansFacesCss(
  (weight) => readFileSync(join(root, `node_modules/misans/lib/Normal/MiSans-${weight}.min.css`), 'utf8'),
  (fileName) => `../../node_modules/misans/lib/Normal/${fileName}`,
);

writeFileSync(outPath, css);
console.log(`wrote ${outPath} (${css.length} bytes)`);
