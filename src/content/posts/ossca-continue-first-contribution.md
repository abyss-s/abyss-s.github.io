---
title: "Continue 오픈소스에 첫 PR을 머지하기까지"
description: "Continue 오픈소스에서 React DOM prop 경고를 발견하고 수정해 첫 PR을 머지한 과정과 회고"
author: abyss-s
pubDatetime: 2024-10-13T23:12:57+09:00
tags:
  - OSSCA
  - Continue
---

오픈소스 컨트리뷰션 아카데미에 참가하면서 목표가 하나 있다면 소소한 기여라도 하나쯤은 꼭 해보자! 였다😄

그래서 Continue의 공식문서를 열심히 정독하고 Issue들도 많이 읽어보았다. 문제가 있다면 전부 영어여서 읽는데 오랜 시간이 걸렸다는 점?.. 그리고 아무래도 LLM 관련 이슈는 나 혼자 해결하기 버거운 것들이 많았다.

일단 무작정 Repo를 fork 하고 직접 실행하면서 폴더 구조 및 파일들을 살펴보기로 했다.

![Continue repo fork](@/assets/images/ossca/contribution/01-fork.png) 이후 dev 브랜치에서 프로젝트를 실행하며 찬찬히 코드를 살펴보았다.

가장 유심히 본 부분은 핵심적인 기능을 담고있는 core와 익스텐션을 보여주는 gui 폴더였다. 사실 타입스크립트를 깊게 공부해본 적은 없지만, 기본 자바스크립트에 타입명만 추가해주었다고 생각하니 별반 차이가 없어서 생각보다 구조를 파악하는 것은 어렵지 않았다.

## Warning 문제 발견

그렇게 코드를 실행시키며 열심히 둘러보다가 문득 콘솔 창에서 경고를 발견했다.

다른 부분을 클릭할 때는 별다른 경고가 뜨지 않았는데, Select model을 누르는 순간 개발자 도구의 콘솔 창에 다음과 같은 경고가 발생했다.

![콘솔 경고](@/assets/images/ossca/contribution/02-warning.png)

> chunk-V5LT2MCF.jsv=bfff8e56:521 Warning: React does not recognize the `showAbove` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `showabove` instead. If you accidentally passed it from a parent component, remove it from the DOM element.

대충 읽어보니 showAbove라는 이름을 가진 prop 속성과 관련된 문제로 보였다. 그래서 해당 문제가 발생하는 부분이 어디인지 코드에서 찾아보았다.

## 문제 원인

`gui/src/components/modelSelection/ModelSelect.tsx` 파일에서 사용하는 showAbove props가 돔에 그대로 전달되고 있었다. 만약 부모 컴포넌트로부터 props를 전달받았다면, `$showAbove` 달러기호를 접두사로 붙이고 소문자로 변경해야 한다.

해당 파일은 styled-components로 스타일링하고 있었는데, 이런 props는 HTML 요소까지 내려가지 않도록 막아야 한다. 그렇지 않으면 DOM에 그대로 전달되어 불필요한 렌더링을 일으킬 수 있고, 접두사를 붙여야 이 변수가 스타일링 전용 props라는 것도 명확해진다.

styled-components의 공식문서에도 관련된 글이 있다. 스타일이 적용된 구성 요소에서 사용될 props가 기본 React 노드로 전달되거나 DOM 요소에 렌더링되는 것을 방지하려면 prop 이름 앞에 달러 기호($)를 접두사로 붙여서 일시적인 prop(transient prop)으로 바꿀 수 있다고 적혀있다.

<https://styled-components.com/docs/api#transient-props>

## 해결 방법

![수정 diff](@/assets/images/ossca/contribution/03-fix.png)

ModelSelect.tsx의 모든 showAbove props 이름을 `$showabove`로 변경하면 콘솔창에 경고가 출력되지 않는다.

## Pull Request

먼저 변경사항을 커밋하고, 내 저장소로부터 원격 저장소에 push한다. 이후 적절히 PR을 날린다.

컨티뉴에는 기여 가이드와 함께 PR 컨벤션이 제공되고 있었다. 따라서 이 컨벤션에 맞춰서 작성하려고 노력했다. 복잡한 작업이 아니기 때문에 따로 테스트 코드는 넣지 않았다. 영어는.. 자신이 없어서 파파고의 도움을 받았다ㅎㅎ

![작성한 PR](@/assets/images/ossca/contribution/04-pr.png)

PR 본문에는 문제 상황과 원인, 해결 방법을 스크린샷과 함께 정리했다. 오픈소스 기여가 처음이기 때문에 혹시 문제가 있다면 리마인드해달라고 부탁했다..😅

## 피드백

![메인테이너 피드백](@/assets/images/ossca/contribution/05-feedback.png)

정말 놀랍게도 코멘트를 달아주셨다..! 처음이라 설명을 좀 열심히 적었는데 알아주신 것 같아 기뻤다.

친절하게도 props name만 변경하고, 상태관리 변수명은 그대로 두어야한다는 피드백을 남겨주셨다.

알고보니 내가 변경할때 vscode 기능에 있는 replace 기능을 사용해서 해당 파일의 모든 showAbove 글자를 변경했는데, 이와 똑같은 이름의 redux 상태관리 변수명이 있었던 것이다.

따라서 이 변수명과 이와 관련된 name은 변경되면 안되고, 오직 props 속성과 관련되어 문제를 일으킬 수 있는 부분만 변경하도록 다시 수정해서 커밋했다.

## Contribution 완료

![PR 승인](@/assets/images/ossca/contribution/06-merged1.png)

![dev 브랜치 병합](@/assets/images/ossca/contribution/07-merged2.png)

수정사항까지 최종적으로 승인되어 dev 브랜치로 병합되었다! 이제 Continue 레포에 들어가면 컨트리뷰터가 되었기 때문에, 내 깃허브 프로필에 pin할 수도 있다😃

관련 PR: <https://github.com/continuedev/continue/pull/2508>

## 첫 기여에 대한 회고

오픈소스 기여라고 하면 흔히 "대단한 무언가를 해야 한다"라는 압박감을 가지기 쉽다. 하지만 오픈소스 기여는 대단한 개발 실력보다는 '소통'이라는 행위 그 자체에 더 큰 의미가 있다는 것을 깨달았다. 처음부터 모든 것을 완벽하게 이해하려고 하기보다는 일단 그냥 시작을 해보자!!

처음 오픈소스에 기여하려고 할 때, 솔직히 어디서부터 시작해야 할지 막막했다. 처음에는 공식 문서를 꼼꼼히 읽고 프로젝트 레포지토리를 살펴보며 코드 구조를 파악하려고 노력했다. 직접 코드를 실행해보면서 그저 감을 익히는 것만으로도 큰 도움이 되었다. 물론 지금도 완벽히 이해하진 못했을 수 있다.. (특히 RAG 관련 부분은 너무 어렵다 ㅎㅎ)

하지만 오픈소스 커뮤니티는 열려있다. 혼자 고민하다 막힐 때도, 디스코드나 깃허브 디스커션을 통해 질문을 던지면 전 세계 개발자들이 도움을 줄 수 있다는 점이 큰 장점이다. 처음에는 영어 실력이 좀 문제가 되지 않을까 했지만 파파고 같은 번역기 퀄리티가 높아져서 큰 어려움 없이 소통할 수 있었다.

물론 모든 PR이 받아들여지는 것은 아니다. 하지만 중요한 것은 기여하려고 노력하는 과정 자체라고 생각한다. 나도 첫 커밋에서 잘못된 부분을 몰랐다가, 피드백을 받은 덕분에 올바른 방향으로 수정할 수 있었다. 따라서 너무 완벽하려고 하기보다는 다같이 만들어가는 프로젝트라고 생각하고 의견을 던져보는 것도 좋을 것 같다. 엄청나게 대단한 것을 기여한 것은 아니지만.. 그래도 뿌듯하고 앞으로 더 큰 기여를 할 수 있는 발판이 되었다고 생각한다!!🤗
