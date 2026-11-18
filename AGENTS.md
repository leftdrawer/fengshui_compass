# AGENTS.md — fengshui_compass

> 상위 규칙 `C:\AI Projects\AGENTS.md`를 함께 따른다. 작업 전 이 폴더 `CHANGELOG.md` 맨 위 항목부터 읽는다.

## 목적
- 현공비성 풍수 나침반 정적 웹앱(한국어). 시각 기반은 Astryx Neutral 0.7.16이고, Apple HIG는 보조 기준이다. 자세한 것은 `DESIGN.md`, `README.md`.

## 실행
- 빌드 없음. 저장소 루트에서 `python -m http.server 8080` 후 `http://localhost:8080/`.

## 주의
- `compass_original.html`·`original_page.html`은 원본 보존용이다. 고치지 않는다.
- git 원격이 있으므로 상위 규칙의 동기화 절차를 따른다.
