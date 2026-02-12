// 김철수 - 프로젝트 2 모바일 화면 기획 (2월 추가)
const kimP2T1Feb2 = [
  { date: '2026-02-11', content: '메인 화면 최종 기획 검토\n- 레이아웃 조정 사항 정리\n- 디자이너 피드백 반영', hours: 4, progress: 91 },
  { date: '2026-02-12', content: '모바일 화면 기획 최종 마무리\n- 개발팀 전달 준비\n- 기획서 최종 검토', hours: 3, progress: 92 },
];
for (const log of kimP2T1Feb2) {
  febWorkLogs.push({ taskId: p2_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 이영희 - 프로젝트 1 API 서버 개발 (2월 추가)
const leeP1T3Feb2 = [
  { date: '2026-02-11', content: 'REST API 엔드포인트 추가 개발\n- 인증 미들웨어 보완\n- 단위 테스트 작성', hours: 6, progress: 62 },
  { date: '2026-02-12', content: 'API 성능 최적화 작업\n- 쿼리 최적화\n- 캐싱 전략 구현', hours: 7, progress: 65 },
];
for (const log of leeP1T3Feb2) {
  febWorkLogs.push({ taskId: p1_task3.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 이영희 - 프로젝트 2 모바일 로그인 (2월 추가)
const leeP2T3Feb = [
  { date: '2026-02-02', content: '로그인 기능 QA 테스트 시작\n- 테스트 시나리오 작성\n- 기본 기능 테스트 수행', hours: 6, progress: 68 },
  { date: '2026-02-03', content: '로그인 버그 수정\n- 세션 관리 이슈 해결\n- 토큰 갱신 로직 보완', hours: 7, progress: 72 },
  { date: '2026-02-04', content: '소셜 로그인 테스트\n- 카카오/네이버 로그인 검증\n- 에러 핸들링 개선', hours: 6, progress: 76 },
  { date: '2026-02-05', content: '로그인 보안 강화\n- CSRF 토큰 적용\n- 비밀번호 암호화 검증', hours: 7, progress: 80 },
  { date: '2026-02-06', content: '모바일 환경 테스트\n- iOS/Android 각각 테스트\n- 반응형 UI 이슈 수정', hours: 6, progress: 83 },
  { date: '2026-02-09', content: '통합 테스트 수행\n- 전체 시나리오 검증\n- 성능 테스트', hours: 7, progress: 86 },
  { date: '2026-02-10', content: 'QA 피드백 반영\n- UI/UX 개선사항 적용\n- 테스트 케이스 추가', hours: 6, progress: 88 },
  { date: '2026-02-11', content: '최종 버그 수정\n- 엣지 케이스 처리\n- 로그 개선', hours: 5, progress: 89 },
  { date: '2026-02-12', content: '로그인 기능 최종 검증\n- 회귀 테스트\n- 배포 준비', hours: 4, progress: 90 },
];
for (const log of leeP2T3Feb) {
  febWorkLogs.push({ taskId: p2_task3.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 이영희 - 프로젝트 2 결제 모듈 연동 (2월 추가)
const leeP2T5Feb = [
  { date: '2026-02-02', content: '오픈 후 결제 모니터링\n- 실시간 트랜잭션 확인\n- 에러 로그 분석', hours: 4, progress: 96, issues: '일부 카드사 연동 지연 발생' },
  { date: '2026-02-03', content: '카드사 연동 이슈 대응\n- PG사 협의\n- 긴급 패치 적용', hours: 6, progress: 96 },
  { date: '2026-02-04', content: '결제 안정화 작업\n- 타임아웃 처리 개선\n- 재시도 로직 보완', hours: 5, progress: 97 },
  { date: '2026-02-05', content: '결제 데이터 검증\n- 매출 데이터 정합성 확인\n- 정산 로직 점검', hours: 4, progress: 97 },
  { date: '2026-02-06', content: '고객 문의 대응\n- 결제 실패 케이스 분석\n- CS팀 가이드 제공', hours: 5, progress: 98 },
  { date: '2026-02-09', content: '결제 성능 최적화\n- 응답 속도 개선\n- 모니터링 대시보드 구축', hours: 6, progress: 98 },
  { date: '2026-02-10', content: '결제 안정성 모니터링\n- 장애 없음 확인\n- 통계 데이터 분석', hours: 3, progress: 98 },
  { date: '2026-02-11', content: '결제 시스템 최종 점검\n- 전체 결제 수단 검증\n- 문서화 작업', hours: 4, progress: 99 },
  { date: '2026-02-12', content: '오픈 대응 마무리\n- 운영 가이드 작성\n- 인수인계 준비', hours: 3, progress: 99 },
];
for (const log of leeP2T5Feb) {
  febWorkLogs.push({ taskId: p2_task5.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
}

// 이영희 - 프로젝트 3 회원가입/로그인 API (2월 추가)
const leeP3T12Feb2 = [
  { date: '2026-02-11', content: '최종 QA 피드백 수정\n- 비밀번호 검증 강화\n- 에러 메시지 개선', hours: 5, progress: 96 },
  { date: '2026-02-12', content: 'API 최종 테스트\n- 통합 테스트 완료\n- 배포 준비', hours: 4, progress: 97 },
];
for (const log of leeP3T12Feb2) {
  febWorkLogs.push({ taskId: p3_task12.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 정민수 - 프로젝트 1 UI/UX 디자인 (2월 추가)
const jungP1T2Feb2 = [
  { date: '2026-02-09', content: '디자인 최종 검토\n- 컬러 시스템 통일\n- 아이콘 일관성 확인', hours: 5, progress: 96 },
  { date: '2026-02-10', content: 'UI 컴포넌트 정리\n- 디자인 가이드 작성\n- 개발팀 전달', hours: 6, progress: 97 },
  { date: '2026-02-11', content: '디자인 시스템 문서화\n- 사용 가이드 작성\n- 예제 화면 정리', hours: 5, progress: 97 },
  { date: '2026-02-12', content: 'UI/UX 디자인 최종 마무리\n- 피드백 반영 완료\n- 최종 산출물 전달', hours: 4, progress: 98 },
];
for (const log of jungP1T2Feb2) {
  febWorkLogs.push({ taskId: p1_task2.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 정민수 - 프로젝트 2 모바일 디자인 시안 (2월 추가)
const jungP2T2Feb = [
  { date: '2026-02-02', content: '모바일 디자인 최종 검토\n- 메인 화면 디자인 보완\n- 반응형 레이아웃 점검', hours: 6, progress: 93 },
  { date: '2026-02-03', content: '디자인 시스템 적용\n- 컴포넌트 스타일 통일\n- 컬러 팔레트 정리', hours: 7, progress: 95 },
  { date: '2026-02-04', content: '아이콘 세트 제작\n- 커스텀 아이콘 디자인\n- SVG 파일 최적화', hours: 6, progress: 96 },
  { date: '2026-02-05', content: '인터랙션 디자인\n- 애니메이션 스펙 작성\n- 트랜지션 정의', hours: 7, progress: 97 },
  { date: '2026-02-06', content: '다크모드 디자인\n- 다크모드 컬러 시스템\n- 대비 검증', hours: 6, progress: 98 },
  { date: '2026-02-09', content: '디자인 가이드 작성\n- 개발 핸드오프 문서\n- 스타일 가이드', hours: 7, progress: 99 },
  { date: '2026-02-10', content: '최종 디자인 검수\n- 개발팀 피드백 반영\n- 산출물 정리', hours: 6, progress: 99 },
  { date: '2026-02-11', content: '디자인 전달 완료\n- 에셋 파일 정리\n- 개발 지원 준비', hours: 5, progress: 100 },
  { date: '2026-02-12', content: '디자인 작업 완료\n- 개발 Q&A 대응\n- 최종 문서화', hours: 4, progress: 100 },
];
for (const log of jungP2T2Feb) {
  febWorkLogs.push({ taskId: p2_task2.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 정민수 - 프로젝트 3 멤버십 화면 (2월 추가)
const jungP3T5Feb2 = [
  { date: '2026-02-11', content: '오픈 후 사용자 피드백 수집\n- UI 개선사항 정리\n- 이슈 우선순위 결정', hours: 4, progress: 98 },
  { date: '2026-02-12', content: '멤버십 화면 개선안 작성\n- 디자인 수정안 전달\n- 다음 스프린트 계획', hours: 3, progress: 99 },
];
for (const log of jungP3T5Feb2) {
  febWorkLogs.push({ taskId: p3_task5.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 박지훈 - 프로젝트 1 인사관리 기획 (2월 추가)
const parkP1T5Feb2 = [
  { date: '2026-02-09', content: '인사관리 테스트 지원\n- QA팀 협업\n- 테스트 케이스 검증', hours: 5, progress: 73 },
  { date: '2026-02-10', content: '테스트 피드백 정리\n- 개선사항 문서화\n- 우선순위 조정', hours: 6, progress: 76 },
  { date: '2026-02-11', content: '테스트 이슈 대응\n- 기획 보완사항 정리\n- 개발팀 전달', hours: 5, progress: 78 },
  { date: '2026-02-12', content: '인사관리 최종 검수\n- 테스트 결과 분석\n- 오픈 준비', hours: 4, progress: 80 },
];
for (const log of parkP1T5Feb2) {
  febWorkLogs.push({ taskId: p1_task5.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 박지훈 - 프로젝트 3 주문 기능 기획 (2월 추가)
const parkP3T1Feb2 = [
  { date: '2026-02-11', content: '주문 프로세스 기획 보완\n- 주문 취소/환불 플로우 정리\n- 예외 케이스 정의', hours: 6, progress: 70 },
  { date: '2026-02-12', content: '주문 상태 관리 기획\n- 상태 전이도 작성\n- 알림 시나리오 정리', hours: 5, progress: 72 },
];
for (const log of parkP3T1Feb2) {
  febWorkLogs.push({ taskId: p3_task1.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 박지훈 - 프로젝트 3 멤버십 포인트 (2월 추가)
const parkP3T9Feb2 = [
  { date: '2026-02-11', content: '포인트 적립/차감 규칙 상세화\n- 이벤트별 적립률 정리\n- 유효기간 정책 수립', hours: 6, progress: 60 },
  { date: '2026-02-12', content: '포인트 시스템 기획 진행\n- 등급별 혜택 정의\n- 화면 플로우 작성', hours: 5, progress: 62 },
];
for (const log of parkP3T9Feb2) {
  febWorkLogs.push({ taskId: p3_task9.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 최수진 - 프로젝트 1 UI/UX 디자인 퍼블리싱 (2월 추가)
const choiP1T2Feb2 = [
  { date: '2026-02-09', content: '퍼블리싱 마무리 작업\n- CSS 최적화\n- 브라우저 호환성 테스트', hours: 6, progress: 95 },
  { date: '2026-02-10', content: '반응형 CSS 점검\n- 미디어 쿼리 조정\n- 모바일 레이아웃 검증', hours: 7, progress: 96 },
  { date: '2026-02-11', content: '접근성 개선\n- ARIA 속성 추가\n- 키보드 네비게이션 테스트', hours: 6, progress: 97 },
  { date: '2026-02-12', content: '퍼블리싱 최종 완료\n- 코드 리뷰 반영\n- 최종 산출물 전달', hours: 5, progress: 98 },
];
for (const log of choiP1T2Feb2) {
  febWorkLogs.push({ taskId: p1_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 최수진 - 프로젝트 3 매장 찾기 테스트 (2월 추가)
const choiP3T2Feb2 = [
  { date: '2026-02-11', content: '매장 찾기 최종 테스트\n- 지도 API 성능 검증\n- 검색 정확도 테스트', hours: 5, progress: 94 },
  { date: '2026-02-12', content: '테스트 완료 및 리포트 작성\n- 버그 수정 확인\n- 배포 승인 요청', hours: 4, progress: 96 },
];
for (const log of choiP3T2Feb2) {
  febWorkLogs.push({ taskId: p3_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 최수진 - 프로젝트 3 홈 화면 오픈 대응 (2월 추가)
const choiP3T14Feb2 = [
  { date: '2026-02-11', content: '홈 화면 모니터링 계속\n- 사용자 행동 분석\n- 성능 지표 확인', hours: 3, progress: 98 },
  { date: '2026-02-12', content: '오픈 대응 유지\n- 실시간 이슈 대응\n- 안정화 확인', hours: 3, progress: 99 },
];
for (const log of choiP3T14Feb2) {
  febWorkLogs.push({ taskId: p3_task14.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}
