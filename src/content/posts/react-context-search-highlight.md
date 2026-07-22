---
title: "Context API로 검색 키워드 하이라이팅 구현하기"
description: "props drilling 없이 Context API와 react-highlight-words로 검색 키워드 하이라이팅을 구현한 기록"
author: abyss-s
pubDatetime: 2025-04-26T18:20:56+09:00
tags:
  - React
  - useContext
---

> 티스토리 원문: <https://tomymoon.tistory.com/213>

![Context API 키워드 하이라이팅](@/assets/images/react/context-highlight/01-banner.png)

요즘 사이드 프로젝트로 '그리미티'라는 플랫폼을 개발하고 있다. 검색 기능을 구현하면서 **검색한 키워드를 결과 리스트 내에서 강조(하이라이트)** 하는 기능을 새로 도입하게 되었다.

처음에는 검색어를 props로 하나하나 내려서 강조하려고 했다. 그런데 컴포넌트가 많아질수록 관리가 어려워질 것 같았다. 그래서 **Context API로 검색 키워드와 하이라이트 함수를 전역으로 공유하는 방법**을 선택했다.

## Context를 사용한 이유?

1. **검색 결과는 한 번의 API 호출로 처리됨** — 사용자가 검색어를 입력하면 해당 검색어에 맞는 결과를 API 호출로 받아온다. 검색어가 바뀔 때마다 새로운 데이터를 가져와서 보여주는 방식이라 어차피 하위 컴포넌트들이 전부 리렌더링된다. 굳이 Zustand에 새로운 전역 상태를 만들 필요 없이 Context API만으로 충분하다고 판단했다.
2. **props drilling을 방지할 수 있음** — Context로 관리하면 여러 컴포넌트가 동일한 데이터를 공유할 수 있다. DOM 트리 중간의 여러 컴포넌트를 거쳐 상태를 전달할 필요 없이 컨텍스트에서 직접 가져다 쓰면 되니 코드가 간결해지고 유지보수도 쉬워진다.

## react-highlight-words 라이브러리 사용

키워드 강조는 직접 문자열을 파싱해서 처리할 수도 있지만, HTML·특수문자·대소문자 구분 같은 복잡한 케이스가 생각보다 많았다. 그래서 이미 검증된 라이브러리인 [`react-highlight-words`](https://www.npmjs.com/package/react-highlight-words)를 사용했다.

선택한 이유는 이렇다.

- 특수문자, HTML 이스케이프 등을 자동으로 안전하게 처리해준다.
- `autoEscape`, `highlightClassName` 등 유용한 옵션을 제공한다.
- 텍스트 내 다중 키워드 강조가 매우 쉽다.

## 다이어그램

Context API로 키워드 강조 기능을 이렇게 설계했다.

**키워드 하이라이팅**은 검색 페이지에서만 쓰이는 기능이라, 전역 상태(zustand)로 관리하는 건 과하다고 판단했다. 대신 **SearchHighlightContext**를 만들어 검색 페이지 범위에서만 상태를 관리하고 **SearchPage**에 전달했다.

![Context 설계 다이어그램](@/assets/images/react/context-highlight/02-diagram.png)

- **SearchPage**에서 Context를 공급하고, 프로바이더로 감싼다.
- **SearchProfile**, **SearchCard** 등 하위 컴포넌트에서 `useContext`로 하이라이트 함수를 사용한다.

## 구현 방법

### 1. Context 생성

createContext로 하이라이팅용 인터페이스를 만든다.

```tsx
import React, { createContext } from "react";

interface SearchHighlightContextType {
  highlight: (text: string) => React.ReactNode;
  keyword: string;
}

export const SearchHighlightContext = createContext<SearchHighlightContextType>({
  highlight: (text: string) => text,
  keyword: "",
});
```

### 2. Provider 구성

react-highlight-words를 활용해 **하이라이팅 기능**을 제공하는 highlight 함수와 검색어(keyword)를 **SearchHighlightContext.Provider**로 검색 페이지에 공급한다.

```tsx
import { useRouter } from "next/router";
import Highlighter from "react-highlight-words";

export default function Search() {
  const router = useRouter();
  const keyword =
    typeof router.query.keyword === "string" ? decodeURIComponent(router.query.keyword) : "";

  const highlight = (text: string): React.ReactNode => {
    if (!text || !keyword) return text;

    return (
      <Highlighter
        highlightClassName="highlighted-keyword"
        searchWords={[keyword]}
        autoEscape
        textToHighlight={text}
        highlightStyle={{
          color: "#2bc466",
          backgroundColor: "transparent",
        }}
      />
    );
  };

  return (
    <SearchHighlightContext.Provider value={{ highlight, keyword }}>
      <SearchPage />
    </SearchHighlightContext.Provider>
  );
}
```

![기본 하이라이트 스타일](@/assets/images/react/context-highlight/03-default-style.png)

배경색을 따로 지정하지 않으면 위 사진처럼 노란 형광펜 같은 배경색이 칠해진다. 그래서 배경색은 투명으로 설정했다.

### 3. 하위 컴포넌트 적용

SearchProfile, SearchCard, AllCard 같은 하위 컴포넌트에서는 useContext로 **하이라이팅 함수**를 받아와 **검색어가 포함된 텍스트를 강조**한다.

```tsx
// SearchProfile 컴포넌트
import { useContext } from "react";
import { SearchHighlightContext } from "@/pages/search";

export default function SearchProfile({ name, description, ... }: SearchProfileProps) {
  const { highlight } = useContext(SearchHighlightContext); // useContext 사용

  return (
    <div>
    ...
      <p>{highlight(name)}</p>
      <p>{highlight(description)}</p>
    ...
    </div>
  );
}
```

## 구현 화면

프로필, 그림 등의 검색 결과 페이지에서 하이라이팅이 제대로 적용된 모습이다.

실제 페이지: <https://www.grimity.com/search>

![구현 화면 1](@/assets/images/react/context-highlight/04-result1.png)

![구현 화면 2](@/assets/images/react/context-highlight/05-result2.png)

상태의 사용 범위를 먼저 따져보고, 페이지 단위로만 쓰이는 상태라면 전역 스토어 대신 Context로 좁게 관리하는 게 더 낫다는 감각을 얻은 작업이었다.
