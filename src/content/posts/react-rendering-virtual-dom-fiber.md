---
title: "리액트 렌더링 동작 방식 파헤치기"
description: "브라우저 렌더링 파이프라인부터 Virtual DOM, Diffing 알고리즘, Fiber 아키텍처까지 React의 내부 동작 원리 정리"
author: abyss-s
pubDatetime: 2025-08-28T18:07:48+09:00
tags:
  - React
---

> 티스토리 원문: <https://tomymoon.tistory.com/218>

![리액트 렌더링 동작 방식](@/assets/images/react/rendering/01-banner.png)

React는 가장 많이 사용되는 프론트엔드 라이브러리다. 하지만 정작 React의 내부 동작 원리를 정확히 이해하고 사용하는 개발자는 많지 않다. 나 역시 페이지나 컴포넌트를 만들고 상태를 관리하는 것에만 집중했지, React가 어떻게 효율적으로 DOM을 업데이트하는지에 대해서는 깊이 생각해보지 않았다.

면접 스터디를 하면서 React의 핵심 동작 원리를 다시 정리하며 공부해보기로 했다. React 공식문서와 MDN 문서 등을 살펴보며 정리한 내용이다 :)

## 목차

1. 브라우저 렌더링 과정과 업데이트 시점
2. React를 사용하는 이유
3. React의 렌더링 프로세스
4. 재조정(Reconciliation) 과정
5. Virtual DOM과 실제 DOM
6. Diffing 알고리즘
7. Fiber 아키텍처
8. Virtual DOM의 한계점
9. 정리

## 브라우저 렌더링 과정과 업데이트 시점

### Update는 언제 이뤄질까

과정을 이해하기 위해서는 브라우저가 언제 화면을 업데이트해야 하는지 알아야 한다. 자바스크립트가 DOM을 업데이트하면 재렌더링이 일어난다. DOM이 수정되면 Critical Rendering Path도 다시 실행된다.

### Critical Rendering Path

브라우저 렌더링 과정은 Critical Rendering Path라고도 한다. React가 DOM을 업데이트하면, 브라우저가 다음과 같은 렌더링 파이프라인을 실행한다.

![Critical Rendering Path](@/assets/images/react/rendering/02-crp.png)

#### 1. DOM 트리 생성

HTML 파싱을 통해 DOM 트리를 생성한다.

#### 2. CSSOM 트리 생성

CSS 파싱을 통해 CSSOM(CSS Object Model) 트리를 생성한다.

#### 3. 렌더 트리 생성

DOM 트리와 CSSOM 트리를 결합해서 화면에 표시될 요소들만 포함한 렌더 트리를 생성한다.

#### 4. 레이아웃(Layout)

실제 웹페이지에 배치될 각 요소의 정확한 위치와 크기를 계산한다. 이 단계가 다시 실행되는 것을 **리플로우**(Reflow)라고 한다.

#### 5. 페인팅(Paint)

실제 픽셀을 화면에 그린다. 레이아웃 변경 없이 색상만 바뀌는 경우를 **리페인트**(Repaint)라고 한다.

#### 6. 컴포지팅(Compositing)

여러 레이어를 합성해서 최종 화면을 만든다.

## React를 사용하는 이유

이때, 레이아웃 및 페인팅은 비싼 과정이다. 리플로우와 리페인트는 연산이 비싸 성능에 좋지 않다.

#### 브라우저 렌더링의 시간복잡도 문제

브라우저 렌더링은 DOM 노드 수에 따라 시간복잡도가 증가한다. 일반적인 트리 비교 알고리즘의 시간복잡도는 O(n³)이다. 만약 1000개 요소를 처리한다면, 이전 트리 노드 1000개를 각각 확인하고, 각 노드마다 새 트리 1000개의 노드와 비교하여 계산하기 위해 또 1000개의 연산이 필요해서 약 10억 번의 연산이 필요하다.

레이아웃 계산도 각 노드의 위치나 크기를 계산할 때 다른 노드들에게 영향을 줄 수 있어서 복잡도가 높다. 페인팅은 모든 노드를 순회하며 픽셀을 그려야 하고, 연속적인 DOM 조작으로 리플로우가 여러 번 발생하면 성능이 급격히 저하된다. 모바일 환경에서는 이런 비효율적인 렌더링이 사용자 경험을 크게 해친다.

**React는 이런 문제를 Virtual DOM과 배치 처리로 해결**한다.

DOM 변경사항을 메모리에서 먼저 계산하고, **실제 DOM에는 최종 결과만 한 번에 반영**함으로써 리플로우와 리페인트 횟수를 최소화한다. 이것이 React가 성능상 유리한 핵심 이유라고 할 수 있다.

![Virtual DOM 개념도](@/assets/images/react/rendering/03-virtual-dom.png)

### 일반 JavaScript vs React 성능 비교

간단한 할 일 목록을 예시로 더 자세히 알아보자. 만약 새로운 할 일을 추가할 때마다 전체 목록을 다시 그려야 한다면?

```js
// 일반 JavaScript - 비효율적인 방식
function updateTodoList(todos) {
  const container = document.getElementById('todoList');

  // 매번 전체 HTML을 다시 생성
  container.innerHTML = '';

  todos.forEach(todo => {
    const div = document.createElement('div');
    div.textContent = todo.text;
    if (todo.completed) {
      div.classList.add('completed');
    }
    container.appendChild(div);
  });

  // 모든 DOM 노드가 새로 생성됨 = 비효율적
}
```

위 코드의 문제점

- 할 일 1000개 중 1개만 바뀌어도 1000개를 전부 다시 생성해야 한다.
- 매번 리플로우/리페인트가 1000번 발생한다.
- 입력 포커스나 스크롤 위치 같은 상태도 초기화된다.

이러한 DOM 직접 조작 방식 대신, 리액트를 사용하면 어떨까?

```jsx
// React 방식 - 효율적인 방식 (개념적 표현)
function TodoList({ todos }) {
  return (
    <div id="todoList">
      {todos.map(todo => (
        <div key={todo.id} className={todo.completed ? 'completed' : ''}>
          {todo.text}
        </div>
      ))}
    </div>
  );
}

// React는 내부적으로:
// 1. 이전 Virtual DOM과 새 Virtual DOM 비교
// 2. 실제로 바뀐 1개 요소만 DOM에 반영
// 3. 리플로우/리페인트 최소화
```

**이렇게** DOM 변경을 배치 처리해서 한 번에 적용한다. 리플로우와 리페인트를 최소화하기 때문이다.

## React의 렌더링 프로세스

React는 2단계에 걸쳐서 화면에 UI를 렌더링한다.

### 1. Render Phase

컴포넌트를 계산하고, 업데이트 사항을 파악한다. 컴포넌트 계산 시 결과값을 반환하는데, 이 결과값이 가상 DOM이다.

### 2. Commit Phase

변경사항을 실제 DOM에 반영한다.

## 재조정(Reconciliation) 과정

재조정은 React가 상태 변화를 실제 DOM에 반영하는 전체 과정을 의미한다. [React 공식 문서](https://ko.legacy.reactjs.org/docs/reconciliation.html)에 따르면, 이 과정은 다음과 같이 진행된다.

### 1. 상태 변화 감지

컴포넌트에서 `setState`나 `useState`를 통해 상태가 변경되면 React는 해당 컴포넌트를 다시 렌더링해야 한다고 판단한다.

### 2. 새로운 Virtual DOM 트리 생성

상태가 변경된 컴포넌트부터 시작해서 새로운 Virtual DOM 트리를 구성한다. 이때 모든 하위 컴포넌트도 함께 재계산된다.

### 3. 이전 Virtual DOM과 새 Virtual DOM 비교 (Diffing)

가장 핵심적인 단계다. React는 이전 Virtual DOM 트리와 새로운 Virtual DOM 트리를 비교해서 실제로 변경된 부분만 찾아낸다.

### 4. 변경사항 계산 및 작업 스케줄링 (Fiber 엔진)

Diffing을 통해 찾아낸 변경사항들을 어떤 순서로, 언제 DOM에 적용할지 결정한다. React 16부터 도입된 Fiber 아키텍처가 이 과정을 담당한다.

### 5. 실제 DOM에 적용 (Commit Phase)

계산된 변경사항을 실제 DOM에 한 번에 적용한다. 이 과정에서 브라우저의 렌더링이 트리거된다.

#### Virtual DOM이란

Virtual DOM은 실제 DOM의 가벼운 복사본이다. JavaScript 객체로 구성되어 있어서 실제 DOM보다 훨씬 빠르게 조작할 수 있다.

```js
{
  type: 'div',
  props: {
    className: 'container',
    children: [
      {
        type: 'h1',
        props: {
          children: 'Hello World'
        }
      }
    ]
  }
}
```

React는 상태가 변할 때마다 새로운 Virtual DOM 트리를 만들고, 이를 이전 트리와 비교해서 최소한의 DOM 조작만 수행한다. 이것이 React가 빠른 이유다.

## Diffing 알고리즘

앞서 말했듯 상태가 변할 때마다 전체 Virtual DOM 트리를 새로 만드는데, 이걸 매번 비교하면 너무 비효율적이다. Diffing 알고리즘은 **React가 이전 Virtual DOM과 새로운 Virtual DOM을 효율적으로 비교하는 방법**이다. 해당 알고리즘은 두 가지 가정을 통해 이를 O(n)으로 최적화한다.

### 1. 다른 타입의 요소는 완전히 다른 트리를 만든다

```jsx
// 이전 Virtual DOM
<div>
  <Counter count={5} />
  <UserProfile name="영주" />
</div>

// 새로운 Virtual DOM
<span>
  <Counter count={5} />
  <UserProfile name="영주" />
</span>
```

`div`가 `span`으로 바뀌면 React는

1. 하위의 `Counter`, `UserProfile` 컴포넌트를 비교하지 않음
2. 기존 div와 모든 하위 요소를 통째로 제거
3. span과 새로운 하위 요소들을 처음부터 생성
4. Counter의 count 상태도 초기화됨 (리마운트되기 때문)

### 2. 같은 타입의 요소는 동일한 구조를 유지한다

같은 타입의 요소끼리는 속성만 비교해서 업데이트한다. 전체 노드를 재생성하지 않고 변경된 속성만 적용한다.

```jsx
// 이전
<div className="sidebar" style={{width: '200px'}}>
  <UserMenu />
</div>

// 새로운
<div className="sidebar-expanded" style={{width: '300px'}}>
  <UserMenu />
</div>

// React가 실제로 하는 일:
// 1. div 요소는 유지 (같은 타입이므로)
// 2. className: "sidebar" → "sidebar-expanded" 변경
// 3. style.width: "200px" → "300px" 변경
// 4. UserMenu 컴포넌트는 건드리지 않음 (변화 없으므로)
```

### 추가 : key 속성 활용

리스트 렌더링에서 key를 사용하지 않으면 어떤 일이 일어날까?

```jsx
// key 없는 리스트 - 비효율적
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li>{todo.text}</li>  // key 없음!
      ))}
    </ul>
  );
}

// 초기 상태: ['할 일 A', '할 일 B', '할 일 C']
// 맨 앞에 추가: ['새 할 일', '할 일 A', '할 일 B', '할 일 C']

// React가 보기에는:
// 첫 번째 <li>: '할 일 A' → '새 할 일' (내용 변경으로 인식)
// 두 번째 <li>: '할 일 B' → '할 일 A' (내용 변경으로 인식)
// 세 번째 <li>: '할 일 C' → '할 일 B' (내용 변경으로 인식)
// 네 번째 <li>: 없음 → '할 일 C' (새로 추가로 인식)
// 결과: 4개 모두 업데이트 = 비효율적!
```

key가 없으면 React는 리스트 요소를 순서로만 구분한다. 따라서 맨 앞에 새 항목을 추가할 때 모든 기존 항목들이 "내용이 바뀐 것"으로 인식된다. 따라서 위 코드에서 4개가 전부 업데이트된다.

```jsx
// key 있는 리스트 - 효율적
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>  // key 있음!
      ))}
    </ul>
  );
}

// 같은 상황에서 React가 보기에는:
// key="1" (할 일 A): 위치만 이동 → 재사용
// key="2" (할 일 B): 위치만 이동 → 재사용
// key="3" (할 일 C): 위치만 이동 → 재사용
// key="4" (새 할 일): 새로 추가 → 1개만 생성
// 결과: 1개만 새로 생성, 나머지는 재사용 = 효율적!
```

반면 key가 있으면 React는 각 항목을 고유하게 식별할 수 있어서 기존 항목들은 "위치만 이동한 것"으로 판단하고 재사용한다. 결과적으로 key 없이는 전체 리스트가 재렌더링되지만, key가 있으면 새로 추가된 항목 하나만 DOM에 생성되어 성능이 향상된다.

## Fiber 아키텍처

Fiber는 React 16부터 도입된 새로운 **재조정 엔진**이다.

#### Stack Reconciler의 한계

Stack Reconciler는 한 번 시작하면 끝까지 멈출 수 없어서 무거운 작업 중에는 화면이 멈춘다. Fiber는 작업을 16ms씩 쪼개서 처리하기 때문에 사용자가 클릭하거나 애니메이션이 필요하면 재조정 작업을 잠시 멈추고 우선 처리한 후 다시 이어간다. 결과적으로 아무리 복잡한 업데이트가 진행 중이어도 화면이 끊기지 않고 부드럽게 동작한다.

#### Fiber의 해결책

[react 깃허브 문서](https://github.com/facebook/react/tree/main/packages/react-reconciler)에 따르면 새로운 엔진은 다음과 같이 동작한다.

**1. 작업을 작은 단위로 분할**

각 컴포넌트를 하나의 "Fiber 노드"로 만들고 연결 리스트 형태로 관리해서 언제든 작업을 중단하고 재개할 수 있게 만들었다.

**2. 우선순위 기반 스케줄링**

사용자 입력 같은 긴급한 작업은 즉시 처리하고, 데이터 페칭 같은 덜 중요한 작업은 나중에 처리한다. 이런식으로 사용자가 체감하는 반응성을 높인다.

**3. Time Slicing**

작업을 16ms(60fps) 프레임 단위로 나눠서 처리한다. 한 프레임에서 처리할 시간이 부족하면 다음 프레임으로 작업을 미뤄서 60fps를 유지하면서도 복잡한 업데이트를 처리할 수 있다.

결국 Fiber는 같은 재조정 과정이라도, 더 똑똑하게 처리하는 방법이라고 할 수 있다. 이와 관련한 내용은 [Naver D2 테크블로그](https://d2.naver.com/helloworld/2690975)에 잘 나와있으니 궁금하다면 참고해보자...

## Virtual DOM은 항상 최선의 성능을 보장할까?

그러면 React의 가상 DOM은 항상 최선의 성능을 보장할까? 항상은 아니다. 대부분의 상황이라고 하면 맞지만, Virtual DOM을 생성하는데도 연산이 소요되기 때문이다!

오히려 정적 페이지의 경우에는 Next.js처럼 정적으로 생성하는 것이 좋을 때가 있다. Svelte 같은 프레임워크는 아예 Virtual DOM 없이 컴파일 타임에 최적화를 수행하기도 한다.

## 정리

1. **React는 상태 변화를 감지하면 새로운 Virtual DOM을 생성한다**
2. **Diffing 알고리즘을 통해 이전 Virtual DOM과 비교해서 변경사항을 찾는다**
3. **Fiber 엔진이 변경사항을 효율적으로 스케줄링한다**
4. **최소한의 DOM 업데이트만 수행한다**
5. **브라우저가 렌더링 파이프라인을 실행해서 화면을 업데이트한다**

이러한 과정을 통해 React는 복잡한 UI도 효율적으로 관리할 수 있게 되었다. 피드백은 언제나 환영이다 🙂

---

#### 참고 자료

- React 공식 문서 - Understanding Your UI as a Tree: <https://react.dev/learn/understanding-your-ui-as-a-tree>
- React 공식 문서 - Preserving and Resetting State: <https://react.dev/learn/preserving-and-resetting-state>
- React Fiber Architecture (GitHub): <https://github.com/acdlite/react-fiber-architecture>
- [10분 테코톡] 엽토의 Virtual DOM - 우아한테크 (2023): <https://www.youtube.com/watch?v=Bdk7QzbbcEI>
- 김민준, 『리액트를 다루는 기술』, 길벗, 2019
- MDN, Critical Rendering Path: <https://developer.mozilla.org/ko/docs/Web/Performance/Guides/Critical_rendering_path>
- React.js의 렌더링 방식 살펴보기 - 이정환 | 2023 NE(O)RDINARY CONFERENCE: <https://www.youtube.com/watch?v=N7qlk_GQRJU>
