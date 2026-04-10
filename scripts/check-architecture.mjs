import fs from 'fs/promises';
import path from 'path';

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, 'src');

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.astro', '.js', '.mjs']);
const violations = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function classifyPath(filePath) {
  const relative = path.relative(srcRoot, filePath).replaceAll('\\\\', '/');
  const segments = relative.split('/');

  if (segments[0] === 'pages') {
    return { layer: 'pages', group: 'pages', relative };
  }

  if (segments[0] === 'shared') {
    return { layer: 'shared', group: 'shared', relative };
  }

  if (segments[0] === 'features') {
    return {
      layer: 'features',
      group: `features/${segments[1] ?? ''}`,
      feature: segments[1] ?? '',
      relative,
    };
  }

  return { layer: 'other', group: 'other', relative };
}

function resolveImport(importer, specifier) {
  if (specifier.startsWith('@/')) {
    return path.join(srcRoot, specifier.slice(2));
  }

  if (specifier.startsWith('.')) {
    return path.resolve(path.dirname(importer), specifier);
  }

  return null;
}

function checkRule(importer, imported, specifier) {
  if (imported === null) return;

  const from = classifyPath(importer);
  const to = classifyPath(imported);

  if (from.layer === 'shared' && (to.layer === 'features' || to.layer === 'pages')) {
    violations.push({
      type: 'shared-boundary',
      importer: from.relative,
      imported: to.relative,
      specifier,
      message: '`shared` 不能依赖 `features/pages`',
    });
  }

  if (from.layer === 'features' && to.layer === 'features' && from.feature !== to.feature) {
    violations.push({
      type: 'cross-feature',
      importer: from.relative,
      imported: to.relative,
      specifier,
      message: '`features` 之间禁止直接跨特性依赖',
    });
  }
}

function extractImports(source) {
  const matches = [];
  const pattern = /(import|export)\\s+[^'"]*?from\\s+['"]([^'"]+)['"]/g;

  let match = pattern.exec(source);
  while (match) {
    matches.push(match[2]);
    match = pattern.exec(source);
  }

  return matches;
}

async function run() {
  const files = await walk(srcRoot);

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const imports = extractImports(content);

    for (const specifier of imports) {
      const resolved = resolveImport(file, specifier);
      checkRule(file, resolved, specifier);
    }
  }

  if (violations.length > 0) {
    console.error('❌ 架构边界检查失败：');
    for (const violation of violations) {
      console.error(`- ${violation.message}`);
      console.error(`  文件: ${violation.importer}`);
      console.error(`  导入: ${violation.specifier} -> ${violation.imported}`);
    }
    process.exit(1);
  }

  console.log('✅ 架构边界检查通过');
}

run().catch((error) => {
  console.error('架构检查执行失败:', error);
  process.exit(1);
});
