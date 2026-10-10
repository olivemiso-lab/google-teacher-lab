// 운영자가 직접 고치는 설정. 기수가 바뀌면 이 파일만 고치면 된다.
// 날짜는 모두 한국 날짜(YYYY-MM-DD).
window.SITE = {
  name: 'Google Teacher Lab',
  subtitle: '교사들의 독립 스터디',
  cohort: '1기',
  // recruiting(모집 중) · running(진행 중) · break(다음 기수 준비 중)
  status: 'recruiting',
  recruitOpen: '2026-10-10T20:00:00+09:00', // 신청 시작 시각(한국 시간). 이 전에는 남은 시간을 보여 줘요
  recruitEnd: '2026-10-11',     // 모집 마감일
  recruitEndTime: '밤 9시',      // 마감 시각 표시
  orientation: '2026-10-17',    // 오리엔테이션(토). 시작 뒤 첫 토요일이면 첫 모임과 함께 해요
  start: '2026-10-12',          // 1주차 월요일
  levelWeeks: 6,
  trainerWeeks: 8,
  meeting: { day: '토요일', time: '밤 9시 ~ 9시 50분', place: 'Google Meet' },
  capacity: 'Trainer반 8명 · Level 1·2반 각 10명 내외', // 비우면 표시 안 함
  // 정원이 찬 반을 넣으면 신청 페이지에 '혼자 도전' 안내가 강조돼요. 예: ['trainer'] / 모두 차면 ['level1', 'level2', 'trainer']
  full: [],
  formUrl: '',                  // 구글 설문지 신청 링크. 비우면 '준비 중'으로 표시
  threadsUrl: 'https://www.threads.com/@olivece2017',
  email: 'ggteacherlab@gmail.com',
  leader: {
    name: '심쿵쌤',
    line: '22년차 초등교사',
    badges: ['Google 공인 교육자 Level 2', 'Gemini 공인 교육자', '2025 수업혁신교사상'],
    note: '저도 Google 공인 트레이너를 준비하고 있어요. 앞에서 끌기보다 같이 걷는 스터디예요.',
  },
};
