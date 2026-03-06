#!/usr/bin/env node
import fs from 'fs/promises';
import syncFs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const bubbleBuildDir = resolveBubbleBuildDir();
const bubbleEntryPath = process.env.BUBBLE_ENTRY_PATH?.trim();
const bubbleOverwrite = process.env.BUBBLE_OVERWRITE === 'true';
const outputDir = path.join(projectRoot, 'src', 'content', 'blog', 'zh', 'openclaw');

async function main() {
  await assertDirectoryExists(bubbleBuildDir, 'BUBBLE_BUILD_DIR');
  await fs.mkdir(outputDir, { recursive: true });

  const publishedExternalIds = await collectPublishedExternalIds(outputDir);
  const entryFile = await findTargetEntry({
    bubbleBuildDir,
    bubbleEntryPath,
    publishedExternalIds,
    overwrite: bubbleOverwrite,
  });

  if (entryFile === null) {
    log('No unpublished Bubble entry found.');
    setOutput('changed', 'false');
    setOutput('entry_id', '');
    setOutput('output_path', '');
    return;
  }

  const entry = await readEntry(entryFile, bubbleBuildDir);
  const targetFile = path.join(outputDir, `${entry.date}.mdx`);
  const nextContent = renderMdx(entry);
  const previousContent = await readOptionalFile(targetFile);

  if (!bubbleOverwrite && previousContent === nextContent) {
    log(`Entry already synchronized: ${path.relative(projectRoot, targetFile)}`);
    setOutput('changed', 'false');
    setOutput('entry_id', entry.entryId);
    setOutput('output_path', path.relative(projectRoot, targetFile));
    return;
  }

  await fs.writeFile(targetFile, nextContent, 'utf8');

  log(`Synchronized Bubble entry to ${path.relative(projectRoot, targetFile)}`);
  setOutput('changed', previousContent !== nextContent ? 'true' : 'false');
  setOutput('entry_id', entry.entryId);
  setOutput('output_path', path.relative(projectRoot, targetFile));
}

function resolveBubbleBuildDir() {
  const configured = process.env.BUBBLE_BUILD_DIR?.trim();

  if (configured) {
    return path.resolve(projectRoot, configured);
  }

  return path.join(projectRoot, '.tmp', 'bubble-build');
}

async function assertDirectoryExists(dirPath, envName) {
  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      throw new Error(`${envName} is not a directory: ${dirPath}`);
    }
  } catch (error) {
    throw new Error(`${envName} directory not found: ${dirPath}`, { cause: error });
  }
}

async function collectPublishedExternalIds(dirPath) {
  const externalIds = new Set();
  const files = await listFiles(dirPath, '.mdx');

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const match = content.match(/^externalId:\s*["']?(.+?)["']?\s*$/m);
    if (match) {
      externalIds.add(match[1]);
    }
  }

  return externalIds;
}

async function findTargetEntry({ bubbleBuildDir, bubbleEntryPath, publishedExternalIds, overwrite }) {
  if (bubbleEntryPath) {
    const candidate = path.isAbsolute(bubbleEntryPath)
      ? bubbleEntryPath
      : path.join(bubbleBuildDir, bubbleEntryPath);

    const entry = await readEntry(candidate, bubbleBuildDir);
    if (!overwrite && publishedExternalIds.has(entry.entryId)) {
      return null;
    }

    return candidate;
  }

  const entriesDir = path.join(bubbleBuildDir, 'entries');
  const files = await listFiles(entriesDir, '.json');
  const ordered = files.sort((left, right) => left.localeCompare(right));

  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    const candidate = ordered[index];
    const entry = await readEntry(candidate, bubbleBuildDir);
    if (overwrite || !publishedExternalIds.has(entry.entryId)) {
      return candidate;
    }
  }

  return null;
}

async function readEntry(filePath, bubbleBuildDir) {
  const raw = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(raw);
  const normalized = normalizeEntry(data);

  if (!normalized.isValid) {
    const relativePath = path.relative(bubbleBuildDir, filePath);
    throw new Error(`Invalid Bubble entry at ${relativePath}: ${normalized.error}`);
  }

  return normalized.entry;
}

function normalizeEntry(data) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { isValid: false, error: 'payload must be an object' };
  }

  const entryId = normalizeString(data.entry_id);
  const date = normalizeString(data.date);
  const title = normalizeString(data.title) || (date ? `Bubble 的成长记录 ${date}` : '');
  const summary = normalizeString(data.summary);
  const contentMarkdown = normalizeMarkdown(data.content_markdown);
  const tags = normalizeTags(data.tags);
  const createdAt = normalizeString(data.created_at);
  const mood = normalizeString(data.mood);

  if (!entryId) {
    return { isValid: false, error: 'entry_id is required' };
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { isValid: false, error: 'date must be YYYY-MM-DD' };
  }

  if (!title) {
    return { isValid: false, error: 'title is required' };
  }

  if (!contentMarkdown) {
    return { isValid: false, error: 'content_markdown is required' };
  }

  return {
    isValid: true,
    entry: {
      entryId,
      date,
      title,
      summary: summary || buildSummary(contentMarkdown),
      contentMarkdown,
      tags,
      createdAt,
      mood,
    },
  };
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeTags(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeMarkdown(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const withoutFrontmatter = value.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');

  return withoutFrontmatter
    .replace(/^import\s.+$/gm, '')
    .replace(/^export\s.+$/gm, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .trim();
}

function buildSummary(contentMarkdown) {
  const plainText = contentMarkdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*?\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) {
    return 'Bubble 今天写下了一篇新的成长记录。';
  }

  return plainText.slice(0, 120);
}

async function listFiles(dirPath, extension) {
  const files = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath, extension)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function readOptionalFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

function renderMdx(entry) {
  const frontmatterLines = [
    '---',
    `title: ${serializeYamlString(entry.title)}`,
    `description: ${serializeYamlString(entry.summary)}`,
    `pubDate: ${serializeYamlString(entry.date)}`,
    'lang: "zh"',
    'source: "openclaw"',
    'series: "bubble-build"',
    `externalId: ${serializeYamlString(entry.entryId)}`,
    `showOnHome: ${entry.mood === 'milestone' ? 'true' : 'false'}`,
    `tags: ${JSON.stringify(entry.tags)}`,
    'author:',
    '  name: "Bubble"',
    '  title: "OpenClaw Daily Growth Log"',
    '---',
    '',
  ];

  return `${frontmatterLines.join('\n')}${entry.contentMarkdown.trim()}\n`;
}

function serializeYamlString(value) {
  return JSON.stringify(value ?? '');
}

function setOutput(key, value) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) {
    return;
  }

  syncFs.appendFileSync(outputPath, `${key}=${value}\n`);
}

function log(message) {
  console.log(`[bubble-sync] ${message}`);
}

main().catch((error) => {
  console.error('[bubble-sync] Synchronization failed:', error);
  process.exit(1);
});
