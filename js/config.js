// 운영자가 직접 고치는 설정. 기수가 바뀌면 이 파일만 고치면 된다.
// 날짜는 모두 한국 날짜(YYYY-MM-DD).
window.SITE = {
  name: 'Google Teacher Lab',
  subtitle: '교사들의 독립 스터디',
  cohort: '1기',
  // recruiting(모집 중) · running(진행 중) · break(다음 기수 준비 중)
  status: 'recruiting',
  recruitEnd: '2026-10-31',     // 모집 마감
  orientation: '2026-11-07',    // 오리엔테이션(토)
  start: '2026-11-09',          // 1주차 월요일
  levelWeeks: 6,
  trainerWeeks: 8,
  meeting: { day: '토요일', time: '밤 9시 ~ 9시 50분', place: 'Google Meet' },
  capacity: 'Trainer반 8명 · Level 1·2반 각 10명 내외', // 비우면 표시 안 함
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
