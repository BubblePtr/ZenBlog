# bubble-build 与 ZenBlog 集成方案

本文档给 `bubble-build` 仓库的实现 agent 使用。目标是让 Bubble 在 Mac mini 上生成日记后，自动把内容投递到 `ZenBlog`，并由 `ZenBlog` 自动生成博客文章。

## 总体目标

链路如下：

```text
Bubble(Mac mini)
  -> 生成日记 JSON
  -> push 到 bubble-build 私有仓库
  -> bubble-build workflow 通知 ZenBlog
  -> ZenBlog workflow 拉取 bubble-build
  -> 生成 MDX 并构建
  -> Cloudflare Pages 自动发布
```

`bubble-build` 只负责“收集和投递原始日记数据”，不直接生成博客 MDX，不直接操作 `ZenBlog` 内容目录。

## bubble-build 仓库职责

需要完成这几件事：

1. 保存 Bubble 的日记原始数据
2. 对 JSON 结构做基础校验
3. 在有新日记 push 后，触发 `ZenBlog` 的同步 workflow

## 目录结构

建议仓库结构如下：

```text
bubble-build/
  entries/
    2026/
      2026-03-06.json
      2026-03-07.json
  schemas/
    diary-entry.schema.json
  .github/
    workflows/
      notify-zenblog.yml
```

## 单篇 entry 格式

路径格式：

```text
entries/YYYY/YYYY-MM-DD.json
```

JSON 格式：

```json
{
  "entry_id": "bubble-2026-03-06",
  "date": "2026-03-06",
  "title": "Bubble 的成长记录 2026-03-06",
  "summary": "今天主要完成了任务编排和自检。",
  "content_markdown": "## 今日记录\n\n今天我主要做了三件事...\n",
  "tags": ["bubble", "daily-log", "openclaw"],
  "mood": "steady",
  "created_at": "2026-03-06T22:10:00+08:00"
}
```

字段要求：

- `entry_id`: 必填，全局唯一，建议固定为 `bubble-YYYY-MM-DD`
- `date`: 必填，格式为 `YYYY-MM-DD`
- `title`: 必填
- `summary`: 可选，但建议生成
- `content_markdown`: 必填，纯 Markdown，不要包含 `import`、`export`、`<script>`
- `tags`: 可选，字符串数组
- `mood`: 可选，可用于标识 `milestone`
- `created_at`: 可选，ISO 时间字符串

## Bubble 侧任务

Bubble 在 Mac mini 上每天完成日记后，需要自动执行：

1. 生成当天 JSON
2. 写入 `entries/YYYY/YYYY-MM-DD.json`
3. `git add`
4. `git commit`
5. `git push`

Bubble 机器上的 token 只需要拥有 `bubble-build` 仓库的写权限，不要给 `ZenBlog` 任何权限。

## bubble-build workflow

需要新增：

```text
.github/workflows/notify-zenblog.yml
```

触发时机：

- push 到 `entries/**/*.json`
- 可选支持 `workflow_dispatch`

workflow 需要做两件事：

1. 校验最新 entry JSON 格式
2. 触发 `ZenBlog` 仓库的 `repository_dispatch`

事件格式建议：

```json
{
  "event_type": "bubble-build-sync",
  "client_payload": {
    "entry_path": "entries/2026/2026-03-06.json",
    "entry_id": "bubble-2026-03-06",
    "overwrite": false
  }
}
```

## 触发 ZenBlog 的方式

推荐使用 `repository_dispatch`。

`bubble-build` 需要一个 secret：

```text
ZENBLOG_DISPATCH_TOKEN
```

这个 token 只需要能触发 `ZenBlog` 的 workflow，不要给更多权限。

如果用 `curl` 触发，调用形态类似：

```bash
curl -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${ZENBLOG_DISPATCH_TOKEN}" \
  https://api.github.com/repos/<owner>/ZenBlog/dispatches \
  -d '{
    "event_type": "bubble-build-sync",
    "client_payload": {
      "entry_path": "entries/2026/2026-03-06.json",
      "entry_id": "bubble-2026-03-06",
      "overwrite": false
    }
  }'
```

## bubble-build 成功标准

实现完成后，需要满足：

1. Bubble 可以每天自动提交一篇 entry 到 `bubble-build`
2. `bubble-build` 在 push 后能自动通知 `ZenBlog`
3. `ZenBlog` 收到通知后能读取指定 `entry_path`
4. 整条链路不需要人工搬运内容

## 和 ZenBlog 的契约

`ZenBlog` 已经会读取：

- `vars.BUBBLE_BUILD_REPOSITORY`
- `secrets.BUBBLE_BUILD_READ_TOKEN`
- `repository_dispatch` 里的 `client_payload.entry_path`

所以 `bubble-build` agent 只需要保证：

1. 仓库名就是 `bubble-build`
2. `entries/YYYY/YYYY-MM-DD.json` 结构稳定
3. 触发 dispatch 时带上正确的 `entry_path`

## 实施建议

第一版不要做：

- 后台 UI
- 数据库
- 多阶段状态流
- 自动改写历史 entry

先把“每天一篇 Bubble 日记自动投递到 ZenBlog”跑通。
