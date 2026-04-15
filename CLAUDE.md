# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 语言要求

- 交流过程中请使用中文
- 文档使用中文撰写，存放在 `docs/` 目录下
- 代码注释使用中文

## 项目概览

ZenBlog 是一个基于 Astro 6 + React 19 + Tailwind CSS 4 的个人博客与作品集网站，采用纯静态输出（SSG），部署在 Cloudflare Pages 上。

**站点标题：** Kieran Zhang
**网站域名：** https://ninthbit.org
**图片 CDN：** https://cdn.ninthbit.org（Cloudflare R2）

## 常用命令

```bash
bun install                    # 安装依赖
bun run dev                    # 启动开发服务器 (localhost:4321)
bun run build                  # 构建生产环境（先清除 dist/）
bun run preview                # 预览构建结果
bun run new:post "标题"         # 创建新博客文章
bun run new:project "标题"      # 创建新项目
bun run check:arch             # 架构边界检查（features 间禁止交叉依赖）
bun run lint                   # 检查代码（oxlint）
bun run lint:fix               # 自动修复 lint 问题
bun run fmt                    # 格式化代码（oxfmt）
bun run fmt:check              # 检查格式是否符合规范
bun run photos:sync-exif       # 从本地图片读取 EXIF 写入 frontmatter
bun run r2:images:upload       # 扫描 content 中外部图片上传到 R2
bun run r2:images:replace      # 批量替换 content 中的图片宿主域名
bun run bubble:sync            # 同步 OpenClaw/Bubble 日记到博客（需要环境变量，见下方说明）
```

### Bubble 内容同步

`bubble:sync` 脚本将外部 AI 助手（Bubble）的日记条目同步到 `src/content/blog/zh/openclaw/`，生成 frontmatter 中 `source: "openclaw"` 的 MDX 文章。

所需环境变量：
- `BUBBLE_BUILD_DIR` — Bubble 构建产物目录路径（默认 `.tmp/bubble-build`）
- `BUBBLE_ENTRY_PATH` — 可选，指定单个 entry JSON 文件路径
- `BUBBLE_OVERWRITE=true` — 覆盖已同步的条目

## 核心架构

### Feature 模块化架构

项目采用按功能垂直切分的模块化架构，核心代码在 `src/features/` 下：

```
src/features/
├── home/          # 首页（Hero、Writing、Photography、Projects 四区块）
├── blog/          # 博客（文章列表、文章布局、评论、MDX 组件）
├── photography/   # 摄影集（画廊、EXIF 展示）
├── projects/      # 项目展示
└── about/         # 关于页（个人资料、职业时间线、装备清单）
```

每个 feature 内部结构：
- `components/` — UI 组件
- `server/queries.server.ts` — 构建时数据查询（Content Collections API）
- `index.ts` — 公开导出

**架构边界规则**（`scripts/check-architecture.mjs` 强制检查）：
- `shared/` 不能依赖 `features/` 或 `pages/`
- `features/` 之间禁止直接交叉依赖
- `pages/` 可以依赖 `features/` 和 `shared/`

### 文件命名约定

- `.client.tsx` — 客户端 React 组件（需要浏览器 API / 交互）
- `.server.ts` — 仅在构建时运行的服务端代码
- `.astro` — Astro 组件（服务端渲染）

### 数据流模式

```
queries.server.ts → Astro 页面（.astro）→ React 组件（.client.tsx）
```

Astro 页面在构建时调用 server 查询获取数据，通过 props 传递给 React 客户端组件。翻译字典也通过 props drilling 传入，避免客户端重新加载。

### 国际化（i18n）

- 默认语言：英文（无 URL 前缀），中文使用 `/zh/` 前缀
- 翻译文件：`src/i18n/translations/en.ts` 和 `zh.ts`
- 页面层：`src/pages/` 和 `src/pages/zh/` 镜像结构，每个页面顶部硬编码 `const lang`
- 博客文章按语言分目录：`src/content/blog/en/`、`src/content/blog/zh/`
- 摄影集合的多语言通过 frontmatter 内嵌字段实现（`title: { en, zh }`），不分目录

### Content Collections

三个集合，Schema 定义在 `src/content.config.ts`：
- `blog` — 博客文章（`src/content/blog/en/` 和 `zh/`，.md/.mdx）
- `projects` — 项目展示（`src/content/projects/`）
- `photography` — 摄影作品（`src/content/photography/`，含 EXIF 数据）

### 共享层

`src/shared/` 存放跨功能共享代码：
- `components/layout/PageShell.astro` — 通用页面 Shell（html + head + header + main + footer）
- `components/navigation/` — 导航栏、语言切换、移动端菜单
- `components/theme/` — 深色/浅色模式切换
- `i18n/types.ts` — `getTranslationDictionary()` 函数

### OG 图片

OG 图片使用静态资源（`/public/og/` 或同类静态路径），不再动态生成（`satori` + `sharp` 方式已移除）。

### MDX 自定义插件

`src/remark/strip-leading-heading-one.mjs` — Remark 插件，自动剥离 MDX 文章开头与 frontmatter `title` 重复的 H1 标题，避免页面上出现重复标题。

### View Transitions API

启用了浏览器原生页面过渡动画（`PageShell.astro` 中开启 `<ViewTransitions />`）：
- 首页头像 → 关于页头像：形态变换（morphing）
- 博客列表标题 → 文章详情标题：动态 `view-transition-name`（`bt-{slug}`）
- 过渡时序配置在 `src/styles/global.css`，支持 `prefers-reduced-motion`

### 代码规范

- Linter：**oxlint**（`bun run lint`）
- Formatter：**oxfmt**（`bun run fmt`）

### 路径别名

`@/` 指向 `src/` 目录。

## 注意事项

- `src/content/` 目录的文件变化被 Vite watcher 忽略（见 `astro.config.mjs`），修改后需重启开发服务器
- Slug 必须符合 kebab-case 格式
- 外部图片域名需在 `astro.config.mjs` 的 `image.domains` 中注册
- 评论系统使用 Giscus（`@giscus/react`），配置在 `src/features/blog/components/GiscusComments.client.tsx`
- 动画使用 `framer-motion`，图标使用 `@remixicon/react`
