# CLAUDE.md

Guidance for Claude agents working in this repository.

## Project Overview

Personal blog for `abyss-s`, built with [AstroPaper v6](https://github.com/satnaing/astro-paper) (Astro 7 + Tailwind CSS 4). Deployed to GitHub Pages at https://abyss-s.github.io via GitHub Actions.

## Language Rules (IMPORTANT)

- Write prompts, commit messages, and code identifiers in **English**.
- Write ALL code comments and important explanations in **Korean**, kept to 1–2 lines each.
- Blog post content is written in Korean unless specified otherwise.

## Key Paths

- `src/content/posts/` — blog posts (`.md` / `.mdx`). One file per post.
- `src/content/pages/about.md` — the About page.
- `astro-paper.config.ts` — site title, author, socials, features. Edit here for blog metadata.
- `.github/workflows/deploy.yml` — deploys to GitHub Pages, **main branch only**.
- `.github/workflows/ci.yml` — build check on `develop` pushes and PRs to `main`.

## Post Frontmatter

```yaml
---
title: "Post title"
description: "Short description"
pubDatetime: 2026-07-21T12:00:00+09:00  # 원하는 날짜로 자유롭게 지정 가능 (과거/미래 모두 허용)
tags:
  - tag1
draft: false
---
```

- `pubDatetime` controls the displayed date; set it to any value.
- Future-dated posts are hidden until that time passes (see `scheduledPostMargin`).
- `draft: true` hides a post from the site.

## Branch Policy

- Work on `develop`; merge into `main` when ready to publish.
- Deployment runs ONLY on pushes to `main`. Never push work-in-progress to `main` directly.

## Commands

- `npm run dev` — local dev server (http://localhost:4321). Requires Node >= 22.12.
- `npm run build` — production build (`astro check` + build + pagefind). Run before merging to main.
- `npm run format` / `npm run lint` — Prettier / ESLint.
