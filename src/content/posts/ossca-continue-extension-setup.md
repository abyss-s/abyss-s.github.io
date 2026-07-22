---
title: "VS Code에 Continue를 설치하고 OpenAI 모델 연결하기"
description: "오픈소스 코딩 어시스턴트 Continue를 VS Code에 설치하고 OpenAI 키를 등록해 사용하는 방법"
author: abyss-s
pubDatetime: 2024-09-21T23:42:50+09:00
tags:
  - OSSCA
  - Continue
---

Continue는 오픈소스 코딩 어시스턴트 프로젝트로, VS Code나 Intellij 같은 IDE에서 쓸 수 있는 Github Copilot 같은 도구이다. 다양한 상용 LLM을 지원해서 나만의 AI로 커스터마이징할 수 있다는 게 장점이다.

chatGPT랑 클로드는 자주 써봤지만 IDE에서 써본 적은 없어서 정보를 열심히 찾아보았다. 다행히 공식문서가 잘 정리되어 있어서 설치와 설정 방법을 어렵지 않게 따라갈 수 있었다.

<https://www.continue.dev/>

---

## Continue 설치 방법

Vscode 익스텐션에서 Continue를 검색해 Install 버튼만 누르면 끝이다. 1초만에 설치됨. 아주 쉽다😊 설치가 끝나면 왼쪽 사이드바에도 아이콘이 추가된다.

![Continue 익스텐션 설치](@/assets/images/ossca/setup/01-install.png)

![설치 완료](@/assets/images/ossca/setup/02-installed.png)

처음 열면 팝업으로 Continue를 어떻게 사용하는지 간단히 소개해준다. 내용은 다음과 같다.

![Continue 소개 팝업](@/assets/images/ossca/setup/03-popup.png)

### 1. Edit in natural language

코드 섹션을 하이라이트하고 리팩토링하라고 지시할 수 있다.

### 2. Get possible Explanations

내 코드를 다른 시각에서 보고 설명해달라고 부탁할 수 있다.

### 3. Generate files from search

파이썬 스캐폴딩, 리액트 컴포넌트 등을 만들어달라고 할 수 있다.

## 기초 설정

OpenAI(chatGPT mini-4) or Claude(Anthropic) 둘 다 사용해볼 예정. 먼저 테스트를 위해 가장 익숙한 OpenAI를 사용하기로 했다.

<https://platform.openai.com/docs/overview>

위 링크 OpenAI 사이트에서 Continue를 위한 새로운 프로젝트를 하나 만들었다. 이후 오른쪽 상단 내 프로필 사진을 눌러 Setting에 접속한다.

![OpenAI 설정 화면](@/assets/images/ossca/setup/04-settings.png)

### 결제수단 등록하기

프로젝트 내 사이드바에서 Billing을 선택해 결제 수단을 등록한다. (최소 5달러) 해외 결제가 가능한 카드로 등록해야 한다.

![결제 수단 등록 1](@/assets/images/ossca/setup/05-billing1.png)

![결제 수단 등록 2](@/assets/images/ossca/setup/06-billing2.png)

이렇게 카드 정보 및 개인 정보를 입력하고 최소 한도인 5달러로 설정했다. 그리고 공부 목적으로 사용하는 것이기에 자동 결제를 비활성화함.

결제 수단이 성공적으로 등록되었으면 5달러가 설정된 것을 확인할 수 있다. 이게 무료로 사용할 수 있는 한도 역할을 한다.

![등록된 크레딧](@/assets/images/ossca/setup/07-credit.png)

### OpenAI Key 발급하기

이제 Create new secret key를 눌러 새로운 키를 발급받고 복사해둔다. 한번 발급된 키를 다시 확인할 수 없어 백업해둬야함!

![API 키 발급](@/assets/images/ossca/setup/08-api-key.png)

### 설정 파일에 키 등록

config.json에 모델 정보와 함께 키를 등록한다. 나의 경우 익스텐션에서 add 버튼을 눌러서 자동 추가했지만, json 파일을 직접 수정해도 상관없다.

![config.json에 모델 추가](@/assets/images/ossca/setup/09-config.png)

config.json을 다음과 같이 수정하고, gpt-4o-mini의 apiKey에 아까 발급해둔 키를 복붙하면 끝!!

```json
{
  "models": [
    {
      "title": "Claude 3 Sonnet (Free Trial)",
      "provider": "free-trial",
      "model": "claude-3-5-sonnet-20240620"
    },
    {
      "title": "GPT-4o (Free Trial)",
      "provider": "free-trial",
      "model": "gpt-4o"
    },
    {
      "title": "Llama3 70b (Free Trial)",
      "provider": "free-trial",
      "model": "llama3.1-70b"
    },
    {
      "title": "Codestral (Free Trial)",
      "provider": "free-trial",
      "model": "codestral-latest"
    },
    {
      "model": "gpt-4o-mini",
      "contextLength": 128000,
      "title": "GPT-4o Mini",
      "provider": "openai",
      "apiKey": "키"
    },
    {
      "model": "claude-3-5-sonnet-20240620",
      "contextLength": 200000,
      "title": "Claude 3.5 Sonnet",
      "apiKey": "키",
      "provider": "anthropic"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Tab Autocomplete",
    "provider": "free-trial",
    "model": "codestral-latest"
  },
  "embeddingsProvider": {
    "provider": "free-trial"
  },
  "reranker": {
    "name": "free-trial"
  }
}
```

free-trial은 키를 등록하지 않아도 사용 가능하지만, 최대 50번밖에 사용할 수 없기 때문에 공부를 위해서는 부족하다.. 따라서 이렇게 키를 등록해주면 공부할만큼은 사용 가능한 것으로 보인다😊

자 이제 Continue와 대화를 시도해보자..!!

![Continue와 대화](@/assets/images/ossca/setup/10-chat.png)

쨘. 영어와 한국어 모두 잘 알아듣는다. slash(/)로 명령어를 입력하면 다양한 기능을 쓸 수 있는데, 일단 이번에는 간단히 edit 기능만 테스트해보기로 했다.

타입스크립트 공부용 파일에서 코드를 드래그하고 **ctrl + l**을 눌러 물어보았다. 마침 다음 강의가 배열과 튜플이라 미리 예습할 겸 질문!

![edit 기능으로 질문](@/assets/images/ossca/setup/11-edit-question.png)

그랬더니 배열과 튜플 타입 학습용 코드를 만들어줬는데, 따로 부탁하지 않았는데도 내가 위에서 작성한 주석 형식까지 맞춰서 작성해줌..! 맨위 Accept All을 누르면 변경사항이 바로 저장된다.

![모델이 작성한 코드](@/assets/images/ossca/setup/12-edit-result.png)

그리고 Dashboard > Usage에서 모델 사용량도 확인 가능하니 참고할 것!

![Usage 대시보드](@/assets/images/ossca/setup/13-usage.png)

앞으로 더 다양한 기능을 탐방해보고 Continue를 활용해보아야겠다! 오픈소스 기여도 도전해보기..는 내 작은 바람이다...🥹
