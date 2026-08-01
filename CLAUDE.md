# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

ZenBlog 是一个基于 Astro 6 + React 19 + Tailwind CSS 4 的个人博客与作品集网站，采用纯静态输出（SSG），部署在 Cloudflare Pages 上。

**站点标题：** Kieran Zhang
**网站域名：** https://kieran.build
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
```

## 版本管理（jj + Git 共存）

本仓库使用 [jj（Jujutsu）](https://jj-vcs.github.io/jj/)与 Git colocated 模式（`.jj/` 与 `.git/` 共存）。两套命令可混用，jj 会在下次运行时自动同步 Git 侧的变化。优先使用 jj 命令。

### 常用工作流

```bash
# 开始新工作（相当于 git checkout -b）
jj new main                          # 在 main 之上新建 working-copy commit

# 提交（无需 git add，工作区改动自动跟踪）
jj commit -m "feat: ..."             # 提交当前改动并新建空 working copy
jj describe -m "feat: ..."           # 只改当前 commit 的描述，不新建

# 创建分支并推送（PR 工作流）
jj bookmark create feat/xxx -r @-    # 在刚提交的 commit 上建书签
jj git push --bookmark feat/xxx

# 同步远端
jj git fetch                         # 相当于 git fetch（main 书签已 track origin）
jj rebase -d main                    # 把当前工作 rebase 到最新 main

# 查看状态
jj status                            # 工作区状态
jj log                               # 提交图（@ 为当前 working copy）
jj diff                              # 当前 commit 的改动

# 修改历史
jj squash                            # 把 @ 的改动合入父 commit
jj edit <rev>                        # 直接编辑历史上某个 commit
jj undo                              # 撤销上一次 jj 操作（万能后悔药）
```

### 约定

- 提交信息仍遵循 Conventional Commits。
- 不直接推送 `main` 书签；一律通过 feature 书签（`feat/...`、`fix/...`、`chore/...`）+ PR 合并。
- PR 合并后：`jj git fetch`，然后 `jj bookmark delete feat/xxx` 清理本地书签。
- jj 没有暂存区，所有工作区改动都属于 `@`；需要拆分改动时用 `jj split`。
- `.jj/` 已通过 `.jj/.gitignore` 对 Git 隐藏，勿手动提交。
- **大文件警告不可忽略**：jj 默认拒绝快照 >1MiB 的新文件（只打 Warning，不报错），此时提交里会静默缺文件。提交含图片等资源后，用 `gh pr view --json files` 或 `jj diff --stat` 确认文件真的进了提交；图片应先压缩到 1MiB 以下。

### 与 gh CLI 配合的注意点

jj 无内置 forge 集成，PR 的创建/合并仍用 `gh`。但 jj 下 git 始终处于 detached HEAD，`gh` 无法推断"当前分支"：

- `gh pr create` 必须显式指定 `--head <书签名>`（以及 `--base main`）。
- `gh pr merge` 不要加 `--delete-branch`（会报 `not on any branch`）；改用 jj 删除远端分支：`jj bookmark delete <书签名>` 后 `jj git push --bookmark <书签名>`（推送删除）。

### 多层改动：GitHub Stacked PRs（gh-stack extension）

多个相互依赖的 PR 用 GitHub 原生 stacked PR（public preview，`gh extension install github/gh-stack`）。本地照常 jj 叠层，成栈只走 `gh stack link`（2026-08 已实测与 jj 兼容）：

```bash
# 1. 本地叠层（正常 jj 工作流，每层一个书签）
jj new main && ...改动... && jj commit -m "feat: layer 1"
jj bookmark create feat/layer-1 -r @-
...改动... && jj commit -m "feat: layer 2"
jj bookmark create feat/layer-2 -r @-
jj git push --bookmark feat/layer-1 --bookmark feat/layer-2

# 2. 关联成栈（按栈序从底到顶传参；自动建 PR 并正确设置 base 链）
gh stack link feat/layer-1 feat/layer-2

# 3. 合并整栈（原子操作；也可传 PR 号只合到中间某层）
gh stack merge <栈编号> --yes

# 解除栈（不合并、走 API，不依赖本地分支）
gh stack unstack <栈编号>
```

- 想要自定义 PR 标题/正文，先 `gh pr create` 建好 PR，再 `link`（已有 PR 会被收编；否则 link 自动创建的 PR 标题取自分支名）。
- **只用 API 直连的子命令**：`link`、`unstack`、带编号的 `merge`。`view`/`checkout`/`submit`/`sync` 等依赖"当前分支"的命令在 detached HEAD 下报 `not on any branch`（v0.1.0），查看栈用 GitHub 网页 UI。
- 底层 PR 合并后 GitHub 会对上层做服务端级联 rebase；合并后照常 `jj git fetch` + `jj bookmark delete` 清理。

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

## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default mattpocock/skills triage vocabulary is used unchanged. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
