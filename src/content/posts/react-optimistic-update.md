---
title: "낙관적 업데이트(Optimistic Update) 제대로 구현해보기"
description: "낙관적 업데이트를 직접 구현하며 겪은 빠른 토글 롤백 버그와 react-query 리팩토링 기록"
author: abyss-s
pubDatetime: 2025-04-09T13:53:49+09:00
tags:
  - React
  - Optimistic Update
---

> 티스토리 원문: <https://tomymoon.tistory.com/212>

![낙관적 업데이트](@/assets/images/react/optimistic/01-banner.png)

프론트엔드에서 사용자 경험을 끌어올리는 전략 중 하나가 **낙관적 업데이트**다. 낙관적 업데이트가 무엇인지, 실제 프로젝트에 어떻게 적용하는지 직접 구현해보며 정리했다.

## 프로젝트 배포 링크

<https://react-opimistic-update-psi.vercel.app/>

---

## 🔍 낙관적 업데이트란?

**낙관적 업데이트**는 요청이 성공할 것이라고 '낙관적으로' 가정하고 **UI를 먼저 업데이트한 뒤**, 서버 응답에 따라 결과를 반영하거나 롤백하는 방식이다.

좋아요 버튼을 예로 들면, 실제 요청 결과를 기다리는 대신:

- 하트 아이콘이 **즉시 활성화(채워짐)** 되고,
- 좋아요 수가 **즉시 1 증가**한다.
- 요청이 실패하면 → UI는 이전 상태로 **롤백**된다.

즉각적인 피드백으로 **UX**(사용자 경험)를 향상시키는 것이 핵심이다.

---

## 🎯 구현 목표 및 설계

### 1. API 구현 대체 (setTimeout 사용)

서버가 따로 없기 때문에 API 요청은 `setTimeout`으로 대체해 비동기 처리처럼 동작하게 만들었다.

```ts
// likeApi.ts
const likeApi = async (like: boolean, isError: boolean) => {
  if (isError) {
    await new Promise((res) => setTimeout(res, 3000));
    throw new Error('낙관적 업데이트 실패');
  }

  await new Promise((res) => setTimeout(res, 300));
  return like;
};
```

### 2. Zustand로 상태 관리

데이터베이스 없이도 좋아요 수를 저장할 수 있도록 상태 관리는 **Zustand**로 구현했다.

```ts
import { create } from 'zustand';

interface LikeState {
  likes: { [key: string]: number };
  incrementLikes: (id: string) => void;
  decrementLikes: (id: string) => void;
}

const useStore = create<LikeState>((set) => ({
  likes: {},
  incrementLikes: (id) =>
    set((state) => ({
      likes: {
        ...state.likes,
        [id]: (state.likes[id] || 0) + 1,
      },
    })),
  decrementLikes: (id) =>
    set((state) => ({
      likes: {
        ...state.likes,
        [id]: (state.likes[id] || 0) - 1,
      },
    })),
}));

export default useStore;
```

카드 컴포넌트는 id로 서로 다른 카드임을 구분한다. like 상태를 다루기 위한 좋아요 증가 함수와 감소 함수를 각각 만들었다.

### 3. UI에서 즉각적인 피드백

하트는 font-awesome 아이콘을 폰트처럼 사용했다.

사용자가 하트를 누르면:

- **빈 하트 → 빨간 하트**로 즉시 전환
- 좋아요 수 즉시 증가

요청이 실패하면:

- 하트는 다시 비워지고
- 좋아요 수도 원상복귀

### 4. 테스트 카드 구성: 성공 vs 실패

| 카드 | 설명 |
| --- | --- |
| ✅ 사이다 카드 | 요청이 정상적으로 처리되는 카드 |
| ❌ 쭈니 카드 | 요청 실패를 의도적으로 발생시켜 롤백을 테스트하는 카드 |

성공/실패 카드를 각각 만들어 낙관적 업데이트와 롤백 동작을 한눈에 테스트할 수 있게 했다.

![낙관적 업데이트 데모](@/assets/images/react/optimistic/02-demo.gif)

이 과정은 콘솔 로그로도 확인할 수 있다.

## 트러블 슈팅 - 빠른 토글로 인한 롤백 이슈

### 🧨 기존 구현에서의 문제

처음에는 좋아요 클릭 시 낙관적 업데이트를 진행하고, 3초 후 상태값을 롤백하는 단순한 방식으로 처리하고 있었다.

```ts
try {
  if (isError) {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    decrementLikes(id);
    setLiked(false);
  }
} catch (error) {}
```

그런데 3초 롤백 대기 시간 안에 하트를 연속 클릭하면 상태값이 꼬이면서 좋아요 수가 **음수로 내려가는** 버그가 발생했다.

![좋아요 수 음수 버그](@/assets/images/react/optimistic/03-bug.png)

### ✅ 개선: `pending` 상태 도입

원인은 요청이 진행 중인지 여부를 전혀 추적하지 않았다는 것. `pending` 상태를 추가해 API 요청 중에는 중복 클릭을 막았다.

```ts
const [pending, setPending] = useState(false);

const handleLike = async () => {
  if (pending) return;
  setPending(true);

  if (liked) {
    decrementLikes(id);
    setLiked(false);
    setPending(false);
    return;
  }

  incrementLikes(id);
  setLiked(true);

  try {
    if (isError) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      decrementLikes(id);
      setLiked(false);
      console.log('낙관적 업데이트 롤백!');
    }
  } finally {
    setPending(false);
  }
};
```

이제 요청 도중에는 버튼을 다시 누를 수 없어서 이중 처리 문제가 사라졌다.

---

## `react-query`로 리팩토링

낙관적 업데이트는 `react-query`의 `useMutation` 훅으로 훨씬 깔끔하게 처리할 수 있다. `setTimeout` 기반 롤백 대신 **onMutate / onError / onSuccess / onSettled**로 사이클을 명확하게 관리한다.

### API 분리

비동기 처리는 `apis/likeApi.ts`로 분리해서 컴포넌트가 UI 로직에만 집중하도록 했다.

```ts
const likeApi = async (like: boolean, isError: boolean) => {
  if (isError) {
    await new Promise((res) => setTimeout(res, 3000));
    throw new Error('낙관적 업데이트 실패');
  }

  await new Promise((res) => setTimeout(res, 300));
  return like;
};
```

### ⚙️ useMutation 활용

```ts
const mutation = useMutation({
  mutationFn: (like: boolean) => likeApi(like, isError),

  onMutate: async (newLike) => {
    console.log(`${id}: ${newLike ? '좋아요' : '좋아요 취소'} 시도`);
    newLike ? incrementLikes(id) : decrementLikes(id);
    setLiked(newLike);
  },

  onError: (_err, newLike) => {
    console.error(`${id}: 실패 → 롤백`);
    newLike ? decrementLikes(id) : incrementLikes(id);
    setLiked(!newLike);
  },

  onSuccess: (_data, newLike) => {
    console.log(`${id}: ${newLike ? '좋아요 성공' : '좋아요 취소 성공'}`);
  },

  onSettled: () => {
    console.log(`${id}: 요청 완료`);
  },
});
```

### 🖱️ 핸들러에서는 mutate만 호출

```ts
const handleLike = () => {
  if (mutation.isPending) return; // 중복 요청 방지
  const nextLiked = !liked;
  mutation.mutate(nextLiked);
};
```

로직을 분리하니 가독성이 좋아졌고, 요청 상태 추적을 라이브러리에 맡기면서 훨씬 견고한 구조가 되었다. 낙관적 업데이트는 결국 "UI 먼저, 실패하면 되돌리기"라는 단순한 아이디어지만, 중복 요청 같은 엣지 케이스까지 고려해야 제대로 동작한다는 걸 직접 겪으며 배웠다.
