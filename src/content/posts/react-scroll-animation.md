---
title: "리액트 스크롤 애니메이션 세 가지 구현법 비교"
description: "IntersectionObserver, Framer Motion, GSAP 세 가지 방법으로 스크롤 애니메이션을 구현하고 성능 비교까지"
author: abyss-s
pubDatetime: 2025-04-03T17:24:59+09:00
tags:
  - React
  - Framer Motion
  - GSAP
---

> 티스토리 원문: <https://tomymoon.tistory.com/211>

![스크롤 애니메이션](@/assets/images/react/scroll-animation/01-banner.png)

리액트에서 세로로 배치된 5개의 이미지가 스크롤에 따라 나타나는 애니메이션을 구현해봤다.

구현 방법은 다양하지만, 외부 라이브러리 없이 기본 API만 쓰는 방법을 포함해 총 3가지로 만들어봤다.

## Result

깃허브 링크: <https://github.com/abyss-s/react-scroll-animation>

배포 링크: <https://react-scroll-animation-orcin.vercel.app/>

![구현 결과](@/assets/images/react/scroll-animation/02-result.gif)

## 1. IntersectionObserver

IntersectionObserver는 순수 JavaScript API라 라이브러리 없이도 스크롤 애니메이션을 구현할 수 있다. **관찰하고 싶은 타겟 엘리먼트가 뷰포트(화면)에 들어왔는지 비동기적으로 감지**하는 API다.

이 API가 자주 쓰이는 곳이 지연 로딩(lazy loading)이다. 불러올 양이 많거나 스크롤에 따라 데이터를 다르게 불러와야 할 때, 보이는 컨텐츠만 게으르게 로딩하면 속도와 사용자 경험이 좋아진다. 광고 가시성 보고나, 사용자가 실제로 보고 있는지에 따라 애니메이션 적용 여부를 결정하는 데도 쓸 수 있다.

### 인터섹션 옵저버 사용법

*IntersectionObserverEntry*는 콜백 함수 안에서 각 관찰 대상의 가시성 정보를 담고 있는 객체다. 중요한 속성은 다음과 같다.

- **isIntersecting**: 관찰 대상이 현재 뷰포트에 보이는지 여부. Boolean으로 반환된다.
- **intersectionRatio**: 관찰 대상과 뷰포트의 교차 비율. 0이면 교차 없음, 1이면 완전히 뷰포트 안에 있다는 뜻이다.
- **threshold**: 콜백을 실행할 기준값. 가시성이 임계값을 충족할 때마다 보고받을 수 있다.

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 요소가 화면에 나타났을 때 애니메이션 적용
      entry.target.classList.add('animated');

      // 한 번만 애니메이션을 적용하고 싶다면
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.8 // 뷰포트에서 요소의 80%가 보이면 콜백 실행
});

// 관찰할 요소에 observer 등록
observer.observe(elementRef.current);
```

### 재렌더링 방지 기법

IntersectionObserver를 쓸 때의 재렌더링 방지 방법이다.

```tsx
const boxRef = useRef<HTMLDivElement>(null);
const [isAnimated, setIsAnimated] = useState<boolean>(false);

useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isAnimated) {
      setIsAnimated(true);
      // 애니메이션 적용 로직
    }
  });

  if (boxRef.current) {
    observer.observe(boxRef.current);
  }

  return () => {
    if (boxRef.current) {
      observer.unobserve(boxRef.current);
    }
  };
}, [isAnimated]); // isAnimated가 변경될 때만 useEffect 재실행
```

`isAnimated` 상태로 이미 애니메이션이 적용된 컴포넌트는 재실행되지 않게 최적화했다. 의존성 배열에 `isAnimated`를 넣어 상태 변화를 추적한다.

## 2. Motion(Framer Motion)

### 다운로드

애니메이션 구현에 쓰이는 라이브러리 중 손에 꼽히게 유명한 라이브러리다.

```bash
npm i framer-motion
```

### 사용법

Framer Motion은 React에 특화된 애니메이션 라이브러리로, 복잡한 애니메이션을 선언적으로 간단하게 구현할 수 있다. `whileInView` 속성을 쓰면 스크롤 애니메이션이 아주 쉬워진다. 자세한 건 [공식문서](https://motion.dev/) 참고.

```jsx
<motion.div
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
>
  {/* 콘텐츠 */}
</motion.div>
```

### 재렌더링 방지 기법

Framer Motion에서는 [useInView](https://motion.dev/docs/react-use-in-view) 훅으로 재렌더링을 방지할 수 있다.

```jsx
const boxRef = useRef(null);
const [isInView, setIsInView] = useState(false);

// useInView 훅 사용
const inView = useInView(boxRef, { once: true });

useEffect(() => {
  if (inView && !isInView) {
    setIsInView(true);
  }
}, [inView, isInView]);

return (
  <motion.div
    ref={boxRef}
    initial={{ opacity: 0, y: 100 }}
    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
    transition={{ duration: 0.8 }}
  >
    {/* 콘텐츠 */}
  </motion.div>
);
```

`useInView` 훅으로 요소의 가시성을 감지하고, 상태(`isInView`)를 딱 한 번만 변경해서 불필요한 재렌더링을 막는다. `once: true` 옵션을 주면 요소가 한 번 보인 뒤로는 더 이상 감지하지 않는다.

## 3. GSAP

### 다운로드

GSAP(GreenSock Animation Platform)은 타임라인 기반의 강력한 애니메이션 라이브러리다. ScrollTrigger 플러그인으로 스크롤 기반 애니메이션을 구현할 수 있다.

### 사용법

GSAP의 핵심 메서드로 원하는 요소를 애니메이션화할 수 있다.

```jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Box = ({ index }) => {
  const boxRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;

    // 초기 상태 설정
    gsap.set(box, { opacity: 0, y: 100 });

    // 스크롤 트리거 생성
    const st = ScrollTrigger.create({
      trigger: box,
      start: 'top bottom-=100', // 요소 상단이 뷰포트 하단에서 100px 위에 도달했을 때
      end: 'top center',       // 요소 상단이 뷰포트 중앙에 도달했을 때
      onEnter: () => {
        // 요소가 화면에 들어올 때 애니메이션
        gsap.to(box, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        });
      },
      onLeaveBack: () => {
        // 요소가 화면에서 위로 빠져나갈 때 애니메이션
        gsap.to(box, {
          opacity: 0,
          y: 100,
          duration: 0.8
        });
      },
      markers: false // 디버깅용 마커 (개발 시에만 true로 설정)
    });

    // 컴포넌트 언마운트 시 ScrollTrigger 정리
    return () => st.kill();
  }, [index]); // index 의존성을 통해 각 박스마다 독립적인 ScrollTrigger 인스턴스 생성

  return (
    <div ref={boxRef} className="box">
      <img src={`https://picsum.photos/400?random=${index}`} alt={`random ${index}`} width="400px" height="auto" />
    </div>
  );
};
```

ScrollTrigger는 CSS 애니메이션보다 훨씬 세밀한 제어가 가능하다. `start`와 `end`로 트리거 지점을 정확히 지정할 수 있고, `onEnter`, `onLeave`, `onEnterBack`, `onLeaveBack` 같은 콜백으로 스크롤 방향에 따른 애니메이션도 구현할 수 있다.

### 디버깅 기능 제공

- **markers**: 디버깅용 표시기. 시작/종료 위치를 시각적으로 보여준다.
- 콘솔에서 ScrollTrigger.getAll()로 모든 인스턴스를 확인할 수 있다.

![GSAP 디버깅 마커](@/assets/images/react/scroll-animation/03-gsap-markers.gif)

### 재렌더링 방지 기법

GSAP에서는 ref와 스크롤 트리거 관리로 재렌더링을 방지한다.

```jsx
const boxRef = useRef(null);

useEffect(() => {
  const box = boxRef.current;

  // 스크롤 트리거 설정
  const st = ScrollTrigger.create({
    trigger: box,
    // 트리거 설정...
    onEnter: () => {
      // 애니메이션 로직...
    }
  });

  // 정리 함수를 통한 메모리 누수 방지
  return () => {
    st.kill();
  };
}, [index]); // index만 의존성 배열에 포함해 불필요한 재생성 방지
```

1. `useRef`를 사용해 DOM 요소에 직접 접근
2. 의존성 배열에 필요한 값만 포함 (위 예시에서는 `index`)
3. 컴포넌트 언마운트 시 `st.kill()`을 호출해 ScrollTrigger 인스턴스 제거
4. `gsap.set()`와 `gsap.to()`를 사용해 React 상태를 변경하지 않고 직접 DOM 애니메이션

React 상태 업데이트 없이 DOM을 직접 조작하기 때문에 불필요한 리렌더링이 아예 발생하지 않는다.

## 사용한 재렌더링 방지 방법을 정리하면..

### 1. useRef hook 활용

세 방법 모두 `useRef`로 DOM 요소에 직접 접근했다. DOM 조작이 React의 렌더링 사이클을 우회하기 때문에 성능에 유리하다.

### 2. 상태 업데이트 최소화

- IntersectionObserver와 Framer Motion: `isAnimated` 또는 `isInView` 상태를 사용해 초기 렌더링 이후 애니메이션이 한 번만 적용되도록 함
- GSAP: React 상태를 사용하지 않고 DOM을 직접 조작해 불필요한 상태 업데이트를 방지

### 3. 의존성 배열 최적화

각 useEffect의 의존성 배열에 필요한 값(인덱스 등)만 포함시켜 불필요한 효과 재실행을 방지

### 4. 메모리 관리

컴포넌트 언마운트 시 트리거를 종료하여, 불필요한 메모리 누수를 방지

- IntersectionObserver: observer.unobserve(): 옵저버를 해제
- GSAP: st.kill(): 스크롤 트리거를 종료

### lighthouse 비교를 통한 성능 분석

![Lighthouse - IntersectionObserver](@/assets/images/react/scroll-animation/04-lh-io.png)

![Lighthouse - Framer Motion](@/assets/images/react/scroll-animation/05-lh-framer.png)

![Lighthouse - GSAP](@/assets/images/react/scroll-animation/06-lh-gsap.png)

성능 테스트 결과 GSAP이 가장 좋은 성능을 보였다. GSAP이 React의 가상 DOM과 렌더링 사이클을 우회해 **직접 DOM을 조작**하기 때문으로 보인다.

#### GSAP과 React의 Virtual DOM 우회 방식 비교

1. **React의 Virtual DOM과 GSAP의 동작 방식**
   - React는 Virtual DOM을 활용해 UI를 효율적으로 업데이트한다.
   - GSAP은 Virtual DOM이 아닌 **실제 DOM 노드**에 직접 접근해 애니메이션을 적용한다.
2. **ref를 통한 직접 DOM 접근**
   - GSAP을 React에서 쓰려면 **useRef 또는 클래스 컴포넌트의 ref를 활용**해야 한다.
   - **ref.current**로 특정 DOM 요소를 참조한 뒤 GSAP 애니메이션 메서드를 호출한다.
3. **React 렌더링 사이클과 독립적인 동작**
   - GSAP은 React의 렌더링 사이클에 영향을 받지 않고 **독립적으로 동작**한다.
   - useGSAP() 같은 커스텀 훅을 쓰면 애니메이션을 React 라이프사이클과 분리해 실행할 수 있다.
4. **React(선언적) vs GSAP(명령적) 접근 방식 차이**
   - React는 선언적(Declarative)으로 상태 변화를 통해 UI를 업데이트한다.
   - GSAP은 **명령적(Imperative)**으로 직접 DOM 요소의 스타일을 변경한다.
   - React가 상태 변화로 DOM을 업데이트한 뒤, GSAP이 애니메이션을 적용하는 흐름이다.

---

**Ref.**

- 각 라이브러리 공식문서
- <https://lasbe.tistory.com/178>
- <https://seo-tory.tistory.com/67>
