# 풍수 나침반 디자인 시스템

## 현재 기준 — 2026-11-18

- 시각 기반: Astryx Neutral `@astryxdesign/theme-neutral` 0.7.16 (MIT). `src/astryx-neutral-0.7.16.css`를 저장소에 두고, `src/astryx-bridge.css`가 사이트 변수(`--bg`, `--card`, `--ink`, `--muted`, `--line`)와 간격·굵기·포커스를 그 토큰에 연결합니다. `fonts.css`는 넣지 않습니다. Figtree 뒤에 Pretendard, Apple SD Gothic Neo, 맑은 고딕을 붙여 한글이 빠지지 않게 합니다. 테마 본문 크기는 14px라서, 한글은 16px로 둡니다.
- 보조 기준: 애플 Human Interface Guidelines는 토큰이 정하지 않는 것만 다룹니다. 44px 터치, 보이는 포커스, 대비, 라이트/다크, `prefers-reduced-motion`, 안전 영역.
- 제품 고유 의미: 나침반의 금·오렌지 방향 강조와 초록·파랑·빨강·황색 상태색, 어두운 화면 선택, 계산·판독 기능과 7단계 흐름은 기존 값과 동작을 유지합니다. 배경·면·본문 글자·보조 글자·테두리·반경·간격은 Astryx Neutral 토큰을 사용합니다.
- 화면 원칙: 넓은 화면은 나침반과 분석 내용을 두 열로 놓고, 좁은 화면은 한 열로 자연스럽게 흐릅니다. 카드에는 그림자와 블러를 겹치지 않고 단일 테두리와 `--radius-container`(12px) 모서리를 사용합니다. 키보드 포커스, 안전 영역, 줄어든 움직임, 강제 색상을 지원합니다.
- 마케팅용 가짜 화면 일러스트(stageshow)는 넣지 않습니다. 이 사이트는 랜딩이 아니라 나침반 도구이고, 첫 화면의 안내 창이 이미 사용 순서를 보여 줍니다.
- 참고한 인터페이스: hairlineui.com, 21st.dev, designeer.xyz, reactbits.dev, magicui.design, uiverse.io는 절제된 구분·반응·컴포넌트 아이디어만 참고하며, 기존 나침반 구조를 대체하는 효과나 장식은 추가하지 않습니다.
