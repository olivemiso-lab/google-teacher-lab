# Google Teacher Lab (새 버전)

Level 1 → Level 2 → Google 공인 트레이너까지, 교사들이 토요일 밤마다 함께 준비하는 독립 스터디 사이트.
회원가입·서버 없이 GitHub Pages에 올리는 정적 사이트다. 개인 진도는 각자 브라우저(localStorage)에만 저장된다.

## 운영자가 고치는 곳

| 하고 싶은 일 | 고칠 파일 |
|---|---|
| 기수 이름, 모집 상태, 마감일·OT·시작일, 모임 시간, 신청서 링크, 인원 | `js/config.js` |
| 미션·인증 가이드·새소식 내용 | `tools/source/` 아래 원본을 고친 뒤 `node tools/build-content.mjs` |
| 첫 화면 문구 | `index.html` |
| 트레이너 양식 | `kit.html` |

- `status`: `recruiting`(모집 중) · `running`(진행 중) · `break`(다음 기수 준비 중)
- 날짜를 바꾸면 일정표·주차 날짜·'오늘의 미션'이 자동으로 다시 계산된다.
- `formUrl`이 비어 있으면 신청 버튼 대신 '스레드에서 소식 받기'가 보인다.

## 페이지

- `index.html` 학습실(단계를 고르면 이어서 할 미션·진행률·복습·약한 개념) + 스터디 안내
- `mission.html?id=l1-1-1` 미션 연습실: 준비(상황·실습 재료) → 실습 → 결과 확인 → 판단 문제 3개 → 결과
- `review.html` 복습함 (틀린 문제, 연속 2번 맞히면 완료) · `exam.html` 37문항 모의고사 · `my.html` 내 기록·백업
- `path.html?stage=level1|level2|trainer` 단계별 과정 · `start.html` 시작 준비(연습 계정·시험 형식)
- `resources.html` 인증 가이드·새소식 / `kit.html` 트레이너 준비 양식 / `join.html` 신청

미션 원본은 `tools/source/missions/*.json`(Level 1: 2025-08-07 task card, Level 2: 2025-12-01 task card 기준). 문항마다 `skill`(개념), 필요한 미션에 `material`(실습 재료, text 또는 탭 구분 table).

## 확인

```
node tests/check.mjs
```

미리보기: 클로드 폴더의 `.claude/launch.json` → `teacherlab` (포트 8791).

## 자료 출처

- `tools/source/missions/`: 2026-10-10 시험 방식으로 새로 쓴 미션 60개(Google 고객센터 한국어 문서 대조 검토). `trainer.json`: 트레이너 로드맵.
- `tools/source/live-2026-10-09.json`: 2026-10-09 실제 사이트의 인증 가이드 4종·새소식 3개.
- 판단 문제 정답은 페이지 자료에 들어 있다(스스로 확인용이라 숨기지 않음).
