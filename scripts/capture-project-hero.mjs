#!/usr/bin/env node
/**
 * Capture a project hero shot: resize a window, screenshot it, and compose
 * it onto a 4:3 canvas dyed with the project's cover color.
 *
 * Two targets (DESIGN.md v3 §5.1 实物卡封面):
 *   --app="Pace"                                  native app window
 *   --url="https://…" [--browser="Google Chrome"] browser window, chrome included
 *
 * Usage:
 *   node scripts/capture-project-hero.mjs --app="Pace" --cover=indigo
 *   node scripts/capture-project-hero.mjs --url="https://subworth.vercel.app" --cover=dai
 *   node scripts/capture-project-hero.mjs --app="Voily" --cover=vermilion --out=tmp/voily.png
 *
 * Options:
 *   --mode=canvas  canvas（默认）：cover 色画布 = 卡片同比例（200:156），三面留白
 *                  （上/左右）、底部出血，与卡片染纸边带的三面设计一致。
 *                  fill：窗口调成卡片图像区同比例，截满整个封面位，颜色框
 *                  只剩卡片自带的 12px 染纸边带。
 *   --margin=0.10  canvas 模式三面留白（画布宽的比例），可调 0.12 / 0.15
 *   --cover=name   vermilion | ochre | gamboge | indigo | dai（canvas 模式用，默认 ochre）
 *   --bg=#hex      覆盖画布色，跳过 cover 映射
 *   --win=WxH      窗口大小（点），默认自动匹配留白框 / 卡片比例（高 900）
 *   --canvas=WxH   画布大小（像素），默认 1600x1248（卡片同比例）
 *   --wait=ms      打开后等待加载的时间，url 默认 4000，app 默认 1500
 *   --out=path     输出 PNG，默认 src/content/projects/images/<名>-hero.png
 *
 * 实现：System Events 调窗口大小并读回实际 bounds → screencapture -R 按
 * 区域截屏 → sharp 圆角 + 合成投影 + 贴到 cover 色画布。
 *
 * 需要授权（系统设置 → 隐私与安全性）：
 *   - 「辅助功能 / 自动化」：用于调整窗口大小（System Events）
 *   - 「屏幕录制」：screencapture 区域截屏
 * 首次运行系统会弹窗授权，授权后重跑即可。截浏览器时建议先藏掉书签栏
 * 和无关标签页——外壳会一起进图。
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

// 封面色的高彩画布变体（DESIGN.md §2.3 五色，同色相提饱和度，
// 与卡片 18% 染纸边带同族，内鲜外素）。oklch → sRGB 在脚本内换算。
const COVER_CANVAS = {
  vermilion: [0.58, 0.19, 33],
  ochre: [0.64, 0.15, 68],
  gamboge: [0.82, 0.15, 92],
  indigo: [0.56, 0.17, 263],
  dai: [0.52, 0.09, 252],
};

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [rawKey, ...rest] = arg.slice(2).split('=');
    if (!rawKey) continue;
    args[rawKey] = rest.length ? rest.join('=') : true;
  }
  return args;
}

function kebab(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseSize(s, fallback) {
  if (!s) return fallback;
  const m = String(s).match(/^(\d+)x(\d+)$/);
  if (!m) throw new Error(`尺寸格式应为 WxH，收到：${s}`);
  return { w: Number(m[1]), h: Number(m[2]) };
}

/** oklch → 8-bit sRGB（OKLab 矩阵，越界通道截断） */
function oklchToHex([L, C, H]) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const gam = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
  const ch = lin.map((x) => Math.min(255, Math.max(0, Math.round(gam(Math.min(1, Math.max(0, x))) * 255))));
  return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function runJxa(source) {
  return execFileSync('osascript', ['-l', 'JavaScript', '-e', source], { encoding: 'utf8' }).trim();
}

/** 调整目标进程主窗口大小并居中，返回实际 bounds（应用可能钳制尺寸）。 */
function arrangeWindow(owner, { w, h }) {
  const script = `
    ObjC.import('AppKit');
    const screen = $.NSScreen.mainScreen.frame;
    const sw = screen.size.width, sh = screen.size.height;
    const x = Math.round((sw - ${w}) / 2);
    const y = Math.round((sh - ${h}) / 2);
    const se = Application('System Events');
    const proc = se.processes.byName(${JSON.stringify(owner)});
    if (!proc.exists()) throw new Error('process not found: ${owner}');
    const win = proc.windows[0];
    if (!win) throw new Error('no window: ${owner}');
    win.size = [${w}, ${h}];
    win.position = [x, y];
    win.position = [x, y];
    // 区域截屏是屏幕矩形，同进程其它窗口可能叠进画面：全部最小化
    const wins = proc.windows();
    for (let i = 1; i < wins.length; i++) {
      try { wins[i].attributes.byName('AXMinimized').value = true; } catch (e) {}
    }
    // 显式把目标窗口抬到最前——其它进程的窗口可能同位置叠在上面
    proc.frontmost = true;
    try { win.actions.byName('AXRaise').perform(); } catch (e) {}
    const pos = win.position();
    const size = win.size();
    JSON.stringify({ x: pos[0], y: pos[1], w: size[0], h: size[1] });
  `;
  return JSON.parse(runJxa(script));
}

/** 按 bounds 区域截屏（点数坐标，retina 自动 2x）。 */
function captureRegion({ x, y, w, h }, dest) {
  execFileSync('screencapture', ['-x', '-R', `${x},${y},${w},${h}`, dest]);
  if (!fs.existsSync(dest) || fs.statSync(dest).size < 10_000) {
    throw new Error('截图为空：多半是「屏幕录制」权限没开，授权后重跑。');
  }
}

/** 卡片图像区比例：卡宽 240−16，封面区 4:3，内边距 12px 上/左右 → 200×156 */
const CARD_RATIO = 200 / 156;
/** 输出宽度（像素）：详情页 640 CSS px × 2 retina 有富余，卡片更远够用 */
const OUT_WIDTH = 1600;

/** fill 模式：截屏裁到卡片同比例（顶对齐，和卡片 object-position: top 一致），
 *  缩到 1600 宽，四角按 macOS 窗口圆角出透明（透出卡片染纸边带）。 */
async function composeFill(shotPath, bounds, out) {
  const img = sharp(shotPath);
  const meta = await img.metadata();
  const ratio = meta.width / meta.height;
  let extract;
  if (ratio > CARD_RATIO) {
    // 太宽（窗口被钳矮了）：对称裁两侧
    const w = Math.round(meta.height * CARD_RATIO);
    extract = { left: Math.round((meta.width - w) / 2), top: 0, width: w, height: meta.height };
  } else {
    // 太高：从底部裁
    const h = Math.round(meta.width / CARD_RATIO);
    extract = { left: 0, top: 0, width: meta.width, height: h };
  }

  const outH = Math.round(OUT_WIDTH / CARD_RATIO);
  const radius = Math.max(6, Math.round((10 * OUT_WIDTH) / bounds.w)); // 窗口圆角约 10pt
  const mask = Buffer.from(
    `<svg width="${OUT_WIDTH}" height="${outH}"><rect width="${OUT_WIDTH}" height="${outH}" rx="${radius}" fill="#fff"/></svg>`,
  );

  fs.mkdirSync(path.dirname(out), { recursive: true });
  await img
    .extract(extract)
    .resize({ width: OUT_WIDTH, height: outH, fit: 'fill' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(out);
}

/** canvas 模式：cover 色画布 = 卡片同比例，三面留白（上/左右，默认宽度的 10%）、
 *  底部出血——和卡片染纸边带的三面设计（padding: 12px 12px 0）一致。
 *  窗口圆角 + 投影后贴在留白框内，底边与画布底齐平。 */
async function compose(shotPath, bounds, bg, canvas, margin, out) {
  const m = Math.round(canvas.w * margin);
  const boxW = canvas.w - 2 * m;
  const boxH = canvas.h - m; // 底部无留白：窗口底边与画布底齐平
  const radius = Math.max(6, Math.round((10 * boxW) / bounds.w)); // macOS 窗口圆角约 10pt

  const mask = Buffer.from(
    `<svg width="${boxW}" height="${boxH}"><rect width="${boxW}" height="${boxH}" rx="${radius}" fill="#fff"/></svg>`,
  );
  const shot = await sharp(shotPath)
    .resize({ width: boxW, height: boxH, fit: 'cover', position: 'top' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 投影：黑色圆角矩形高斯模糊，向下偏 12px（光从上方来）；底部出血部分被画布裁掉。
  // pad 受画布剩余高度约束，保证阴影层不超过画布尺寸
  const pad = Math.max(40, Math.min(120, Math.floor((canvas.h - boxH) / 2)));
  const shadowSvg = Buffer.from(
    `<svg width="${boxW + pad * 2}" height="${boxH + pad * 2}"><rect x="${pad}" y="${pad}" width="${boxW}" height="${boxH}" rx="${radius}" fill="rgba(0,0,0,0.3)"/></svg>`,
  );
  const shadow = await sharp(shadowSvg).blur(30).png().toBuffer();

  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp({
    create: { width: canvas.w, height: canvas.h, channels: 4, background: bg },
  })
    .composite([
      { input: shadow, left: m - pad, top: m - pad + 12 },
      { input: shot, left: m, top: m },
    ])
    .png()
    .toFile(out);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { app, url } = args;
  const browser = args.browser || 'Safari';
  if (!app && !url) {
    console.error('用法：--app="应用名" 或 --url="https://…" [--browser="Google Chrome"]，详见脚本头注释。');
    process.exit(1);
  }

  const cover = args.cover || 'ochre';
  const mode = args.mode || 'fill';
  if (mode !== 'fill' && mode !== 'canvas') {
    console.error(`未知 mode：${mode}（fill / canvas）`);
    process.exit(1);
  }
  const bg = args.bg || (COVER_CANVAS[cover] ? oklchToHex(COVER_CANVAS[cover]) : null);
  if (mode === 'canvas' && !bg) {
    console.error(`未知 cover：${cover}（可选 ${Object.keys(COVER_CANVAS).join(' / ')}，或用 --bg=#hex）`);
    process.exit(1);
  }

  // canvas 模式：画布 = 卡片同比例，三面留白（上/左右，按画布宽的比例换算等宽像素，
  // 底部出血）；窗口默认调成留白框的比例
  const margin = Number(args.margin ?? 0.1);
  const canvas = parseSize(args.canvas, { w: OUT_WIDTH, h: Math.round(OUT_WIDTH / CARD_RATIO) });
  const mPx = Math.round(canvas.w * margin);
  const boxRatio = (canvas.w - 2 * mPx) / (canvas.h - mPx);
  const win = parseSize(
    args.win,
    mode === 'fill' ? { w: 1154, h: 900 } : { w: Math.round(900 * boxRatio), h: 900 },
  );
  const wait = Number(args.wait ?? (url ? 4000 : 1500));
  const owner = app || browser;
  const name = kebab(app || new URL(url).hostname.replace(/^www\./, ''));
  const out = args.out || path.join('src/content/projects/images', `${name}-hero.png`);

  // 1. 打开目标。浏览器用 AppleScript 在同一实例里开新窗口——open -n 会
  // 起多个同名实例，System Events 按名只能寻址一个，其它实例的窗口会叠进截图
  if (app) {
    execFileSync('open', ['-a', app]);
  } else if (/^safari/i.test(browser)) {
    // 先关掉残留窗口（这台机器的 Safari 只用于本脚本），保证屏幕上只有一个
    // Safari 窗口，区域截屏不会叠进旧窗口
    execFileSync('osascript', [
      '-e',
      'tell application "Safari" to close every window',
      '-e',
      `tell application "Safari" to make new document with properties {URL:${JSON.stringify(url)}}`,
      '-e',
      'tell application "Safari" to activate',
    ]);
  } else {
    // Chrome 系：make new window 后给活动标签设 URL
    execFileSync('osascript', [
      '-e',
      `tell application ${JSON.stringify(browser)}
        set w to make new window
        set URL of active tab of w to ${JSON.stringify(url)}
        activate
      end tell`,
    ]);
  }
  await new Promise((r) => setTimeout(r, wait));

  // 2. 调窗口大小并居中，读回实际 bounds
  let bounds;
  try {
    bounds = arrangeWindow(owner, win);
  } catch (e) {
    console.error(`调整窗口失败：${e.message}`);
    console.error('请在 系统设置 → 隐私与安全性 → 辅助功能/自动化 中允许终端控制后重跑。');
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 700));

  // 3. 区域截屏 + 4. 合成
  const tmp = path.join(os.tmpdir(), `hero-capture-${process.pid}.png`);
  try {
    captureRegion(bounds, tmp);
    if (mode === 'fill') {
      await composeFill(tmp, bounds, out);
    } else {
      await compose(tmp, bounds, bg, canvas, margin, out);
    }
  } finally {
    fs.rmSync(tmp, { force: true });
  }

  const detail =
    mode === 'fill'
      ? `输出 ${OUT_WIDTH}x${Math.round(OUT_WIDTH / CARD_RATIO)}（卡片同比例），窗口 ${bounds.w}x${bounds.h}pt`
      : `画布 ${canvas.w}x${canvas.h}（卡片同比例），边距 ${Math.round(margin * 100)}%，底色 ${bg} / ${cover}，窗口 ${bounds.w}x${bounds.h}pt`;
  console.log(`✓ ${out}（${detail}）`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
