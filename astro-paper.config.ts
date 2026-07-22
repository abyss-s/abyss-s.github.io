import { defineAstroPaperConfig } from "./src/types/config";

// 블로그 전역 설정 파일 — 제목/작성자/소셜 링크는 여기서 수정
export default defineAstroPaperConfig({
  site: {
    url: "https://abyss-s.github.io/",
    title: "abyss-s.log",
    description: "abyss-s의 개발 블로그",
    author: "abyss-s",
    profile: "https://github.com/abyss-s",
    ogImage: "default-og.jpg",
    lang: "ko",
    timezone: "Asia/Seoul",
    dir: "ltr",
  },
  posts: {
    perPage: 8,
    perIndex: 5,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/abyss-s/abyss-s.github.io/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/abyss-s" },
    { name: "mail", url: "mailto:lh3729@gmail.com" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
