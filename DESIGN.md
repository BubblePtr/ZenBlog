---
name: Kieran Zhang
description: 个人博客与作品集：留白极简（写作优先）+ 青竹强调色的双语个人站
colors:
  surface-paper: "oklch(0.977 0.007 80.7)" # #faf7f2 纸面，禁 #fff
  surface-ink: "oklch(0.141 0.004 285.8)" # zinc-950 深色底，禁 #000
  accent-bamboo: "oklch(0.439 0.046 156.7)" # 青竹，浅色模式，纸面上 7.1:1
  accent-bamboo-strong: "oklch(0.36 0.046 157)" # 更深一档，强对比 hover
  accent-bamboo-dark: "oklch(0.734 0.049 159.3)" # 青竹，深色模式，墨底上 8.6:1
  accent-bamboo-dark-strong: "oklch(0.8 0.049 158)"
  ink-primary-light: "rgba(0,0,0,0.87)"
  ink-primary-dark: "rgba(255,255,255,0.87)"
  ink-secondary-light: "rgba(0,0,0,0.6)"
  ink-secondary-dark: "#a1a1aa"
  ink-tertiary-light: "rgba(0,0,0,0.38)"
  ink-tertiary-dark: "rgba(255,255,255,0.38)"
typography:
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif"
    fontWeight: 600
    letterSpacing: "-0.01em"
    note: "界面层标题一律系统 sans；层级靠字号阶与灰度，不靠字形"
  article-display:
    fontFamily: "'Shippori Mincho', Georgia, serif（英文）/ 'Noto Serif SC', Georgia, serif（中文）"
    note: "衬线只保留在文章阅读态（详情页大标题与正文），是阅读的仪式感，不是界面的装饰"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 300
    lineHeight: 1.75
  meta:
    fontFamily: "ui-monospace, 'SF Mono', Monaco, monospace"
    fontSize: "0.7rem"
    fontVariantNumeric: "tabular-nums"
    note: "日期、年份、状态字等一切元信息；中文上下文不 uppercase"
---

# Design System: 留白（Ma）

## 1. Overview

**Creative North Star: 「留白」**

整个站点是一页安静的纸：内容极少、灰阶为主、层级全部交给字号、灰度与留白。
写作优先，文章目录即首页。唯一的氛围元素是首屏竹影（DappledLight），
唯一的彩色是青竹。精神范本是文人书桌，而不是杂志、更不是 SaaS 落地页。
2026-08 起取代旧「工程师杂志」系统（kicker、folio 编号、双导轨栏线均已退役）。

**Key Characteristics:**

- 纸面 `oklch(0.977 0.007 80.7)` + 墨字；深色模式 zinc-950 底，同一灰阶反转（夜读）。
- **青竹（Bamboo）是全站唯一强调色**：浅色 `oklch(0.439 0.046 156.7)`，深色 `oklch(0.734 0.049 159.3)`，CSS 变量 `--color-accent`。
- 单列窄版心（列表面 34rem，文章面 65–75ch），居中，大留白。
- 两种字体角色：系统 sans（界面与正文）+ mono（元信息）；衬线只活在文章阅读态。
- 零装饰：无卡片边框、无阴影、无分隔线堆叠、无区块编号；图片是唯一的"实"元素（项目缩略图、摄影、文章配图）。
- 零 scroll 动效：动效只响应用户输入（hover、focus、点击），页面不自己表演。

## 2. Colors

### 青竹（The Bamboo Rule）

青竹取竹与玉之色。竹与玉在中国传统文化里都象征君子，而君子与儒家渊源极深；
这是站点主人的色彩叙事，不要换成任何"更流行"的颜色。图纸蓝与 orange 都是已废弃的历史强调色，不要复活。

用法沿用 wayfinding-only 原则：链接 hover、focus 态、active 导航、选中文本、状态字（building/shipped）。
永远不做大面积底色、不做装饰色块。一屏之内青竹出现的位置应屈指可数；
如果一个组件需要第二种颜色解决层级，先回到字重与灰度。
状态色（红/绿/黄）仅在有语义时使用。

- `--color-accent`：浅 `oklch(0.439 0.046 156.7)`（纸面上 7.1:1，AAA），深 `oklch(0.734 0.049 159.3)`（墨底上 8.6:1，AAA）。
- `--color-accent-strong`：浅 `oklch(0.36 0.046 157)` / 深 `oklch(0.8 0.049 158)`，留给强对比 hover。
- 色阶规则：两端色相差 <3°，属同一感知色相；任何衍生档位只动 L，不动 C 与 H。
- 灰阶：正文 87% 墨、次要 60%、辅助 38%（日期、年份标签）。新颜色值一律写 oklch。

## 3. Typography

- **界面层（导航、列表、卡片、页脚）**：系统 sans。标题 semibold + tracking -0.01em，
  层级靠字号阶（1.05rem 页面题 / 0.9375rem 条目题 / 0.8125rem 辅文）与灰度，不引入 display 字体。
- **元信息（mono）**：日期、年份、状态字、EXIF。0.65–0.75rem，tabular-nums；
  中文上下文不 uppercase、letter-spacing 不超过 0.1em。
- **文章阅读态（衬线）**：详情页大标题与长文正文保留 Noto Serif SC / Shippori Mincho
  （`font-article-title` / `font-serif-en`）。衬线属于"读"，不属于"逛"。
- 正文 17px / 300 / 1.75，行长 65–75ch；文章标题 `text-wrap: balance`。

## 4. Components

- **列表即目录**：按年份分组，年份 mono 小字，条目一行（标题 + 右对齐 mono 日期），
  hover 唯一反馈是标题染青竹。不用左侧指示线、不用编号、不用插画。
- **项目卡片**：16:10 缩略图 + 名称/一句话/状态字一至两行。图上不压渐变与文字；
  hover 仅 1.03 缓慢缩放。图片 lazy load + 显式宽高防 CLS。
- **Header**：字标 + 少量导航项；active 态青竹。**Footer**：纯文本链接一行，
  下划线用 35% currentColor，hover 染青竹。旧 colophon 三栏结构退役。
- **竹影（DappledLight）**：全站唯一氛围签名，只出现在首页首屏，影可压内容，
  深色模式隐藏，`prefers-reduced-motion` 冻结。其他页面不引入新的氛围层。
- **选中文本**：青竹底 + 纸色文字，是最小的全站签名。
- **按钮**：能用文字链接就不用按钮；确需按钮时 filled 矩形无圆角，触达目标 ≥44px。
- **代码块**：Mac 三点窗口签名保留。

## 5. Motion

- 零入场动画、零 whileInView、零 parallax、零自动轮播；framer-motion 不进入界面层。
- 允许的全部动效：颜色过渡 150ms、项目图 hover 缩放 400ms、View Transitions 页面过渡、竹影摇曳。
- `prefers-reduced-motion` 下只保留颜色过渡。

## 6. Do's and Don'ts

### Do:

- **Do** 新页面从"能不能只用文字排出来"开始想，图片只留内容图。
- **Do** 元信息一律 mono + tabular-nums；日期右对齐。
- **Do** hover/focus 的导向反馈用 `var(--color-accent)`；焦点态必须可见。
- **Do** 保持深浅双主题同等打磨：深色是灰阶反转的"夜读"，不是另一套配色。
- **Do** 图片显式宽高、字体与首屏图 preload、44px 触达目标。

### Don't:

- **Don't** 复活 kicker、folio 编号、双导轨栏线、colophon 三栏页脚（杂志系统已退役）。
- **Don't** 引入青竹以外的彩色（语义状态色除外）；图纸蓝与 orange 是历史遗留，不要复活。
- **Don't** 用 `#fff` / `#000`、阴影层级、渐变装饰、glassmorphism、卡片边框网格。
- **Don't** 加 scroll 触发动效或入场 stagger；动效不响应输入就砍掉。
- **Don't** 在中文上下文 uppercase 或 letter-spacing 超过 0.1em。
- **Don't** 用 em dash（用逗号、冒号或括号）。
- **Don't** 新增 hex/hsl 颜色值；一律 oklch，衍生色只动 L。
