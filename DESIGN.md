---
name: Kieran Zhang
description: 个人博客与作品集——克制、认真、有想象力的双语技术档案
colors:
  surface-cream: "#faf7f2"
  surface-ink: "#09090b"
  rail-light: "#000000"
  rail-dark: "#ffffff"
  ink-primary-light: "#212121"
  ink-primary-dark: "#f5f5f5"
  ink-secondary-light: "#585858"
  ink-secondary-dark: "#a1a1aa"
  ink-tertiary-light: "#9e9e9e"
  ink-tertiary-dark: "#71717a"
  zinc-50: "#fafafa"
  zinc-100: "#f4f4f5"
  zinc-200: "#e4e4e7"
  zinc-300: "#d4d4d8"
  zinc-700: "#3f3f46"
  zinc-800: "#27272a"
  zinc-900: "#18181b"
typography:
  display:
    fontFamily: "'Shippori Mincho', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  display-zh:
    fontFamily: "'Noto Serif SC', 'Source Han Serif SC', Georgia, serif"
    fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif"
    fontSize: "1.625rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 300
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
  mono:
    fontFamily: "ui-monospace, 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  none: "0"
  sm: "0.125rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
  rail-gutter: "max(1.5rem, calc(50vw - 42rem))"
components:
  button-primary:
    backgroundColor: "{colors.zinc-900}"
    textColor: "{colors.zinc-50}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1.25rem"
    typography: "{typography.title}"
  button-primary-hover:
    backgroundColor: "{colors.zinc-800}"
    textColor: "{colors.zinc-50}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-primary-light}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.5rem"
    typography: "{typography.title}"
  button-ghost-hover:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary-light}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary-light}"
    rounded: "{rounded.none}"
    padding: "0.5rem 0.5rem"
    typography: "{typography.title}"
  nav-item-active:
    textColor: "{colors.ink-primary-light}"
  card-content:
    backgroundColor: "transparent"
    rounded: "{rounded.none}"
    padding: "0"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.ink-primary-light}"
    rounded: "{rounded.none}"
    padding: "0.625rem 0"
    typography: "{typography.body}"
---

# Design System: Kieran Zhang

## 1. Overview

**Creative North Star: "The Technical Portfolio"**

这个系统的精神范本是一份**装帧讲究的工程档案**——不是杂志，不是博客模板，不是 SaaS 落地页。每一篇文章、每一张照片、每一个项目卡片都按照同一种"档案条目"的格律存放。米白色纸面、贯穿全站的两条 1px 导轨线、衬线大标题与无衬线正文之间的章法——所有元素都暗示这是一个会被反复检索、长期更新的索引，而不是一次性传播品。

视觉上的"有想象力"来自结构而非装饰：靠字体成对（中文 Noto Serif SC + 英文 Shippori Mincho 的衡体大标题，配 Apple 系统 sans 的正文）、节奏（行高 1.75 的 17px 正文 + 65–75ch 行长 + 大量段间距）、签名导轨线、以及克制到近乎挑衅的色彩——除了米白与墨黑、十一阶 zinc 灰、以及少数为 KaTeX 与代码高亮所必需的状态色之外，**这个系统不使用任何彩色强调色**。这是声音的来源。

明确拒绝的方向：不是 Linear / Vercel / Stripe 那种 SaaS 模板，不是赛博霓虹与 glassmorphism，不是"图标 + 标题 + 描述"的卡片网格。本站不卖任何东西，所以没有 CTA 按钮的视觉重量、没有社会认同区、没有营销徽章。

**Key Characteristics:**

- 米白纸面（`#faf7f2`）+ 墨黑文字，不使用 `#fff` / `#000`。
- 双导轨：两条 1px 垂直线沿正文列宽贯穿整个页面（≥ 768px 时显示），是这个系统的签名。
- 中英异体大标题：中文用 Noto Serif SC，英文用 Shippori Mincho，正文统一用 Apple 系统 sans。
- 17px 正文，行高 1.75，字重 300。
- 圆角分布两极：`rounded-full`（头像、图标 hover 区）+ `rounded-none` / `rounded-sm`（卡片、按钮、代码块的"档案感"）。
- 阴影几乎不存在；深度通过排版和对比建立。
- 无彩色强调色——zinc 阶梯加重量是唯一的"声音"。

## 2. Colors

调色板是一个**双极灰阶系统**：米白纸面与墨黑墨水构成两端，中间是 11 阶 zinc 中性色作为唯一的过渡词汇。色相被有意剥夺。

### Primary

无单一品牌色。系统的"主色"是文字本身——`ink-primary` 和它的反相版本就是 primary。这是有意的——见下方 The No-Accent Rule。

### Neutral

- **Surface Cream** (`oklch(98% 0.006 60)` ≈ `#faf7f2`)：浅色模式背景。带一丝暖橙色温的米白，不是惨白纸——避免了普通白纸的医疗感。
- **Surface Ink** (`#09090b`，zinc-950)：深色模式背景。比纯黑略冷略亮，避免了黑洞般的视觉吞噬。
- **Ink Primary** (浅色 `rgba(0,0,0,0.87)`，深色 `rgba(255,255,255,0.87)`)：正文、标题。Material 3 风格的透明黑/白比纯黑/白多一分呼吸。
- **Ink Emphasis** (浅色 `rgba(0,0,0,0.92)`，深色 `rgba(255,255,255,0.92)`)：粗体强调、文章大标题、表头。
- **Ink Secondary** (浅色 `rgba(0,0,0,0.6)`，深色 `#a1a1aa` zinc-400)：日期、metadata、引用块、次要描述。深色模式特意改用 zinc-400 而非透明白——透明白在深色背景下显灰，zinc-400 有冷色温，更有质感。
- **Ink Tertiary** (浅色 `rgba(0,0,0,0.38)`，深色 `rgba(255,255,255,0.38)`)：禁用状态、占位符、最弱层级 metadata。
- **Rail** (浅色 `rgba(0,0,0,0.14)`，深色 `rgba(255,255,255,0.14)`)：贯穿全站的导轨线、章节分隔线、虚线 hr。这条颜色**只**给 rails 用——别的地方画线请用 `zinc-200/300` 或 `zinc-700/800`。
- **Zinc Scale** (`#fafafa` zinc-50 → `#18181b` zinc-900)：所有不属于上述语义角色的灰阶——边框、按钮反相、hover 背景、代码块底色。

### Named Rules

**The No-Accent Rule.** 这个系统**没有**彩色强调色。本站不区分"主行动 CTA"与"次行动"，也不用色相做层级。强调通过字重（300 → 400）、字号、和深灰之间的对比建立。如果一个新组件让你想加蓝/橙/紫，它的层级问题没有用色彩之外的办法解决——回去用排版解决。唯一例外是状态色（错误/成功/警告）和渲染必需的色彩（KaTeX 公式、代码高亮、用户上传的照片）。文章正文里历史遗留的 orange 链接色是已知偏差，应替换为 `ink-primary` + 下划线。

**The Cream-Not-White Rule.** 浅色模式背景必须是 `oklch(98% 0.006 60)`（暖米白）。`#fff` 在视觉系统里禁用——它会把页面变成医疗手册。同理，`#000` 禁用，深色背景用 `zinc-950`。

## 3. Typography

**Display Font (英文)：** Shippori Mincho（回退 Georgia, Times New Roman）
**Display Font (中文)：** Noto Serif SC（回退 Source Han Serif SC, Georgia）
**Body Font：** Apple 系统 sans 栈（`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `PingFang SC`, `Hiragino Sans GB`, 微软雅黑）
**Mono Font：** SF Mono / ui-monospace 栈

**Character：** 衡体衬线作大标题，sans 担纲所有 UI 与正文。这是一种"印刷书装 × 操作系统"的对照——大标题有古典的克制重量，正文有今天的清晰度。中英文有意使用不同的衡体：英文 Shippori Mincho 笔画更细更现代，中文 Noto Serif SC 字面更稳更经典。两者并排时不会"撞气质"，而是在不同语言里维持一致的"档案感"。

### Hierarchy

- **Display** (400, `clamp(2.25rem, 4.5vw, 3.5rem)`, line-height 1.1)：文章大标题、关键页 hero 名字。中英文异体——中文走 Noto Serif SC，英文走 Shippori Mincho。仅用在文章详情页和首页 hero。
- **Headline** (400, 1.625rem / 26px, line-height 1.25)：文章正文中的 H2，区块标题。统一 sans，与正文同字体保持节奏。
- **Title** (400, 1rem / 16px, line-height 1.4)：导航项、按钮文本、列表项标题。系统 sans。
- **Body** (300, 1.0625rem / 17px, line-height 1.75)：所有正文。字重特意压到 300——300 在系统 sans 上仍然清晰，且让长文呼吸感大幅提升。
- **Body Secondary** (300, 0.875rem / 14px, line-height 1.5)：文章 metadata、卡片描述、引用块。
- **Label** (400, 0.75rem / 12px, letter-spacing 0.14em, **uppercase 仅限英文**)：英文 hero tagline、表单 label、最次级标记。中文上下文不使用 uppercase——letter-spacing 收回到 0。
- **Mono** (400, 0.875rem / 14px)：行内 `code`、代码块、tabular-nums 日期。

### Named Rules

**The Reading Width Rule.** 正文行长锁定 65–75ch（约 32–40 个汉字 / 65–75 个英文字符）。窄于 65ch 是密度过高，宽于 75ch 是阅读疲劳。`max-w-3xl` / `max-w-4xl` 对应这一区间，但每个新页面都要回头确认实际字符数。

**The Light-Body Rule.** 正文字重默认 `300`。`400` 是粗体，`500/600/700` 仅给文章大标题和强调。如果一个段落看起来"太轻读不清"，先检查行高（应是 1.75）和对比度（应是 ink-primary，不是 ink-secondary），不要本能地加字重。

**The Bilingual Title Rule.** 任何大标题都要按当前页面 `lang` 切换衡体：`zh` → Noto Serif SC，`en` → Shippori Mincho。Hero 名字、文章标题、首页区块大标题都按这条走。系统已通过 `font-article-title` / `font-serif-en` Tailwind 类暴露——不要绕开它写自定义字体栈。

## 4. Elevation

这个系统**默认是平的**。surface 和 surface 之间的层级靠**排版差**和**rails**建立，不靠阴影。阴影只在两种场景出现：浮起的 popover/tooltip（一处弥散柔光），代码块（一处近乎不可见的 1px 暗影暗示"这里有内容跳出排版"）。卡片、按钮、输入框——全部无阴影。

### Shadow Vocabulary

- **Code Block Hint** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)` ≈ Tailwind `shadow-sm`)：仅用于 `<pre>` 代码块。配合 `border` 暗示"代码是从正文里浮起的对象"。
- **Popover Diffuse** (`box-shadow: 0 10px 30px rgba(0,0,0,0.08)`)：仅用于真正需要"飞起"的 popover/tooltip（如 RSS 复制气泡）。深色模式用 `rgba(0,0,0,0.5)` + 多层叠加补偿暗背景下阴影看不见的问题。

### Named Rules

**The Flat-By-Default Rule.** 任何新组件默认无阴影。卡片不需要阴影来"看起来是卡片"——把它从背景里区分开的应该是 padding、内部排版、或一条 1px 的 rail 线。如果你正在为一个组件加 `shadow-md` 或更重的阴影，先问自己：能不能用 `border` 或 `bg-zinc-50` 解决？多数情况下能。

## 5. Components

每个组件先讲性格，再讲尺寸、状态。整体语言是 **Tactile & Confident**——可点击的东西要有重量感，不要假装自己不存在；但重量来自尺寸和对比，不来自渐变、阴影或圆角。

### Buttons

- **Shape:** 矩形，`rounded-none`（默认）。例外：图标按钮和头像走 `rounded-full`。**所有按钮禁止使用 `rounded-md` 到 `rounded-2xl` 之间的"友善圆角"**——它们会立刻把界面拖向 SaaS 模板感。
- **Primary** (filled): 背景 `zinc-900`，文字 `zinc-50`；深色模式反相 `zinc-100` 背景 + `zinc-900` 文字。Padding 约 `0.75rem 1.25rem`，最小高度 44px。无边框。
- **Hover / Focus:** 背景过渡到 `zinc-800`（深色模式 `zinc-200`），200ms。Focus-visible 用全站 `.focus-ring` 类——`outline-2 outline-offset-2 outline-zinc-400`，不要换成色相。
- **Ghost** (text-style): 透明背景，`ink-primary` 文字，hover 时变 `ink-secondary`——只用文字色变化暗示状态。导航项、首页链接行用这个变体。
- **Icon Button**: `rounded-full`、`min-w-11 min-h-11`、hover 背景 `zinc-100` / `zinc-800`。仅给真正"图标动作"用（菜单、主题切换、关闭）。

### Cards / Containers

- **Corner Style:** `rounded-none` 或 `rounded-sm`（2px）。**禁止 `rounded-2xl` 用作卡片**——这是 SaaS 反射动作。
- **Background:** 通常透明或 `zinc-50` / `zinc-900`。卡片不靠底色"飘起来"，靠 padding 和 rails 切分版面。
- **Shadow Strategy:** 无。见 §4 The Flat-By-Default Rule。
- **Border:** 可选——若需要切分，使用 `zinc-200` / `zinc-700` 1px。**禁止 side-stripe 边框**（`border-left: 4px`），任何变体下都禁止。
- **Internal Padding:** 与 rails 对齐——内层左右 padding 不可让内容超出导轨范围。

### Inputs / Fields

- **Style:** 无背景、无边框，仅一条 `1px solid zinc-300` 的下边线（深色模式 `zinc-700`）。延续"档案表单"的克制语言。圆角 `rounded-none`。
- **Focus:** 下边线变 `ink-primary`，可选短暂 `outline-2 outline-zinc-400` focus-visible ring 作为 a11y 补强。**不使用蓝色 focus 光晕**——会破坏 No-Accent Rule。
- **Error:** 用 `ink-emphasis` 加重 + 错误描述文字（不是红色边框）。仅当语义需要时使用状态色（如表单提交失败的 `red-700`）。
- **Disabled:** `ink-tertiary` 文字 + 边线降至 `zinc-200`。

### Navigation

- **Style:** 无按钮化处理。每一个 nav item 是文字 + 一条 1px 底部细线作为 active/hover 指示器。
- **Typography:** Title 字号（16px），字重 400，颜色 `ink-secondary`。
- **States:** Active → 文字升至 `ink-primary` + 底线全宽。Hover → 文字升至 `ink-primary` + 底线动画从 0 展开到全宽（200ms）。
- **Mobile:** 折叠为汉堡菜单，使用 `MobileNavMenu` 组件。展开后保持文字+底线指示器逻辑。

### Code Blocks (Signature)

文章里的 `<pre>` 是这个系统的签名小细节之一：圆角 `rounded-xl`、`zinc-50` / `zinc-900` 底色、上方留 `pt-12` 的空间，左上角用 `::before` 伪元素绘制红黄绿三个 12px 的"Mac 窗口圆点"（`#f87171` / `#facc15` / `#4ade80`）。这是允许的"装饰"——它服务"这是代码"的语义。**不要扩散到非代码的卡片**。

### Rails (Signature)

页面始终存在两条与正文列宽对齐的 1px 垂直线，从顶到底贯穿整个 body（`body::before` 实现）；横向上由 `.section-rule` 与 `.rail-line-*` utility 绘制 1px 横线，构成正文区的"网格框架"。

- **颜色:** `rgba(0,0,0,0.14)` 浅 / `rgba(255,255,255,0.14)` 深。
- **位置:** 左线 `max(1.5rem, calc(50vw - 42rem))`，右线 `min(calc(100vw - 1.5rem), calc(50vw + 42rem))`，与 `max-w-[84rem]` 容器对齐。
- **断点:** ≤ 767px 隐藏（手机上视觉太密）。
- **z-index:** 9999 + `pointer-events: none`，让 rails 永远在最上层但不阻挡交互。

### Named Rules

**The Rail Rule.** 每一个新增页面、每一个新增主区块**都要与 rails 对齐**。容器宽度统一使用 `max-w-[84rem]`，左右 padding 统一 `px-6`。任何"全屏出血"或"超过 rail 范围"的内容必须有明确语义理由（如照片画廊的横向滚动）——并且要在视觉上明确"突破"，而不是"溢出"。新增横向分隔线一律走 `.section-rule` 或 `.rail-line-*`，不要用 `<hr>` 或 `border-t-zinc-200`。

**The Tactile Button Rule.** Primary 按钮必须是 filled、矩形、≥ 44px 高、无圆角。这是与"无彩色"的对偶——既然不靠色相分层级，就必须靠重量分层级。半透明 ghost 按钮和"友善圆角" filled 按钮会让所有动作看起来一样重要。

## 6. Do's and Don'ts

### Do:

- **Do** 用 `oklch(98% 0.006 60)` 作浅色背景。
- **Do** 用 `zinc-950` 作深色背景。
- **Do** 用 `font-article-title`（中文）/ `font-serif-en`（英文）类切换中英文衡体大标题。
- **Do** 让所有正文走 `max-w-3xl` ~ `max-w-4xl`，行高 `leading-7` 或 `leading-8`，字重 `font-light`。
- **Do** 用 `.focus-ring` utility 作所有可聚焦元素的焦点环。
- **Do** 让所有页面容器走 `max-w-[84rem] mx-auto px-6` 与 rails 对齐。
- **Do** 用 `.section-rule` 或 `.rail-line-*` 作横向分隔——不要 `<hr>`，不要 `border-t-zinc-200`。
- **Do** Primary 按钮用 `zinc-900` 实底 + 白文字，矩形，无圆角，最小 44×44。
- **Do** 在 `prefers-reduced-motion: reduce` 下把所有 view-transition 时长压到 0.01ms（已由 `global.css` 处理，新增动画必须延续）。

### Don't:

- **Don't** 使用任何彩色强调色。No blue links, no purple buttons, no green tags. 唯一允许的色相是状态色（红/绿/黄），**且必须有语义理由**。文章正文目前残留的 `orange-600 / orange-400` 链接色是已知偏差，新建组件不要复制。
- **Don't** 使用 `#fff` 或 `#000`。它们已被显式禁用。
- **Don't** 使用 `border-left: 4px` 或任何彩色 side-stripe 边框作为卡片/列表项/告警的强调。这是绝对禁令。
- **Don't** 使用 `background-clip: text` 渐变文字。任何渐变文字。
- **Don't** 把 glassmorphism / `backdrop-blur` 当默认。仅站头（已实现 `backdrop-blur-md`）和必要的 popover 例外。
- **Don't** 用"图标 + 大标题 + 描述"三栏卡片网格。这是 AI 生成感最强的反射动作。
- **Don't** 用 hero 大数字 + 小标签 + 渐变紫蓝的 SaaS 落地页模板。本站不是 SaaS。
- **Don't** 用 `rounded-2xl` 或更大圆角作卡片/按钮。圆角分布走两极——`rounded-none` / `rounded-sm` / `rounded-full`，中间地带留给 popover (`rounded-xl`) 和代码块 (`rounded-xl`)。
- **Don't** 给卡片加 `shadow-md` 或更重的阴影。深度靠 padding 和 rails，不靠阴影。
- **Don't** 在新组件里写营销文案——CTA 按钮、"Join 10,000+ developers"、"限时"、"现在开始"。这个站不卖东西。
- **Don't** 用 em dash（—）。用逗号、冒号、分号、句号或括号。
- **Don't** 在中文上下文里给 `letter-spacing` 加 `0.14em`——uppercase letter-spacing 仅给英文 label 用。
