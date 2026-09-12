# 首页标注导航：落位与实现

- 日期：2026-09-12
- 来源：`/proto/annotated` 原型（已删除）与用户提供的 neat-annotations 示例
- 相关：DESIGN.md v3 §5.2

## 决定

- 首页不靠顶栏栏目链接，靠一段分行的自我介绍导航：每行一个入口词，词是链接，旁边手写旁注加箭头。
- 实现用 [neat-annotations](https://github.com/syabro/neat-annotations)（纯 CSS，8.5KB，MIT），vendor 到 `src/styles/neat-annotations.css`，站点覆盖在 `global.css`：深色高亮手动给（库依赖 `light-dark()`，站点没有 `color-scheme`）。标签字体用库默认的 Shantell Sans，随 BaseHead 的 Google Fonts 链接加载；Caveat 仍是其它旁注的手写体。
- 两行正文居中排在舞台宽（64rem）内，行距正常不拉开。第一行的两处注（projects 蓝、writing 绿）统一放在上方，第二行的两处（photography 琥珀、about 紫）统一放在下方，块的上下边距留出标签空间。
- 入场沿用 neat-annotations 官网首页的三段式：词的高亮从左向右刷出（background-size），箭头用 clip-path 从标签一端向词画出，最后标签淡入。每条 900ms，从 300ms 起每 250ms 错开一条，四条约 2s 内画完。箭头方向决定 clip 起点：标签在右侧的（sw / nw / w）从右向左画。`prefers-reduced-motion` 下全部关闭、直接显示。
- 旁注颜色放开：用库自带的五色（amber / blue / green / red / purple），不再限于墨与朱砂。青竹仍是页面导向色（顶栏当前项、焦点环、链接悬停），旁注色只出现在旁注和它高亮的词上。
- 720px 以下不画箭头和标签，只留词的高亮与链接；顶栏在小屏仍有菜单。
- 首页顶栏桌面端隐藏四个栏目链接，只留语言和主题切换；其它页面不变。
- 原先在 Mac 旁的签名旁注 `indie since Jun 2026` 并入这组，指向「about me」。

## 否决的方案

- **Margin（右栏批注，自写脚本）**：最像纸边批注，但入口词在行首时箭头要横穿整行行距，看着像划线；1040px 以下没有右栏。
- **Float（行间浮注，自写脚本）**：段落行距要拉到 2.9，正文变松，长注盖到上一行词尾。
- **Inline（行内圈注）**：零脚本最稳，但注插进句子里打断阅读，四处注让一段话很碎。
- **自写箭头脚本**：三个自写变体都要按词坐标算贝塞尔，字体加载与窗口变化时重算。库用伪元素加固定方向的箭头 mask，不用脚本，代价是入口词的落位要顺着方向来安排文案。

## 坑

- 库的标签和箭头不占布局空间，标签在下方的行必须自己留边距。
- 在 Astro 模板里，元素独占一行时它前后的空格会被吃掉，入口词和相邻文字要写在同一行。
- oxlint 解析 `.astro` 时，模板任何位置出现 `---`（包括 CSS 注释里的分隔线）都会被当成 frontmatter 栅栏。
