---
title: "시맨틱 태그와 미디어 쿼리로 자기소개 페이지 개선하기"
description: "기존 자기소개 페이지의 접근성·반응형 문제를 분석하고 시맨틱 태그와 미디어 쿼리로 개선한 과정"
author: abyss-s
pubDatetime: 2025-01-26T17:28:37+09:00
tags:
  - URECA
  - HTML
  - CSS
---

> 티스토리 원문: <https://tomymoon.tistory.com/176>

![자기소개 페이지 과제](@/assets/images/ureca/intro-page/01-banner.png)

자기소개 페이지 과제의 설계와 개발 과정을 정리했다.

---

## 과제 소개

1주차 프론트엔드 반의 과제는 바로 자기소개 페이지를 만드는 것이었다. 아무래도 다들 처음보는 사이이기도 하고, 특히 비대면 반의 경우는 직접 만날 수 없어서 서로 잘 모르는 상황이다. 그래서 첫주차에 배운 HTML, CSS를 활용해서 자기소개 페이지를 만들어보는 것이 과제인듯 했다.

![과제 안내](@/assets/images/ureca/intro-page/02-assignment.png)

## 개선해야 할 점을 찾아보자!

나는 사실 작년에 동아리 과제로 만든 자기소개 페이지가 이미 있었다!! 이때도 동일한 조건으로 html, css만을 활용해서 제작했다.

![기존 자기소개 페이지](@/assets/images/ureca/intro-page/03-old-page.png)

먼저 이러한 구성으로, 전체적으로 중앙정렬을 사용하고 왼쪽에 메뉴 네비게이션 바를 두었다. 그냥 보기에는 매우 깔끔하지만, 몇가지 문제점이 있었다. 기존 자기소개 페이지의 문제점을 개선해서 설계하기 위해 다음과 같이 분석했다.

### 1. 페이지 접근성 부족

![시맨틱 태그 구조 분석](@/assets/images/ureca/intro-page/04-semantic.png)

기존 페이지의 HTML 시맨틱 태그 구조를 분석한 결과, 헤더와 푸터 부분은 적절하게 설계된 반면, 메인 부분의 태그 구조에는 몇 가지 문제가 있다.

우선, 메인 요소들을 하나로 묶는 main 태그가 사용되지 않았으며 빈 article 태그가 존재하거나 article 내에 포함되지 않은 컨테이너 `div` 태그가 포함되어 있다. 이는 HTML 구조를 체계적으로 설계하지 않아, 리팩토링 도중 나중에 요소들을 임의로 추가한 것으로 보이다.

이런 식의 불친절한 구조는 페이지 탐색을 어렵게 만들고 사용자 경험을 저하시킬 수 있고, 검색 엔진 최적화(SEO)에도 좋지 않다. 따라서 이번 과제에서는 이러한 구조를 명확히 지키기 위해 노력했다.

### 2. 반응형 웹 뷰 문제

현재 pc화면에서는 별다른 문제가 없는 것처럼 보이지만, 화면의 너비가 줄어들면 문제가 발생한다.

![반응형 문제](@/assets/images/ureca/intro-page/05-responsive-issue.png)

여기서 발견할 수 있는 문제는 크게 2가지이다.

> - 네비게이션 바의 모호한 위치로 인해 콘텐츠 영역을 일부 가린다.
> - 내용들이 왼쪽으로 치우쳐 보인다.

위 문제들은 잘못된 css 속성 사용 및 미디어 쿼리의 부재로 인해 발생했다.

내가 이전에 설계한 body의 css는 다음과 같다.

```css
body {
  /* 배경 설정 */
  background: linear-gradient(rgb(241, 210, 255), skyBlue, rgb(249, 148, 222));
  text-align: center;
  justify-content: center;
  font-family: Galmuri14;
}
```

여기서 display가 flex로 설정되지 않았기 때문에 화면이 중앙정렬되지 않는다. display가 block으로 자동 설정되면서 콘텐츠 영역에도 중앙정렬 속성이 먹히지 않았다.

또한 반응형 뷰를 위한 미디어 쿼리를 사용하지 않아 모바일에서는 콘텐츠들이 제대로 보이지 않았다. 사진들이 깨져서 보인다거나, 메뉴바에 가려져서 글씨들이 일부분 가려지는 모습이었다.

## 개선된 자기소개 페이지는요

![개선된 페이지 구조](@/assets/images/ureca/intro-page/06-new-page.png)

먼저 시맨틱 태그의 구조를 명확히 했다. 크게는 header, main, footer 영역으로 나누었다. main 내에서는 section들을 나열하고, 모든 섹션에 card 클래스를 적용해 전체적인 스타일을 통일했다.

또한 이전 과제처럼, 각 섹션에 고유 id를 부여하여, 메뉴바에 a 태그의 href를 연결해 자바스크립트 없이 네비게이션 기능을 구현했다.

![네비게이션 동작](@/assets/images/ureca/intro-page/07-nav.gif)

또한 nav바를 위쪽 상단에 나란히 배치하여, 콘텐츠 영역을 가리지 않고도 메뉴바의 역할을 충실히 할 수 있도록 했다. 전체적으로 파란색과 보라색을 섞은 컬러 시스템을 사용해 눈에 무리가 없게 디자인했다.

body의 스타일은 다음과 같다.

```css
body {
  font-family: 'LGEITextTTF-Regular', 'Noto Sans', sans-serif;
  line-height: 1.6;
  background-color: #f4f4f9;
  color: #333;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
}
```

기본적으로 전역 행간 및 LG 폰트를 적용하고, 미디어 쿼리를 사용해 너비 768px 이하 모바일 뷰에서는 폰트 사이즈를 원래보다 약간 작게 설정했다.

또한 기존에 문제가 있었던 모바일뷰에서 이미지 보기는 grid를 이용해서 해결했다.

```css
.hobby-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
```

이미지를 배치하는 클래스 내에서는 일반적으로 2개씩 배치하도록 하고, 768px 이하의 브라우저에서는 1개씩 배치하도록 미디어 쿼리를 설정했다.

![PC 뷰](@/assets/images/ureca/intro-page/08-pc.png)

![모바일 뷰](@/assets/images/ureca/intro-page/09-mobile.png)

이런식으로 pc와 모바일뷰에서 동적으로 변하는 이미지 배치를 확인하실 수 있다. 최대한 어느 브라우저 환경에서나 깔끔하게 보일 수 있도록 설계했다😊

## 개선 전후 성능 비교 및 회고

![Lighthouse 개선 전](@/assets/images/ureca/intro-page/10-lh-before.png)

![Lighthouse 개선 후](@/assets/images/ureca/intro-page/11-lh-after.png)

lighthouse 분석결과 접근성 및 SEO 부분이 90 이상으로 개선된 모습을 확인했다. 이미지 용량은 고려하지 않아서 퍼포먼스는 비슷하다..😅

먼저 이번 과제를 통해 유레카에서 배운 웹 문서의 시맨틱 태그 구조를 분석하며 기존에 설계해둔 페이지를 리팩토링하는 좋은 기회가 되었다! 또한 프로젝트를 다수 하는 동안 프레임워크나 라이브러리에 이미 존재하는 스타일을 그대로 가져와서 사용하느라, css 속성에 대해 깊이 생각해본적이 없었다. 오직 css만을 사용해서 페이지를 디자인하는 재미도 알게 되었다~!

연휴동안은 잠시 교육이 쉬어가지만, 자바스크립트 공부를 개인적으로 미리 해올 생각이다🙌

---

> 전체 코드는 깃허브에서 확인할 수 있다:)

<https://github.com/abyss-s/ureca-introduce-myself/blob/main/index.html>
