---
title: "Continue 커스텀 프롬프트로 리드미 팀원 테이블 자동 생성하기"
description: "Continue의 .prompt 파일로 깃허브 팀원 테이블을 자동 생성하는 커스텀 프롬프트를 만들어본 기록"
author: abyss-s
pubDatetime: 2024-10-01T21:54:02+09:00
tags:
  - OSSCA
  - Continue
---

## Continue - Build a custom prompt

프롬프트는 패턴을 표준화하고 LLM 프롬프트를 팀과 공유하는 편리한 방법이 될 수 있다.

Continue의 공식문서에서는 jest를 활용한 자동화 테스트를 커스텀 프롬프트로 만들어 예제로 안내하고 있다.

```
temperature: 0.5
maxTokens: 4096
---
<system>
You are an expert programmer
</system>

{{{ input }}}

Write unit tests for the above selected code, following each of these instructions:
- Use `jest`
- Properly set up and tear down
- Include important edge cases
- The tests should be complete and sophisticated
- Give the tests just as chat output, don't edit any file
- Don't explain how to set up `jest`
```

### 사용가능한 매개변수 목록

`---`를 사용해 매개변수를 정의할 수 있다.

- name
- temperature
- topP
- topK
- minP
- presencePenalty
- frequencyPenalty
- mirostat
- stop
- maxTokens
- description

`<system>` 태그 내에 시스템 메시지도 정의 가능하다.

### Variables

- `{{{ input }}}` - 슬래시 명령과 함께 전송되는 사이드바 입력 상자의 전체 텍스트
- `{{{ currentFile }}}` - 현재 IDE에서 열려 있는 파일
- `{{{ ./path/to/file.js }}}` - 이외 다른 파일들을 참조하려면 이렇게 하면 된다.

### Context Provider

config에 추가한 모든 컨텍스트 프로바이더는 컨텍스트 프로바이더의 이름을 사용하여 참조할 수 있다.

여기서 Provider란 참고하려는 문서로 비유하면 되는데 [해당 링크](https://docs.continue.dev/customize/context-providers)를 참고하면 자세한 설명이 나온다.

리액트에서 스타일을 테마별로 지정하기 위해 Custom Provider를 이용한 적이 있는데, 이와 비슷하다. 예를 들면 @codebase나 @files 등을 통해 특정 폴더나 파일의 컨텍스트를 참고하도록 할 수 있다.

- `{{{ terminal }}}` - 해당 터미널 내용을 참고하도록
- `{{{ url "https://github.com/continuedev/continue" }}}` - URL의 내용을 참고하도록

아직 나는 jest를 다뤄본 적이 없어 익숙한 언어로 새로운 기능을 만들어보기로 했다. 아무튼 이렇게 프롬프트 파일을 만들면 `/`를 입력하여 슬래시 명령 목록에서 새롭게 생성된 프롬프트를 선택할 수 있다. Enter를 누르면 LLM이 프롬프트 파일의 지침에 따라 응답한다.

## 커스텀 프롬프트 파일 생성

`./prompts` 폴더 안에 `.prompt` 확장자로 파일을 만들고 YAML 구문으로 작성하면 된다. 익스텐션에 있는 버튼으로도 새 프롬프트 파일을 만들 수 있다.

![새 프롬프트 파일 생성](@/assets/images/ossca/prompt/01-new-prompt.png)

## 어떤 커스텀 프롬프트를 만들어볼까?

Continue에서 제공하고 있는 커스텀 프롬프트 파일 예제 링크이다.

<https://github.com/continuedev/prompt-file-examples>

들어가서 보면 코드 리뷰, 주석, 테스트 등에 필요한 다양한 프롬프트 예제가 있다. 위 코드를 참고삼아 (아주 간단한) 나만의 프롬프트를 만들어보기로 했다.

자동화할 수 있는 코드가 무엇이 있을지 생각하다가, 최근 리드미를 작성하며 겪은 불편함이 떠올랐다. 바로 마크다운에서 테이블을 생성하는 것이 매우 귀찮다는 사실..!

![리드미 팀원 테이블 예시](@/assets/images/ossca/prompt/02-member-table.png)

프로젝트를 할 때, README.md에 주로 테이블 형식으로 팀원 소개를 넣는 편인데 아무래도 깃허브 id, 주소, 사진을 팀원마다 따와야하니 귀찮은 면이 있었다. 따라서 **깃허브 아이디만 입력하면, 팀원 테이블을 자동으로 만들어주는 프롬프트**를 만들어보기로 했다.

## 프롬프트 파일을 수정해보자

원래는 `@`를 사용해 깃허브 아이디를 구분하려고 했다. 그러나 실패했다. 이유는 이미 Continue에서 @를 사용한 명령어가 구현되어 있기 때문이었다...! 따라서 여러 아이디를 구분하기 위해 `,`(쉼표)를 구분자로 사용하도록 변경하기로 했다.

예를 들어 프롬프트에 `아이디1,아이디2,아이디3` 이런식으로 input을 넣어주면 팀원의 이름 - 팀원 깃허브 프로필 사진 - 깃허브 아이디와 주소 링크 순서대로 테이블을 형성해야 한다.

이를 토대로 구성한 내 커스텀 프롬프트 `create-member-table.prompt` 파일은 다음과 같다.

```
<system>
    The JavaScript code you provided generates a Markdown table that includes GitHub IDs, their corresponding profile images, and links to their GitHub profiles
</system>
{{ input }}

### filename.js
// The input string containing GitHub IDs is split by ',' to create an array.
const githubIds = '{{ input }}';
const ids = githubIds.split(',').map(id => id.trim()).filter(Boolean);

// Create table header from GitHub IDs
const header = ids.map(id => `| ${id} `).join('') + '|';
const separator = ids.map(() => '|---').join('') + '|';

// Create profile images row
let profileImages = ids.map(id => `| ![img](https://avatars.githubusercontent.com/${id}) `).join('') + '|';

// Create profile links row
let profileLinks = ids.map(id => `| [@${id}](https://github.com/${id}) `).join('') + '|';

// Combine all parts to form the final markdown table
const markdownTable = `${header}\n${separator}\n${profileImages}\n${profileLinks}`;
console.log(markdownTable);
```

### 동작 설명

1. 입력 문자열: 쉼표를 구분자로 하여 깃허브 아이디를 입력한다.
2. 문자열 분할: 코드는 문자열을 배열로 분할하고 공백을 제거해서 각 아이디를 나눈다.
3. 테이블 헤더 구분: 각 아이디를 기준으로 마크다운 테이블의 헤더 행을 만든다.
4. 프로필 이미지: 각 아이디를 기준으로 깃허브 프로필 이미지를 받아온다.
5. 프로필 링크: 각 아이디별로 깃허브 프로필 주소 링크 행을 생성한다.
6. 테이블 완성: 위의 모든 섹션을 결합하여 마크다운 테이블을 콘솔에 보여준다.

시스템 메시지와 주석은 파파고의 도움을 받아 영어로 작성했다.

## 커스텀 프롬프트 실행

`/create-member-table` 명령어와 함께 깃허브 id를 쉼표로 구분해서 넣고 실행했다.

![커스텀 프롬프트 실행](@/assets/images/ossca/prompt/03-run.png)

프롬프트가 만들어준 마크다운을 그대로 복사해 리드미에 붙여넣으니 팀원 테이블이 깔끔하게 나왔다.

![생성된 팀원 테이블](@/assets/images/ossca/prompt/04-result.png) 앞으로 리드미에 팀원 정보를 넣을 때 꽤 유용할 것 같다.

Continue에서는 prompt뿐만 아니라 context-provider도 커스텀할 수 있다. 오픈소스로 공개된 만큼 좋은 아이디어가 있다면 직접 만들어보고 공유해보자🐥
