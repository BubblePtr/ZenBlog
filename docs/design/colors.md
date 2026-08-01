# 色彩系统

> 2026-08 确立。单一事实来源：`src/styles/global.css` 中的 `@theme inline` + `:root` / `.dark` 变量块。

## 设计原则

站点内容扁平（正文、meta、少量卡片），因此只定义**角色（role）token**，不建全色阶。全部值用 `oklch()` 表达。共五个角色、九个 token：

| 角色 | Token | 工具类 | 浅色 | 深色 | 用途 |
| --- | --- | --- | --- | --- | --- |
| 纸 | `--color-paper` | `bg-paper` | `oklch(0.98 0.006 60)` 微暖宣纸 | `oklch(0.141 0.005 286)` zinc-950 | 全站唯一底色；header 毛玻璃、selection 反白字 |
| 面 | `--color-surface` | `bg-surface` | `oklch(0.985 0 0)` | `oklch(0.21 0.006 286)` | 轻微抬起的表面：代码块、卡片、TOC 面板 |
| 墨（强） | `--color-ink-strong` | `text-ink-strong` | 黑 92% | 白 92% | 标题、strong、激活态 |
| 墨（正文） | `--color-ink` | `text-ink` | 黑 87% | 白 87% | 正文默认色（body 即此色） |
| 墨（次） | `--color-ink-secondary` | `text-ink-secondary` | 黑 60% | zinc-400 实色 | 次要文字、引用、锚点 |
| 墨（弱） | `--color-ink-tertiary` | `text-ink-tertiary` | 黑 38% | zinc-500 | 日期戳、最弱 meta |
| 线 | `--color-line` | `border-line` | zinc-200 | zinc-700 | 默认分隔线/描边 |
| 青竹 | `--color-accent` | `text-accent` 等 | `oklch(0.44 0.075 157)` | `oklch(0.734 0.08 159)` | 唯一强调色，见下 |
| 青竹（强） | `--color-accent-strong` | — | `oklch(0.36 0.075 157)` | `oklch(0.8 0.08 158)` | 强调色的加深/加亮态（预留） |

## 关键约定

1. **青竹只做 wayfinding**：链接 hover、focus ring、导航激活态、TOC 激活项、kicker、::selection。不做大面积填充。竹与玉之色，象征君子。纸面上 7.1:1（AAA），墨底上 8.6:1（AAA）。彩度定在 C 0.075（浅）/ 0.08（深）——这是「一眼可辨是绿」的门槛，最初的 C 0.046 会沉进墨字里读作灰；再往上（C≥0.10）则开始抢戏（2026-08 三档截图对比后定档）。
2. **墨用透明度分级**（墨分浓淡）：黑/白 + alpha，叠在纸和面上都自然成立。唯二例外是深色模式的次/弱两级用 zinc 实色——带一点色温，比透明白更有质感。
3. **明暗切换是重映射不是重绘**：所有 token 在 `.dark` 下翻转取值，组件用 `bg-paper` / `text-ink` 等类即可，**不需要写 `dark:` 变体**。
4. **zinc 是唯一允许的中性灰 family**：局部一次性的中性色（如照片卡边框、图库骨架）可直接用 `zinc-*` 工具类，但禁止引入 neutral/stone/gray/slate。
5. **新增颜色一律写 oklch**，不再出现 hex / rgb / hsl 字面量；透明度写在 `/` 后。
6. 原生 CSS 里（`<style>` 块、global.css）直接用 `var(--color-*)`；class 里用工具类，避免 `text-[var(...)]` 任意值写法。

## 有意保留的例外

- **Lightbox**：遮罩、按钮用固定黑白（`bg-black/80`、`border-white/15`），照片查看器两个模式下都应是暗场，不随主题翻转。
- **DappledLight 剪影**：`oklch(0.42 0.02 60)` 暖墨，物理光影，模式不变。
- **代码高亮**（Shiki 主题）与 **Callout** 的语义色（蓝/黄/绿/红）暂不入 token，等有第二个消费方再抽象。
- **代码块红绿灯**：装饰性 red/amber/emerald-400，与 `DemoBrowser.client.tsx` 同一组。

## 历史

- 2026-07 杂志改版的「图纸蓝」与更早的橙色强调色均已废弃。
- 2026-08 本次重构：删除了 `_variables.scss`（291 行零引用的 TipTap 遗留 token）、`--rainbow-*`、`--background`/`--foreground`（无消费方）、未定义就被引用的 `--color-text-tertiary`（此前永远落在 `#b3b3ae` 兜底且不分明暗）；`--color-text-primary/secondary/emphasis/disabled` 收编为 ink 四级。
