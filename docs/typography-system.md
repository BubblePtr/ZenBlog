# 字体系统文档

## 概述

本博客的字体定义集中在 `typography.css` 的 `@theme` 块中。中文无衬线加载 **MiSans**（小米，仅 CJK `unicode-range`），中文文章标题走 Noto Serif SC，英文阅读态走 Source Serif 4：

- ✅ **单一数据源**：所有字体定义集中在 `typography.css` 的 `@theme` 块中
- ✅ **界面中西文统一**：MiSans 同时覆盖拉丁字母和汉字，避免各系统默认黑体不一致
- ✅ **衬线只用于文章标题**（中文 Noto Serif SC）以及英文正文（Source Serif 4）

## 架构

```
src/
├── config/
│   └── fonts.ts              # OG 图片专用常量
├── styles/
│   ├── typography.css        # 单一数据源（@theme）
│   └── global.css            # 导入 typography.css
└── components/
    └── **/*.tsx              # 使用 font-heading、font-body 等
```

## 字体方案

| 场景 | 字体类型 | 字号 | 字重 | Tailwind 类 |
|------|---------|------|------|-------------|
| 文章大标题 (H1) | 中文 Noto Serif SC / 英文 Source Serif 4 | 40px | 700 | `font-article-title` / `font-serif-en` |
| 正文中的标题 (H2/H3/H4) | 无衬线 | 26px | 400 | `font-heading` |
| 正文段落 | 中文 MiSans / 英文衬线 | 16px | 400 | `font-body` |
| 正文加粗 (strong/b) | 无衬线 | 17px | 400 | - |
| UI 元素 | 无衬线 | 14-16px | 400-500 | `font-ui` |
| 代码 | 等宽 | 14px | 400 | `font-mono` |

## 字体栈配置

### 无衬线字体栈

用于 UI、标题、正文等。

```css
--font-sans-stack: 'MiSans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                   "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB",
                   "Microsoft YaHei", "微软雅黑", sans-serif;
```

**平台映射：**
- 界面中西文：MiSans（webfont，400/500/600/700），回退系统 sans / PingFang / 雅黑
- 文章衬线不走这套栈

### 英文衬线字体栈

用于英文文章大标题与正文。

```css
--font-serif-en-stack: 'Source Serif 4', Georgia, 'Times New Roman', serif;
```

### 等宽字体栈

用于代码块和行内代码。

```css
--font-mono-stack: ui-monospace, "SF Mono", Monaco, "Cascadia Code",
                   Consolas, "Liberation Mono", "Courier New",
                   "PingFang SC", "Microsoft YaHei", monospace;
```

## 语义化字体变量

```css
@theme {
  --font-ui: var(--font-sans-stack);           /* UI 元素 */
  --font-heading: var(--font-sans-stack);      /* 通用标题 */
  --font-article-title: var(--font-serif-stack); /* 中文文章大标题（Noto Serif SC） */
  --font-body: var(--font-sans-stack);         /* 正文 */
  --font-mono: var(--font-mono-stack);         /* 代码 */
}
```

## 字号系统

| 用途 | CSS 变量 | 大小 |
|------|---------|------|
| 文章大标题 | `--font-size-article-title` | 40px |
| 正文标题 | `--font-size-prose-heading` | 26px |
| 正文 | `--font-size-body` | 17px |
| 正文大号 | `--font-size-body-lg` | 20px |
| UI XS | `--font-size-ui-xs` | 12px |
| UI SM | `--font-size-ui-sm` | 14px |
| UI MD | `--font-size-ui-md` | 16px |
| UI LG | `--font-size-ui-lg` | 18px |
| 代码 | `--font-size-code` | 14px |

## 使用指南

### 在 Tailwind 中使用（推荐）

```html
<!-- UI 元素 -->
<nav class="font-ui text-sm">导航</nav>

<!-- 通用标题 -->
<h2 class="font-heading text-2xl">标题</h2>

<!-- 文章大标题 -->
<h1 class="font-article-title text-4xl font-bold">文章标题</h1>

<!-- 正文 -->
<p class="font-body text-base font-light">正文内容</p>

<!-- 代码 -->
<code class="font-mono text-sm">代码</code>
```

### 在 CSS 中使用

```css
.my-component {
  font-family: var(--font-heading);
  font-size: var(--font-size-prose-heading);
  font-weight: var(--font-weight-normal);
}
```

### 在 React/TSX 中使用

```tsx
<div style={{
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--font-size-body)',
  fontWeight: 'var(--font-weight-light)',
}}>
  文章内容
</div>
```

## OG 图片字体

OG 图片使用 satori 生成，不支持 CSS 变量，需要使用 `src/config/fonts.ts` 中的常量：

```typescript
import { OG_FONTS, OG_FONT_PATHS } from '@/config/fonts';

// 使用字体名
<div style={{ fontFamily: OG_FONTS.heading }}>标题</div>

// 加载字体文件
const font = await fs.readFile(OG_FONT_PATHS.inter);
```

## 维护指南

### 修改字体

只需修改 `src/styles/typography.css` 中的 `@theme` 块，所有页面自动生效。

### 添加新字体变量

```css
@theme {
  --font-custom: var(--font-sans-stack);
}
```

Tailwind 会自动生成 `font-custom` 工具类。

### 测试字体显示

在不同平台测试：
1. macOS Safari/Chrome
2. Windows Chrome/Edge
3. Android Chrome
4. iOS Safari

## 加载与性能

- MiSans 通过 `src/styles/misans.css` 自托管（`misans` npm 包，构建期打进 `/_astro`）。
- 只引入 Regular / Medium / Semibold / Bold 四档；`scripts/sync-misans-css.mjs` 把 Xiaomi 光学字重 330/380/520/630 写成 400/500/600/700。升级 `misans` 后重跑该脚本。
- `@font-face` 按 Google Fonts 的 CJK unicode-range 切片，浏览器只下载当前页用到的汉字块。
- Latin 面保留，界面西文也走 MiSans。
- 中文文章标题走 Google Fonts 的 Noto Serif SC（600/700）；英文阅读体走 Source Serif 4。

## 参考资料

- [MiSans 字库与许可](https://hyperos.mi.com/font/zh/)
- [dsrkafuu/misans 子集化包](https://github.com/dsrkafuu/misans)
- [Tailwind CSS v4 @theme](https://tailwindcss.com/docs/theme)
