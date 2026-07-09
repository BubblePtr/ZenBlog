#!/usr/bin/env node
/**
 * Generate display-sized WebP variants for photography originals and upload to R2.
 *
 * Naming: photography/<slug>-w800.webp, photography/<slug>-w1600.webp
 * Matches buildPhotographyImageVariants() in src/features/photography/.
 *
 * Usage:
 *   node scripts/generate-photography-variants.mjs --bucket=blog-images
 *   node scripts/generate-photography-variants.mjs --bucket=blog-images --dry-run
 *   node scripts/generate-photography-variants.mjs --bucket=blog-images --skip-existing=false
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const CDN_ORIGIN = 'https://cdn.ninthbit.org';
const CONTENT_DIR = 'src/content/photography';
const WIDTHS = [800, 1600];
const DEFAULT_BUCKET = 'blog-images';
const DEFAULT_SKIP_EXISTING = true;
const DEFAULT_REMOTE = true;

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [rawKey, rawValue] = arg.slice(2).split('=');
    if (!rawKey) continue;
    args[rawKey.trim()] = rawValue === undefined ? 'true' : rawValue.trim();
  }
  return args;
}

function parseBool(value, fallback) {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio ?? 'inherit',
      cwd: options.cwd ?? process.cwd(),
      env: options.env ?? process.env,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`命令失败: ${command} ${args.join(' ')}`));
    });
  });
}

function runCommandCapture(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => {
      stdout += c.toString();
    });
    child.stderr.on('data', (c) => {
      stderr += c.toString();
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

async function listPhotographyImageUrls(contentDir) {
  const files = await fs.readdir(contentDir);
  const urls = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const text = await fs.readFile(path.join(contentDir, file), 'utf8');
    const match = text.match(/^image:\s*(https?:\/\/\S+)/m);
    if (match) urls.push(match[1].trim());
  }

  return [...new Set(urls)];
}

function stemFromCdnUrl(urlString) {
  const url = new URL(urlString);
  if (url.host !== 'cdn.ninthbit.org') {
    throw new Error(`非 CDN 图片，跳过: ${urlString}`);
  }
  const pathname = decodeURIComponent(url.pathname);
  if (!pathname.startsWith('/photography/')) {
    throw new Error(`非 photography 路径: ${urlString}`);
  }
  const fileName = pathname.slice('/photography/'.length);
  const withoutExt = fileName.replace(/\.[^.]+$/, '');
  return withoutExt.replace(/-w\d+$/i, '');
}

async function downloadFile(url, dest) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`下载失败 ${response.status}: ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(dest, buffer);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`\n用法:\n  node scripts/generate-photography-variants.mjs --bucket=${DEFAULT_BUCKET}\n\n选项:\n  --bucket=blog-images\n  --dry-run\n  --skip-existing=true|false\n  --remote=true|false\n  --wrangler-bin=bunx\n`);
    return;
  }

  const bucket = args.bucket || DEFAULT_BUCKET;
  const isDryRun = Object.prototype.hasOwnProperty.call(args, 'dry-run')
    ? args['dry-run'] !== 'false'
    : false;
  const skipExisting = parseBool(args['skip-existing'], DEFAULT_SKIP_EXISTING);
  const remote = parseBool(args.remote, DEFAULT_REMOTE);
  const wranglerBin = args['wrangler-bin'] || 'bunx';
  const wranglerPrefix = wranglerBin === 'bunx' || wranglerBin === 'npx' ? ['wrangler'] : [];

  const runWrangler = async (wranglerSubArgs, { capture = false } = {}) => {
    const fullArgs = [...wranglerPrefix, ...wranglerSubArgs];
    if (capture) return runCommandCapture(wranglerBin, fullArgs);
    return runCommand(wranglerBin, fullArgs);
  };

  async function exists(key) {
    const checkFile = path.join(os.tmpdir(), `zb-r2-check-${Date.now()}-${Math.random()}.bin`);
    const cmdArgs = ['r2', 'object', 'get', `${bucket}/${key}`, `--file=${checkFile}`];
    if (remote) cmdArgs.push('--remote');
    const result = await runWrangler(cmdArgs, { capture: true });
    await fs.unlink(checkFile).catch(() => {});
    return result.code === 0;
  }

  async function put(key, filePath) {
    const cmdArgs = [
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      `--file=${filePath}`,
      '--content-type=image/webp',
    ];
    if (remote) cmdArgs.push('--remote');
    await runWrangler(cmdArgs);
  }

  const urls = await listPhotographyImageUrls(CONTENT_DIR);
  console.log(`发现 ${urls.length} 张摄影原图`);
  console.log(`目标 bucket: ${bucket}  dry-run=${isDryRun}  skip-existing=${skipExisting}`);

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zb-photo-variants-'));
  let uploaded = 0;
  let skipped = 0;

  try {
    for (const url of urls) {
      const stem = stemFromCdnUrl(url);
      console.log(`\n→ ${stem}`);

      const originalPath = path.join(tempDir, `${stem}.jpg`);
      if (!isDryRun) {
        process.stdout.write('  下载原图… ');
        await downloadFile(url, originalPath);
        const stat = await fs.stat(originalPath);
        console.log(`${(stat.size / 1024 / 1024).toFixed(1)} MB`);
      } else {
        console.log(`  [dry-run] 将下载 ${url}`);
      }

      for (const width of WIDTHS) {
        const key = `photography/${stem}-w${width}.webp`;
        const outPath = path.join(tempDir, `${stem}-w${width}.webp`);
        const publicUrl = `${CDN_ORIGIN}/${key}`;

        if (skipExisting && !isDryRun) {
          const already = await exists(key);
          if (already) {
            console.log(`  skip ${key} (已存在)`);
            skipped += 1;
            continue;
          }
        }

        if (isDryRun) {
          console.log(`  [dry-run] magick → ${key} → ${publicUrl}`);
          continue;
        }

        const quality = width <= 800 ? '78' : '80';
        await runCommand('magick', [
          originalPath,
          '-resize',
          `${width}x`,
          '-quality',
          quality,
          outPath,
        ]);
        const outStat = await fs.stat(outPath);
        console.log(`  生成 ${key} (${(outStat.size / 1024).toFixed(0)} KB)`);
        await put(key, outPath);
        console.log(`  上传完成 ${publicUrl}`);
        uploaded += 1;
      }
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }

  console.log(`\n完成: uploaded=${uploaded} skipped=${skipped}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
