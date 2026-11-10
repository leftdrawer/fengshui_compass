# 변경 이력 (fengshui_compass)

> 규칙: 상위 `C:\AI Projects\AGENTS.md`. 최신 항목이 위, 한국어. 이 저장소는 **공개**(GitHub `leftdrawer/fengshui_compass`)이므로 개인정보·비밀값·손님 이야기를 적지 않는다.

## 2026-11-10 — 앱 아이콘을 풍수 나침반 도안으로 교체

- 무엇: 파비콘·애플 터치 아이콘·웹 매니페스트 아이콘을 금색 고리, 후천 팔괘, 붉은 바늘, 비취색 바탕의 새 도안으로 바꿈. 16·32은 스쿼클, 180 애플 터치는 풀블리드(iOS가 모서리를 깎음). 매니페스트는 스쿼클 192·512를 `any`, 풀블리드 192·512를 `maskable`로 나눔. 파일 이름은 `*-v2.png`라서 주소 자체가 바뀐다. 소셜 미리보기(`og:image`)는 투명 모서리가 없는 풀블리드 512(`app-icon-maskable-512-v2.png`)를 가리킴.
- 왜: 홈 화면·탭·설치 아이콘이 같은 도안을 쓰게 하려고. Chrome은 설치한 웹 앱의 아이콘 주소를 바꾸지 않으면 그림이 바뀌어도 갱신하지 않으므로, 기존 파일을 덮어쓰지 않고 새 주소로 연결함.
- 현재 상태: 서비스 워커는 이 저장소와 배포 사이트에 없음. 예전 파일(`favicon-32.png`, `apple-touch-icon.png`, `app-icon-192.png`, `app-icon-512.png`)은 그대로 두었고, 페이지와 매니페스트는 v2만 가리킴. 헤더의 은호당 서명 이미지는 그대로.
- 관련 파일: `assets/favicon-16-v2.png`, `assets/favicon-32-v2.png`, `assets/apple-touch-icon-v2.png`, `assets/app-icon-192-v2.png`, `assets/app-icon-512-v2.png`, `assets/app-icon-maskable-192-v2.png`, `assets/app-icon-maskable-512-v2.png`, `manifest.webmanifest`, `compass.html`, `compass-mobile.html`

## 2026-10-31 — CHANGELOG 신설

- 무엇: 이 프로젝트에 `CHANGELOG.md`가 없어(상위 규칙상 프로젝트마다 필요) 새로 만듦. 아래는 지금까지의 커밋 기록을 정리한 것이다.
- 현재 상태(요약): 은호당 현공비성 풍수 나침반. 중국어(번체) 원본 앱을 원작자 허락을 받아 한국어로 옮기고 애플 HIG 기준으로 다시 디자인한 정적 웹앱(HTML + 바닐라 JS, 빌드 없음). `index.html`이 기기를 감지해 `compass.html`(데스크톱)·`compass-mobile.html`(모바일)로 보냄. 자세한 것은 `README.md`.
- 지금까지의 변경 (커밋 기록 기준):
  - 2026-10-30 23:19 `6b3f3b0` 한국어 로컬라이징 + 애플 HIG 재설계
  - 2026-10-31 02:13 `e7e537f` 비밀번호 화면 없앰, 색을 뉴트럴 그레이 + 오렌지로
  - 2026-10-31 02:18 `8cc3eb8` GitHub Pages용 `index.html` → `compass.html` 이동
  - 2026-10-31 03:20 `f096066` 모바일 전용 컴팩트 페이지 추가, 기기 감지 자동 이동
  - 2026-10-31 03:48 `7c956bd` 앱 아이콘 PNG 다시 압축
  - 2026-10-31 03:48 `d1ed564` DOM 요소 null 방어와 id 대조 스크립트
  - 2026-10-31 03:49 `c8523d7` 두 HTML의 접근성·사용성 보강
  - 2026-10-31 03:49 `569601b` README를 현재 상태로
  - 2026-10-31 15:45 `3f659c0` 머리에 은호당 서명 로고, 글자 로고 뺌, 기본 테마를 라이트로
- 관련 파일: `CHANGELOG.md`
- 동기화: 시작 전 `git pull --ff-only`(이미 최신), 이 항목만 커밋·푸시.
- 작업자: Kiro / Claude Opus 5.5 (위 커밋들을 한 작업자는 기록에 없음)
