---
title: 'Pace'
description: 'The desktop GUI for the Pi coding agent: sessions, trajectories, token and cost truth, and extension-registered panels.'
order: 0
heroImage: './images/pace-hero.png'
stack: ['Electron', 'React 19', 'TypeScript', 'Bun', 'Pi SDK']
github: 'https://github.com/BubblePtr/pace'
demo: 'https://github.com/BubblePtr/pace/releases'
status: 'building'
---

Move at your own pace.

Pi is a terminal coding agent with a VS Code-style extension system: packages contribute tools, commands, skills, prompts and themes. Pace carries that flexibility to the desktop, so a developer can shape an agent client that is truly their own instead of renting one.

Pace is not a fork of Pi and not a second runtime. Pi's local session log stays the single source of truth; Pace only projects Pi's event stream into a journal and renders everything from it: the live chat, the Trajectory view of chain of thought and tool calls, and per-turn token and cost accounting. The backend runs in a separate Electron utility process, so heavy log parsing can never make the window stutter.

Shipped as signed and notarized DMGs for Apple Silicon with in-app updates. The Pi runtime is bundled, and Pi extensions can register their own Session Dock panels without waiting for a Pace release.
