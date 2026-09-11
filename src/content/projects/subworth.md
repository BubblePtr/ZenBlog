---
title: 'SubWorth'
description: 'An open benchmark measuring what AI coding subscriptions actually deliver, in dollars of equivalent API usage.'
order: 2
heroImage: './images/subworth-hero.png'
stack: ['Bun', 'TypeScript', 'Astro', 'Vercel']
demo: 'https://subworth.vercel.app'
status: 'building'
---

Check your sub's worth.

Providers advertise subscriptions as "5x Pro" or "20x Pro" but never say how many dollars that is. SubWorth answers with numbers anyone can observe locally: a passive collector snapshots quota windows from the coding agent's own status line, prices the observed usage at the official API rate card, and derives a monthly ceiling and a Worth Multiple for each plan.

The method is being validated in the open before any figure is published: a fourteen-day live experiment across Claude, Kimi and Codex subscriptions, with raw progress on the site and criteria that can still void the first estimate. Collectors run on macOS and Linux and push anonymised bundles from several machines into one merged view.
