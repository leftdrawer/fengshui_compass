# 변경 이력 (fengshui_compass)

> 규칙: 상위 `C:\AI Projects\AGENTS.md`. 최신 항목이 위, 한국어. 이 저장소는 **공개**(GitHub `leftdrawer/fengshui_compass`)이므로 개인정보·비밀값·손님 이야기를 적지 않는다.

## 2026-11-25 — libraries.dev 효과 적용 (eunho-fx)

- 무엇: 은호당님 지시("libraries.dev 효과 컴포넌트 중 어울리는 것을 내 AI 페이지 전부에 적용"). libraries.dev 라이브러리(border-beam·thinking-orbs·liquid-gooey·metal-fx·img-fx)는 React 18 전용이라, 같은 효과를 React 없이 쓰는 공용 파일 eunho-fx 1.0(CSS+JS, gzip 약 10KB, thinking-orbs 엔진 MIT 포함)을 붙였다.
- 이 페이지에 쓴 것: 서명 빛 스침, '나침반 켜기' 단추 둘레 빛, 궁반(9궁)이 처음 그려지거나 바뀌면 현상되듯 드러남(2.5초에 한 번까지), 보고서 '쉬운 결과/전문 해설' 선택 표시(Gooey)와 전환 물결, 안내 창 열릴 때 빛 한 바퀴, 주 단추 자석·카드 커서 빛. 데스크톱·모바일 두 파일에 같게.
- 관련 파일: `compass.html`, `compass-mobile.html`, `CHANGELOG.md`
- 남은 일: 커밋·푸시는 은호당님 승인 후. 실기기 센서 화면은 확인 못 함.
- 지킨 것: 계산·저장·전송 로직과 글자(문구)는 바꾸지 않았다. `prefers-reduced-motion`이면 움직임이 모두 멈추고, 자석·커서 빛은 마우스가 있는 큰 화면에서만 켜진다. 화면 밖·숨은 탭에서는 멈춘다.
- 작업자: Grok Bot (백업: `C:\Users\phlog\ai-audit\backups\20261125-2045\`)

## 2026-11-21 — 저장소 점검: 계산 대조와 좁은 화면 단계 글자

- 무엇: 현공 운 구간, 자오 하괘, 24산 경계가 기존 계산과 같은지 보는 `scripts/check-engine.mjs`를 더했다. 모바일 하단 7단계 글자가 360px에서 잘리지 않도록 칸 안에서 줄바꿈되게 했다. 계산 결과, 문장, 주소, 저장 키는 그대로다.
- 왜: 계산 핵심에는 운·경계·좌향을 고정해 두는 자동 확인이 없었다. 좁은 화면의 단계 이름은 칸을 넘으면 앞글자가 잘렸다.
- 관련 파일: `scripts/check-engine.mjs`, `compass-mobile.html`, `README.md`, `CHANGELOG.md`
- 작업자: Cursor Cloud Agent (Grok Bot 구록이 경유)
- 남은 일·확인 필요: 이 검사는 GitHub Actions workflow에 넣지 않았다. 배포 설정은 이번 점검에서 건드리지 않는다. 실기기 나침반 센서는 확인하지 못했다.

## 2026-11-18 — astryx 테마 이식으로 UX/UI 정비

- 무엇을 바꿨는지 / 사용자 지시: "astryx와 stageshow를 활용해 웹에 배포된 사이트 UXUI 손보기", 테마만 이식하고 HIG는 보조 기준. React로 다시 쓰지 않았다. Astryx Neutral 0.7.16을 시각 기반으로 두고, 면·글자·테두리·반경·간격을 토큰에 연결했다. 한글은 Figtree 뒤 Pretendard와 Apple SD Gothic Neo로 두고 본문은 16px이다. 금·오렌지와 상태색, 계산, 주소, 데이터 파일은 그대로다. stageshow 그림은 넣지 않았다.
- 왜: 나침반은 회색 계측 화면에 금색 표식이 있는 도구라 Neutral이 맞다. 스크립트·세리프 테마는 궁반 숫자와 한글을 해친다. 테마 CSS가 간격·굵기 토큰을 비워 두어 카드 여백과 제목 굵기가 빠지던 것을 브리지에서 채웠다.
- 관련 파일: `src/astryx-bridge.css`, `src/astryx-neutral-0.7.16.css`, `compass.html`, `compass-mobile.html`, `index.html`, `src/compass-app.js`, `src/iching-circle.css`, `manifest.webmanifest`, `DESIGN.md`, `README.md`, `AGENTS.md`
- 작업자: Cursor Cloud Agent (Grok Bot 구록이 경유)
- 남은 일·확인 필요: 실기기에서 다크 모드 전환, 키보드 포커스, 360px 너비, 나침반 센서. 병합·수동 배포는 하지 않음. 캐시 번호는 137.

## 2026-11-16 — Astryx Neutral 시각 토대 적용

- 무엇: Astryx Neutral 0.7.16(MIT)을 로컬로 연결하고 두 화면의 배경·면·글자·테두리 토큰, 반응형 열, 키보드 포커스와 reduced-motion 스타일을 다듬었다. 풍수 나침반의 금·오렌지 의미색과 계산·7단계 흐름은 보존했다.
- 왜: 기존 풍수 도구의 정체성을 유지하면서 일관된 테마 토큰과 더 차분한 카드·반응형 구조를 제공하기 위해.
- 관련 파일: `compass.html`, `compass-mobile.html`, `src/astryx-neutral-0.7.16.css`, `ASTRYX-LICENSE-0.7.16.txt`, `DESIGN.md`
- 작업자: Cue AI assistant
- 남은 일·확인 필요: 실제 렌더링·키보드·360px 확인 후 로컬 커밋. 푸시·배포는 하지 않음.

## 2026-11-16 — 디자인 방향 선택을 위임받아 진행

- 사용자 지시: 현재 화면과 여섯 제공 참고 사이트를 살펴 최적의 방향을 선택하고, 별도 목업 승인 대기 없이 기존 기능을 보존하며 개선을 계속한다.
- 결정: 기존 원형 나침반·금/오렌지 의미색·한국어 설명·7단계 분석 흐름을 기준으로 보수적인 시각 개선을 우선한다. 구체적인 Astryx 테마와 버전은 패키지 확인 후 정한다.
- 관련 파일: `compass.html`, `compass-mobile.html`, `iching-circle.css`, `CHANGELOG.md`
- 작업자: Cue AI assistant
- 남은 일: 테마·버전 검증, 디자인 문서와 계획 작성, 접근성·화면 크기·기존 동작 테스트. 푸시·배포는 하지 않는다.

## 2026-11-16 — Astryx 기반 UI 개선 방향 승인 대기

- 무엇: 지침·README·변경 이력과 데스크톱/모바일 화면 구조를 읽기 전용으로 검토했다. UI 파일은 수정하지 않았다.
- 왜: 기존 원형 나침반, 금·오렌지 방향 표식, 한국어 설명과 7단계 분석을 보존하는 디자인 방향과 디자인 문서를 먼저 승인받기로 했다. 테마명·패키지 버전과 실제 화면 렌더링은 아직 검증되지 않았다.
- 관련 파일: `AGENTS.md`, `README.md`, `compass.html`, `compass-mobile.html`, `iching-circle.css`, `CHANGELOG.md`
- 작업자: Cue AI assistant
- 남은 일: 디자인 방향 승인 후 Astryx 테마와 패키지 버전을 확인하고, 기능을 유지하며 시각적 시안을 검증한다. 변경은 아직 없고 커밋·푸시·배포도 하지 않았다.

## 2026-11-13 — 용어는 두고, 문장은 쉽게, 각주는 카드마다 한 번

- 무엇: 풍수를 처음 보는 사람도 읽게 문장을 다시 다듬었다. 비성·산성·향성·승탁·승접·원운·유년·정향·하괘·겸향·체괘·궁반·택반·좌향은 그대로 두고, 카드나 구역에서 처음 나올 때만 번호 각주를 단다. 풀이는 `src/term-footnotes.js` 한곳에 둔다. 비성은 궁반의 아홉 칸을 차례로 옮겨 다니는 아홉 별이고, 육사는 문·길·부엌·침상·우물·화장실처럼 집 안팎에서 살피는 여섯 자리다. '집 뒤의 승탁이 아직 없음'은 '아직 확인되지 않음'으로 고쳤다. 표시하지 않은 침대·레인지·책상도 없다고 말하지 않는다. 캐시 번호는 136.
- 왜: 용어를 빼면 현공과 어긋나고, 문장을 그대로 두면 처음 보는 사람은 무엇을 해야 하는지 모른다. 미증명은 없음이 아니다.
- 현재 상태: 계산과 점수·상태·궁 코드는 그대로다. 각주는 작고 옅은 글씨로 카드 아래에 붙는다.
- 관련 파일: `src/term-footnotes.js`, `compass.html`, `compass-mobile.html`, `index.html`, `src/compass-app.js`, `CHANGELOG.md`

## 2026-11-13 — 한국어 문장을 말하는 말에 가깝게

- 무엇: 한 화면에서 같은 한자 풀이를 반복하지 않도록 정리했다. 승탁(承托), 좌향(坐向), 유년(流年)처럼 이미 한 번 보인 말은 다음부터 한글만 둔다. '높고 참 승탁', '좌석 승탁', '좌 뒤 승탁 미증명', '향성 승접 증거', '시스템 정보'처럼 어색한 말을 고쳤다. 방 이름 문장은 받침에 따라 은/는, 이/가, 을/를을 고른다. 캐시 번호는 135.
- 왜: 한자를 매번 붙이고, 명사만 쌓은 번역투가 손님에게 읽어 주는 말과 달랐다.
- 현재 상태: 계산과 엔진이 돌려주는 점수·상태·궁 코드는 그대로다. 화면에 나가는 문장만 바꿨다. 비성, 좌향, 정향, 겸향, 하괘, 체괘, 산성, 향성, 궁반, 택반, 유년, 원운, 승접, 승탁은 용어로 남겼다. 은호당 주소는 주소만, 실물 나침반에는 라경을 붙이지 않으며, 본문 운수는 9운, 반 위 숫자는 一–九다.
- 관련 파일: `compass.html`, `compass-mobile.html`, `index.html`, `src/compass-app.js`, `src/compass-professional-data.js`, `src/placement-advice-engine.js`, `src/dual-star-guidance.js`, `src/xuankong-temporal.js`, `src/xuankong-home-advisor.js`, `src/xuankong-goal-directions.js`, `src/xuankong-beginner-guide.js`, `src/xuankong-explanations.js`

## 2026-11-11 — 현공 용어를 표준 말로 다시 맞춤

- 무엇: '나는 별'을 비성(飛星)으로 되돌리고, 排盤을 뜻하던 '배반'을 궁반을 잡는 말로 바꿨다. 좌향·정향·겸향·하괘·체괘·유년·궁반·택운·원운·24산은 한 화면에서 한 번만 한자를 붙였다. 각도 상태는 배반이라고 쓰지 않고, 정향이면 하괘, 겸향이면 체괘라고 적는다. 캐시 번호는 134.
- 왜: 보는 사람은 현공을 알거나 배우는 사람이다. 용어를 풀어 쓴 말이 오히려 교재와 어긋났다.
- 현재 상태: 계산은 그대로다. 엔진이 돌려주는 중국어 방식 이름은 화면에 나올 때만 한국어로 바꾼다. 궁반 칸의 운성 숫자(一~九)는 반 위의 글자로 두었다. 주역 JSON의 괘 풀이는 현공 용어가 아니라 그대로 두었다.
- 관련 파일: `compass.html`, `compass-mobile.html`, `src/compass-app.js`, `src/xuankong-beginner-guide.js`, `src/xuankong-explanations.js`, `src/compass-professional-data.js`, `src/iching-circle.js`, `src/iching-circle-ui.js`, `src/xuankong-home-advisor.js`, `src/verse-explanations.js`

## 2026-11-11 — 헷갈리는 화면 글자를 쉬운 말로

- 무엇: 데스크톱·모바일 모두에서 운 이름, 비성 단계, 각도 상태, 유년 단계, 나침반 안내의 말을 바꿈. 바닥의 "은호당 제작 … 조언 도구" 소개 글을 뺐다. 은호당 주소는 주소만 링크로 남기고 "은호당 링크"와 화살표를 뺐다. 스크립트·스타일 주소의 캐시 번호를 133으로 맞춤.
- 왜: 한자로 된 운 이름, "비성 보기", "배반", "유년", "라경"이 무슨 뜻인지 화면만 보고는 알기 어려워서. "배반"은 각도가 배신한다는 뜻이 아니라, 좌향 각도가 24산의 한가운데인지·가장자리(겸향)인지·경계선인지를 가리키던 말이었다.
- 현재 상태: 기본 화면은 "9운 (2024~2043년)"과 "현재 시운". 3단계는 "비성반 보기", 7단계는 "유년 비성"과 해. 각도가 산 한가운데(0°)이면 "좌향 각도가 한 방향의 한가운데입니다".
- 관련 파일: `compass.html`, `compass-mobile.html`, `src/compass-app.js`, `src/xuankong-beginner-guide.js`, `src/iching-circle.js`

## 2026-11-10 — 앱 아이콘을 풍수 나침반 도안으로 교체

- 무엇: 파비콘·애플 터치 아이콘·웹 매니페스트 아이콘을 금색 고리, 후천 팔괘, 붉은 바늘, 비취색 바탕의 새 도안으로 바꿈. 16·32은 스쿼클, 180 애플 터치는 풀블리드(iOS가 모서리를 깎음). 매니페스트는 스쿼클 192·512를 `any`, 풀블리드 192·512를 `maskable`로 나눔. 파일 이름은 `*-v2.png`라서 주소 자체가 바뀐다. 소셜 미리보기(`og:image`)는 투명 모서리가 없는 풀블리드 512(`app-icon-maskable-512-v2.png`)를 가리킴.
- 왜: 홈 화면·탭·설치 아이콘이 같은 도안을 쓰게 하려고. Chrome은 설치한 웹 앱의 아이콘 주소를 바꾸지 않으면 그림이 바뀌어도 갱신하지 않으므로, 기존 파일을 덮어쓰지 않고 새 주소로 연결함.
- 현재 상태: 서비스 워커는 이 저장소와 배포 사이트에 없음. 예전 파일(`favicon-32.png`, `apple-touch-icon.png`, `app-icon-192.png`, `app-icon-512.png`)은 그대로 두었고, 페이지와 매니페스트는 v2만 가리킴. 헤더의 은호당 서명 이미지는 그대로.
- 관련 파일: `assets/favicon-16-v2.png`, `assets/favicon-32-v2.png`, `assets/apple-touch-icon-v2.png`, `assets/app-icon-192-v2.png`, `assets/app-icon-512-v2.png`, `assets/app-icon-maskable-192-v2.png`, `assets/app-icon-maskable-512-v2.png`, `manifest.webmanifest`, `compass.html`, `compass-mobile.html`

## 2026-11-10 — 주역의 원 자료 네 가지

- 무엇: 8궁 팔괘 카드, 좌향 보조 괘(향 상괘·좌 하괘), 오늘의 괘(서울 날짜·균등 추첨), 문왕괘서 64괘 고리.
- 자료: `data/` JSON. 글은 주역의 원 초안 그대로. 오행은 나침반 기존 값.
- 고리: 복희·소옹 원도 순서는 출처가 없어 넣지 않음.
- 빈 파일: `dual-star-corpus.json`은 코드가 요청하지만 저장소에 없음.
- 같이 고침: `#houseAxisLine` 앞에 빈 텍스트 칸이 없어 궁반을 그릴 때 스크립트가 멈추던 것을 고침.
- 이어서: 64괘 고리에 선천원도 선택을 더함. 기본은 문왕괘서. 차례는 효의 이진수이고, 자리는 주희 《주역본의》 복희육십사괘방위와 호일계 주석을 열어서 맞췄다. 건·구의 경계가 오(180°), 곤·복의 경계가 자(0°).
- `dual-star-corpus.json` 은 저장소에 없으므로 요청하지 않는다. 브라우저 404가 남지 않고, 성결 칸에는 파일이 없다는 짧은 안내만 둔다.
- 관련 파일: `src/iching-circle.js`, `src/iching-circle-ui.js`, `src/iching-circle.css`, `src/compass-app.js`, `compass.html`, `compass-mobile.html`, `data/`

## 2026-11-02 — AGENTS.md 새로 만듦

- 무엇: 에이전트가 먼저 읽을 짧은 `AGENTS.md`(목적·구성·주의)를 만듦. 내용은 README·CHANGELOG에서 확인한 것만.
- 관련 파일: `AGENTS.md`(새로)
- 작업자: Grok Bot (은호당님 승인 'A와 C부터', 점검 Page 자동 적용 항목)

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
