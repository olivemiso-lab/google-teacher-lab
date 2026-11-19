// 운영자가 직접 고치는 설정. 기수가 바뀌면 이 파일만 고치면 된다.
// 날짜는 모두 한국 날짜(YYYY-MM-DD).
window.SITE = {
  version: '20261119-2338', // node tools/bump-version.mjs 가 정해요. 손으로 고치지 않아요
  updateNote: '트레이너 안내에 Level 1·2 인증이 필요하다는 설명을 더했습니다.', // 업데이트 안내에 함께 보일 한 줄 (bump-version이 채워요)
  name: 'Google Teacher Lab',
  subtitle: 'Google 인증 준비 교사 스터디',
  cohort: '', // 기수 이름(예: '1기'). 비우면 화면에 기수를 표시하지 않아요
  // open(상시 자율 스터디: 기수·신청 없이 언제든 시작, 주차·날짜 표시 없음)
  // recruiting(모집 중) · running(진행 중) · break(다음 기수 준비 중) — 아래 모집·시작 날짜는 이 세 가지일 때만 써요
  status: 'open',
  recruitOpen: '2026-10-10T20:00:00+09:00', // 신청 시작 시각(한국 시간). 이 전에는 남은 시간을 보여 줘요
  recruitEnd: '2026-10-11',     // 모집 마감일
  recruitEndTime: '밤 9시',      // 마감 시각 표시
  recruitClose: '2026-10-11T21:00:00+09:00', // 이 시각부터 '마감'으로 표시 (뒤 신청은 혼자 도전·대기)
  orientation: '2026-10-17',    // 오리엔테이션(토). 시작 뒤 첫 토요일이면 첫 모임과 함께 해요
  start: '2026-10-12',          // 1주차 월요일
  levelWeeks: 6,
  trainerWeeks: 8,
  meeting: { day: '토요일', time: '밤 9시 ~ 9시 50분', place: 'Google Meet' },
  // 토요일 모임 주제. 홈 화면 '토요일 모임'에 보여요. 미트 주소·모의고사 링크는 넣지 않아요(질문방에서만 안내).
  meetings: [
    { date: '2026-10-17', tool: '오리엔테이션', note: '스터디 소개, 인증 시험 알아보기' },
    { date: '2026-10-24', tool: 'Google Forms', note: '도구 설명 · 직접 눌러보기 · 모의고사' },
    { date: '2026-10-31', tool: 'Google Docs', note: '공유 · 댓글 · 제안 모드' },
    { date: '2026-11-07', tool: 'Google Sheets', note: '정렬 · 함수 · 조건부 서식 · 차트' },
    { date: '2026-11-14', tool: 'Google Slides', note: '시트 모의고사 돌아보기 + 슬라이드', prep: ['컴퓨터로 접속하기', '지난주 시트 파일 열어 두기'] },
    { date: '2026-11-21', tool: 'Calendar · Meet · Sites', note: '일정 만들기부터 안내 사이트 게시까지', prep: ['컴퓨터로 접속하기'] },
  ],
  capacity: '', // 비우면 표시 안 함
  // 정원이 찬 반을 넣으면 신청 페이지에 '혼자 도전' 안내가 강조돼요. 예: ['trainer'] / 모두 차면 ['level1', 'level2', 'trainer']
  full: [],
  lateJoinUntil: '2026-10-24',  // 진행 중 이 날짜(2주차 토요일)까지는 중간 합류 신청을 받아요
  formUrl: 'https://forms.gle/iXYuCoBNzi985Rve9', // 구글 설문지 신청 링크. 비우면 '준비 중'으로 표시
  chatUrl: 'https://open.kakao.com/o/gepQgXRi', // 카카오톡 오픈채팅 질문방 주소. 비우면 홈의 질문방 버튼이 숨겨져요
  threadsUrl: 'https://www.threads.com/@olivece2017',
  email: 'ggteacherlab@gmail.com',
  leader: {
    name: '심쿵쌤',
    line: '24년차 초등교사',
    badges: ['Google 공인 교육자 Level 2', 'Gemini 공인 교육자', '2024 경기도교육청 미래교육 유공', '2025 교육부 수업혁신교사상'],
    note: 'Google 공인 트레이너 과정을 준비하며 이 스터디를 운영합니다.',
  },
};
