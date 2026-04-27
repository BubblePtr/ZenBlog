# ZenBlog

这是一个基于 Astro 构建的个人博客与作品集项目，专注于极简体验与高性能。

## 🧞 本地开发

所有命令在项目根目录下运行：

| 命令 | 说明 |
| :--- | :--- |
| `bun install` | 安装依赖 |
| `bun run dev` | 启动本地开发服务器 (`localhost:4321`) |
| `bun run build` | 构建生产环境代码到 `./dist/` |
| `bun run preview` | 预览构建后的生产环境代码 |
| `bun run new:post "标题"` | 创建新博客文章 (e.g. `bun run new:post "Hello World"`) |
| `bun run new:project "标题"` | 创建新项目 (e.g. `bun run new:project "My Cool App"`) |
| `bun run astro ...` | 运行 Astro CLI 命令 (如 `astro add`, `astro check`) |

## 🚀 部署

本项目是静态站点，推荐部署到 Cloudflare Pages。

### Cloudflare Pages 部署（推荐）

1. 在 Cloudflare Dashboard 创建 Pages 项目，并连接本仓库。
2. 构建命令设置为 `bun run build`。
3. 输出目录设置为 `dist`。
4. 在 Pages 中确保启用 Bun（默认会根据 `bun.lock` 自动识别）。
5. 首次部署后，先在 `*.pages.dev` 地址验证页面可用。
6. 绑定自定义域名（如 `kieranzhang.dev` 与 `www.kieranzhang.dev`），并配置一个方向的 301 重定向避免重复收录。
7. 在 Cloudflare 打开 `Always Use HTTPS` 与 `Auto Minify (HTML/CSS/JS)`。

### 手动构建

构建生成的静态文件位于 `dist/` 目录中，你可以将其上传到任何静态文件服务器（Nginx, Apache, COS/OSS 等）。

```bash
bun run build
```
