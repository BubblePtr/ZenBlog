#!/usr/bin/env node
/**
 * Migrate LLM Wiki markdown files to ZenBlog Astro content collection.
 *
 * Source: ~/wiki/{entities,concepts,comparisons,queries}/*.md
 * Target: src/content/wiki/{slug}.mdx
 *
 * Transformations:
 *  1. [[wikilinks]] → <WikiLink slug="..." />  (plain link variant)
 *  2. [[slug|label]] → <WikiLink slug="..." label="..." />
 *  3. Frontmatter mapped to wiki collection schema
 *  4. Strip the leading H1 (remark plugin will handle this, but keep it clean)
 */

import fs from 'fs';
import path from 'path';

const homeDir = process.env.HOME ?? process.env.USERPROFILE ?? '.';
const WIKI_SRC = process.env.WIKI_SRC || path.join(homeDir, 'wiki');
const WIKI_DEST = path.resolve('src/content/wiki');

const WIKILINK_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;

function slugify(filename) {
  return filename.replace(/\.md$/, '').replace(/\.mdx$/, '');
}

function convertWikilinks(body) {
  return body.replace(WIKILINK_RE, (_, slug, label) => {
    const trimmedSlug = slug.trim();
    const displayLabel = label ? label.trim() : '';
    if (displayLabel) {
      return `<WikiLink slug="${trimmedSlug}" label="${displayLabel}" />`;
    }
    return `<WikiLink slug="${trimmedSlug}" />`;
  });
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };

  const [, fmRaw, body] = match;
  const data = {};
  for (const line of fmRaw.split('\n')) {
    const m = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (!m) continue;
    const [, key, val] = m;
    // Parse arrays [a, b, c]
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
    } else {
      data[key] = val.trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return { data, body };
}

function transformFrontmatter(data) {
  const fm = {
    title: data.title || '',
    created: data.created || '',
    updated: data.updated || '',
    type: data.type || 'concept',
    tags: data.tags || [],
    confidence: data.confidence || undefined,
    contested: data.contested === 'true' ? true : undefined,
  };
  // Remove undefined keys
  Object.keys(fm).forEach((k) => fm[k] === undefined && delete fm[k]);
  return fm;
}

function stringifyFrontmatter(fm) {
  let out = '---\n';
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v)) {
      out += `${k}: [${v.map((x) => `"${x}"`).join(', ')}]\n`;
    } else if (typeof v === 'string') {
      // Quote strings that look like dates or contain special chars
      out += `${k}: "${v}"\n`;
    } else {
      out += `${k}: ${v}\n`;
    }
  }
  out += '---\n';
  return out;
}

// Main
if (fs.existsSync(WIKI_DEST)) {
  console.log(`Removing existing ${WIKI_DEST}...`);
  fs.rmSync(WIKI_DEST, { recursive: true });
}
fs.mkdirSync(WIKI_DEST, { recursive: true });

const dirs = ['entities', 'concepts', 'comparisons', 'queries'];
let count = 0;
const slugMap = new Map(); // track duplicate slugs

for (const dir of dirs) {
  const srcDir = path.join(WIKI_SRC, dir);
  if (!fs.existsSync(srcDir)) continue;

  for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(srcDir, file), 'utf-8');
    const { data, body } = parseFrontmatter(raw);
    const baseSlug = slugify(file);

    // Handle potential slug collisions
    let slug = baseSlug;
    if (slugMap.has(slug)) {
      console.warn(`  Duplicate slug "${slug}", keeping first.`);
      continue;
    }
    slugMap.set(slug, true);

    const fm = transformFrontmatter(data);
    const convertedBody = convertWikilinks(body);
    const output = stringifyFrontmatter(fm) + '\n' + convertedBody;

    fs.writeFileSync(path.join(WIKI_DEST, `${slug}.mdx`), output);
    count++;
  }
}

console.log(`Migrated ${count} wiki pages to ${WIKI_DEST}`);
