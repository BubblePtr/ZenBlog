---
name: new-photo
description: Add a new photo to the photography collection — runs EXIF sync and R2 upload
disable-model-invocation: true
---

Help the user add a new photo to the photography collection.

Steps:
1. Ask for the photo file path and a kebab-case slug for the collection entry
2. Create `src/content/photography/<slug>.md` with required frontmatter (title.en/zh, date, camera, lens fields)
3. Run `bun run photos:sync-exif` to populate EXIF fields from the actual file
4. Run `bun run r2:images:upload` to push the original image to Cloudflare R2
5. Run `bun run photos:variants -- --bucket=blog-images` to generate and upload display WebP variants (`-w800.webp`, `-w1600.webp`)
6. Show the resulting frontmatter and remind the user to restart the dev server
