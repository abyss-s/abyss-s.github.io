# Post Quality Standards

Editorial rules for ALL posts on this blog — new posts, migrated posts, and edits.
Derived from the author's own editing patterns. Apply these automatically whenever writing or reviewing a post.

## 1. Titles

- NEVER prefix titles with bracketed categories like `[React]`, `[TIL]`, `[URECA]`, `[행사]`. Categories belong in tags.
- The title must summarize the content, not the occasion.
- Keep titles SHORT: one natural phrase. Do NOT tack on a `- 부제` subtitle by default — only add one when it carries essential information the main title cannot.
  - Bad: `[React] 낙관적 업데이트 구현해보기` (bracket prefix)
  - Bad: `낙관적 업데이트 구현기 - 빠른 토글 버그와 react-query 리팩토링` (unnecessary subtitle, keyword-stuffed)
  - Good: `낙관적 업데이트(Optimistic Update) 제대로 구현해보기`
- When migrating, prefer the author's original title with only the bracket prefix removed, unless it is misleading.

## 2. Content bar (no beginner-tutorial posts)

This is a technical blog, not a study diary. Do not publish:

- Step-by-step install/deploy walkthroughs of trivial tasks (e.g. "click Settings, then click Pages")
- Posts whose only content is following official docs with screenshots
- Posts with no insight beyond "I did X and it worked"

A post earns its place when it contains at least one of: a debugging journey, a design decision with trade-offs, a measured result, or a non-obvious lesson. When migrating or drafting, either raise the post to that bar or suggest dropping it.

## 3. Voice

- Korean plain style (`~했다`, `~이다`) throughout. No `~습니다`/`~해요`.
- First person is `나/우리`, never `저/저희`.
- No formulaic openers ("안녕하세요", "오늘은 ~을 알아보겠습니다") or closers ("도움이 되셨길 바랍니다").
- Keep the author's personality (emoji, casual asides) — polish, don't sterilize.
- Reader-facing notices (e.g. a note to future applicants) may keep polite style if quoting intent.

## 4. Markdown pitfalls

- CommonMark bold breaks when the closing `**` is preceded by punctuation and followed by a letter.
  - Broken: `**'구조'**였다`, `**UX(경험)**을`
  - Fixed: `'**구조**'였다`, `**UX**(경험)을`
  - Rule: keep quotes/brackets OUTSIDE the `**` markers, or end the bold on a letter.
- Blank line required before lists and after headings (CommonMark).
- Do not bold-spam; bold only the key phrase of a paragraph.

## 5. Images

- All images must live in the repo under `src/assets/images/<topic>/`, referenced as `@/assets/images/...`.
- NEVER hotlink external CDNs (Tistory/kakaocdn URLs carry expiring signatures and will break).
- Give images descriptive Korean alt text.

## 6. Frontmatter

- `title` follows rule 1. `description` is a one-line summary (not a copy of the title).
- `pubDatetime` keeps the original date for migrated posts.
- Tags: category-style tags (`React`, `URECA`, `Conference`, `OSSCA`) plus at most 1-2 topic tags.
- `featured: true` only for flagship posts (awards, deep dives).
