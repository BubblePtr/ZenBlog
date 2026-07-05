---
name: Kieran Zhang
description: 个人博客与作品集——工程师杂志（The Engineer's Journal）风格的双语技术刊物
colors:
  surface-cream: "#faf7f2"
  surface-ink: "#09090b"
  accent-blueprint: "#1d4ed8"
  accent-blueprint-strong: "#1e3a8a"
  accent-blueprint-dark: "#60a5fa"
  accent-blueprint-dark-strong: "#93c5fd"
  rail-light: "rgba(0,0,0,0.14)"
  rail-dark: "rgba(255,255,255,0.14)"
  ink-primary-light: "rgba(0,0,0,0.87)"
  ink-primary-dark: "rgba(255,255,255,0.87)"
  ink-secondary-light: "rgba(0,0,0,0.6)"
  ink-secondary-dark: "#a1a1aa"
  ink-tertiary-light: "rgba(0,0,0,0.38)"
  ink-tertiary-dark: "rgba(255,255,255,0.38)"
typography:
  display:
    fontFamily: "'Shippori Mincho', Georgia, serif（英文）/ 'Noto Serif SC', Georgia, serif（中文）"
    fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  kicker:
    fontFamily: "ui-monospace, 'SF Mono', Monaco, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.2em"
  meta:
    fontFamily: "ui-monospace, 'SF Mono', Monaco, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.08em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 300
    lineHeight: 1.75
    letterSpacing: "normal"
---

# Design System: The Engineer's Journal

## 1. Overview

**Creative North Star: "工程师杂志"（The Engineer's Journal）**

整个站点是一本连续出刊的工程师杂志：首页是封面与目录的混合体，博客列表是当期目录页（folio），
每篇文章有 kicker（栏目眉线）→ 衬线大标题 → deck（衬线摘要）的三段式刊头，页脚是 colophon（版权页）。
精神范本是 Increment、IEEE Spectrum 与印刷工程期刊，而不是 SaaS 落地页或博客模板。

**Key Characteristics:**

- 米白纸面（`#faf7f2`）+ 墨黑文字；深色模式 zinc-950。
- **图纸蓝（Blueprint Blue）是全站唯一强调色**：浅色 `#1d4ed8`，深色 `#60a5fa`（CSS 变量 `--color-accent`）。
- 双导轨签名保留：两条 1px 垂直线贯穿页面，是杂志的"栏线"。
- 三种字体角色分工明确：衬线（标题，中 Noto Serif SC / 英 Shippori Mincho）、sans（正文）、**mono（一切元信息）**。
- 元信息系统（编号、日期、作者、EXIF、kicker）一律 mono + 小字号 + 宽字距。
- 平面化：无阴影层级，深度靠排版、栏线和留白。

## 2. Colors

### The One-Accent Rule（取代旧 No-Accent Rule）

图纸蓝是唯一的彩色，且**只用于 wayfinding（导向）**：kicker、链接 hover、active 态（导航下划线、TOC 当前章节）、
folio 编号 hover、选中文本反白。它永远不做大面积底色、不做装饰性色块。
如果一个组件需要第二种颜色来解决层级，先回到字重与 mono/serif 的对比。
状态色（红/绿/黄）仅在有语义时使用（错误、成功、系统状态灯）。

- `--color-accent`：浅色 `#1d4ed8`（blue-700），深色 `#60a5fa`（blue-400）。
- `--color-accent-strong`：更深/更亮一档，留给需要强对比的 hover 场景。
- 纸面、墨色、rail、zinc 阶梯沿用：`#faf7f2` 纸面（禁 `#fff`）、zinc-950 深色底（禁 `#000`）、`rgba(0,0,0,0.14)` rails。

## 3. Typography

三个角色，缺一不可：

- **Display（衬线）**：文章大标题、页面 H1、首页区块标题。中文 Noto Serif SC，英文 Shippori Mincho，
  用 `font-article-title` / `font-serif-en` 切换。杂志的"刊名字体"。
- **Body（sans）**：正文 17px / 300 / 1.75，行长 65–75ch。不变。
- **Meta（mono）**：这是杂志感的主要来源。所有编号、日期、作者名、栏目名、EXIF、状态文字都走 mono，
  11–12px，letter-spacing 0.08–0.2em，英文 uppercase（中文不 uppercase）。

### The Kicker Rule

每个主要页面/区块的标题上方必须有一条 kicker（`.kicker` 工具类）：mono、11px、tracking 0.2em、
uppercase、图纸蓝。文案格式约定：`Index / Writing`、`No. 01 / Projects`、`Work Insights`。
kicker 是杂志的栏目眉线，也是图纸蓝最主要的出场位置。

### The Folio Rule

列表即目录页。博客列表每行以三位数期号（`001` 起，从最旧一篇编起，过滤不改号）开头，
mono 呈现，hover 时编号与标题变图纸蓝。首页各区块用 `No. 01/02/03` 编号呼应。

## 4. Components

- **Rails（签名，保留）**：双导轨 = 杂志栏线。所有旧规则沿用（`.section-rule`、`.rail-line-*`、容器对齐）。
- **Header（刊头）**：左侧 mono 字标 `KIERAN·ZHANG`（中点为图纸蓝）兼作首页链接；
  导航项 mono 大写小字，active 下划线为图纸蓝。
- **Footer（colophon）**：kicker 标出 "Colophon" 与栏目名，链接 mono 化，hover 图纸蓝。
- **文章刊头（三段式）**：kicker（图纸蓝）→ 衬线大标题 → 衬线 deck 摘要 + 作者签名行。
- **按钮**：沿用旧语言——filled 矩形无圆角 ≥44px，或 ghost 文字态；不引入蓝色按钮。
- **代码块**：Mac 三点窗口签名保留。
- **选中文本**：图纸蓝底 + 纸色文字（深色模式蓝底墨字），是最小的全站签名。

## 5. Do's and Don'ts

### Do:

- **Do** 每个页面级标题配 `.kicker`，页面 H1 用衬线（按 lang 切换字体）。
- **Do** 所有元信息（日期、编号、作者、标签）用 mono + tracking。
- **Do** hover/active 的"导向"反馈用 `var(--color-accent)`。
- **Do** 沿用 rails、纸面色、44px 触达目标、`prefers-reduced-motion` 压缩动画。

### Don't:

- **Don't** 把图纸蓝用作大面积背景、边框装饰或第二强调色的替身；一页之内蓝色出现的地方应屈指可数。
- **Don't** 引入图纸蓝以外的任何彩色（状态色除外）。orange 是已清除的历史遗留，不要复活。
- **Don't** 用 `#fff` / `#000`、渐变文字、glassmorphism（站头 backdrop-blur 除外）、side-stripe 彩边。
- **Don't** 用"图标 + 标题 + 描述"三栏卡片网格、营销文案、CTA 视觉重量。
- **Don't** 在中文上下文里 uppercase 或加大 letter-spacing 超过 0.1em。
- **Don't** 用 em dash（——用逗号、冒号或括号）。
