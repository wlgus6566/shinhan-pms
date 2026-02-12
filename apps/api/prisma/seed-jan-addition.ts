// 김철수 - 프로젝트 1 킥오프 준비 완료 (1월 완료)
const kim_p1_task6_jan = [
  { date: '2026-01-02', content: '킥오프 미팅 최종 준비\n- 발표 자료 리허설\n- 장비 점검 완료', hours: 3, progress: 100 },
];
for (const log of kim_p1_task6_jan) {
  janWorkLogs.push({ taskId: p1_task6.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 김철수 - 프로젝트 2 시장조사 완료 (1월 완료)
const kim_p2_task6_jan = [
  { date: '2026-01-05', content: '경쟁사 분석 보고서 작성\n- 주요 경쟁사 5개사 기능 비교\n- 시장 점유율 데이터 정리', hours: 4, progress: 92 },
  { date: '2026-01-08', content: '시장조사 최종 보고서 작성\n- 인사이트 도출 및 권고사항 정리', hours: 5, progress: 97 },
  { date: '2026-01-09', content: '시장조사 보고서 최종 검토 및 제출\n- 이해관계자 리뷰 완료', hours: 3, progress: 100 },
];
for (const log of kim_p2_task6_jan) {
  janWorkLogs.push({ taskId: p2_task6.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 김철수 - 프로젝트 1 요구사항 분석 유지보수 (1월 확장)
const kim_p1_task1_jan_ext = [
  { date: '2026-01-21', content: '요구사항 문서 업데이트\n- 변경사항 반영 및 버전 관리', hours: 2, progress: 90 },
  { date: '2026-01-22', content: '이해관계자 피드백 반영\n- 추가 요구사항 검토', hours: 3, progress: 91 },
  { date: '2026-01-23', content: '요구사항 명세서 최종 검토\n- 문서 품질 개선', hours: 2, progress: 91 },
  { date: '2026-01-27', content: '요구사항 추적성 매트릭스 작성\n- 설계 문서와 연계 검증', hours: 3, progress: 92 },
  { date: '2026-01-30', content: '요구사항 베이스라인 확정\n- 형상관리 등록 완료', hours: 2, progress: 92 },
];
for (const log of kim_p1_task1_jan_ext) {
  janWorkLogs.push({ taskId: p1_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 김철수 - 프로젝트 1 인사관리 모듈 기획 (1월 신규)
const kim_p1_task5_jan_new = [
  { date: '2026-01-15', content: '인사관리 모듈 요구사항 수집 시작\n- 기존 시스템 분석\n- 담당자 인터뷰 계획 수립', hours: 5, progress: 8 },
  { date: '2026-01-16', content: 'HR 담당자 인터뷰 진행\n- 현행 업무 프로세스 파악\n- 주요 pain point 도출', hours: 6, progress: 15 },
  { date: '2026-01-17', content: '인사정보 관리 요구사항 정리\n- 기본정보, 경력, 교육 이력 관리 기능 정의', hours: 5, progress: 22 },
  { date: '2026-01-20', content: '근태관리 기능 요구사항 분석\n- 출퇴근, 연차, 휴가 관리 프로세스 정의', hours: 6, progress: 30 },
  { date: '2026-01-21', content: '급여관리 기능 요구사항 수집\n- 급여 계산 로직 및 지급 프로세스 분석', hours: 5, progress: 36 },
  { date: '2026-01-22', content: '평가관리 기능 기획\n- 인사평가 프로세스 및 평가 항목 정의', hours: 6, progress: 42 },
  { date: '2026-01-23', content: '조직관리 기능 설계\n- 조직도, 직급/직책 관리 기능 정의', hours: 5, progress: 47 },
  { date: '2026-01-26', content: 'HR 화면 목록 및 메뉴 구조 정의\n- 사용자 권한별 접근 제어 설계', hours: 4, progress: 50 },
  { date: '2026-01-27', content: '인사관리 데이터 모델 초안 작성\n- 주요 엔티티 및 관계 정의', hours: 5, progress: 52 },
  { date: '2026-01-28', content: '인사관리 업무 플로우 작성\n- 주요 시나리오별 프로세스 다이어그램', hours: 4, progress: 52 },
  { date: '2026-01-29', content: '인사관리 기획서 초안 작성\n- 기능 명세 및 화면 정의서 작성', hours: 5, progress: 52 },
  { date: '2026-01-30', content: '인사관리 기획서 검토 및 보완\n- 내부 리뷰 의견 반영', hours: 4, progress: 52 },
];
for (const log of kim_p1_task5_jan_new) {
  janWorkLogs.push({ taskId: p1_task5.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 김철수 - 프로젝트 2 모바일 화면 기획 계속 (1월 확장)
const kim_p2_task1_jan_ext = [
  { date: '2026-01-21', content: '모바일 화면 추가 요구사항 반영\n- 사용자 피드백 기반 개선', hours: 3, progress: 76 },
  { date: '2026-01-23', content: '모바일 화면 플로우 최적화\n- 사용자 경험 개선 포인트 정리', hours: 3, progress: 77 },
  { date: '2026-01-27', content: '모바일 화면 명세서 업데이트\n- 디자인 가이드 추가', hours: 2, progress: 77 },
  { date: '2026-01-30', content: '모바일 기획 문서 최종 검토\n- QA 체크리스트 작성', hours: 3, progress: 78 },
];
for (const log of kim_p2_task1_jan_ext) {
  janWorkLogs.push({ taskId: p2_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 이영희 - 프로젝트 1 API 서버 개발 계속 (1월 확장)
const lee_p1_task3_jan_ext = [
  { date: '2026-01-21', content: '사용자 인증 API 개발\n- JWT 토큰 발급 로직 구현', hours: 5, progress: 13 },
  { date: '2026-01-22', content: '권한 관리 API 개발\n- Role 기반 접근 제어 구현', hours: 6, progress: 15 },
  { date: '2026-01-23', content: 'API 미들웨어 구현\n- 로깅, 에러 핸들링 추가', hours: 5, progress: 16 },
  { date: '2026-01-26', content: '데이터 검증 로직 구현\n- DTO 및 Validation Pipe 적용', hours: 4, progress: 17 },
  { date: '2026-01-27', content: 'API 단위 테스트 작성\n- Controller 테스트 케이스 추가', hours: 6, progress: 18 },
  { date: '2026-01-28', content: 'API 문서화 작업\n- Swagger 문서 자동 생성 설정', hours: 5, progress: 19 },
  { date: '2026-01-29', content: 'API 성능 최적화\n- 쿼리 최적화 및 캐싱 적용', hours: 5, progress: 20 },
  { date: '2026-01-30', content: 'API 통합 테스트\n- E2E 테스트 시나리오 작성', hours: 4, progress: 20 },
];
for (const log of lee_p1_task3_jan_ext) {
  janWorkLogs.push({ taskId: p1_task3.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 이영희 - 프로젝트 2 모바일 로그인 개발 (1월 신규)
const lee_p2_task3_jan_new = [
  { date: '2026-01-15', content: '모바일 로그인 API 설계\n- 엔드포인트 및 Request/Response 정의', hours: 4, progress: 10 },
  { date: '2026-01-16', content: '로그인 인증 로직 구현\n- 이메일/비밀번호 인증 처리', hours: 6, progress: 18 },
  { date: '2026-01-20', content: '소셜 로그인 연동 준비\n- OAuth2.0 프로바이더 설정', hours: 5, progress: 25 },
  { date: '2026-01-21', content: '카카오 로그인 연동 구현\n- Kakao SDK 통합 및 토큰 처리', hours: 6, progress: 32 },
  { date: '2026-01-22', content: '네이버 로그인 연동 구현\n- Naver API 통합 및 프로필 조회', hours: 5, progress: 38 },
  { date: '2026-01-23', content: '구글 로그인 연동 구현\n- Google Sign-In 통합', hours: 6, progress: 45 },
  { date: '2026-01-26', content: '애플 로그인 연동 구현\n- Apple Sign-In 통합', hours: 5, progress: 50 },
  { date: '2026-01-27', content: '로그인 세션 관리 구현\n- Refresh Token 발급 및 갱신 로직', hours: 6, progress: 56 },
  { date: '2026-01-28', content: '로그인 보안 강화\n- Rate Limiting 및 계정 잠금 정책 적용', hours: 5, progress: 60 },
  { date: '2026-01-29', content: '로그인 테스트 케이스 작성\n- 단위 테스트 및 통합 테스트', hours: 6, progress: 63 },
  { date: '2026-01-30', content: '로그인 기능 QA 및 버그 수정\n- 테스트 환경 배포 및 검증', hours: 4, progress: 65 },
];
for (const log of lee_p2_task3_jan_new) {
  janWorkLogs.push({ taskId: p2_task3.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 이영희 - 프로젝트 2 결제 모듈 개발 (1월 신규 - 오픈 임박)
const lee_p2_task5_jan_new = [
  { date: '2026-01-12', content: '결제 모듈 요구사항 분석\n- PG사 연동 방식 검토\n- 결제 프로세스 설계', hours: 5, progress: 8 },
  { date: '2026-01-13', content: 'PG사 계약 및 개발 환경 설정\n- 토스페이먼츠 테스트 계정 발급\n- API 키 설정', hours: 4, progress: 12 },
  { date: '2026-01-14', content: '결제 요청 API 개발\n- 주문 생성 및 결제 승인 요청 구현', hours: 6, progress: 20 },
  { date: '2026-01-15', content: '결제 승인 처리 로직 구현\n- Webhook 수신 및 검증 처리', hours: 7, progress: 28 },
  { date: '2026-01-16', content: '결제 취소/환불 API 개발\n- 전액/부분 환불 로직 구현', hours: 6, progress: 35 },
  { date: '2026-01-20', content: '결제 내역 조회 API 개발\n- 결제 이력 관리 기능 구현', hours: 5, progress: 42 },
  { date: '2026-01-21', content: '정기 결제 기능 구현\n- 자동 결제(빌링키) 처리 로직', hours: 7, progress: 50 },
  { date: '2026-01-22', content: '결제 보안 강화\n- 데이터 암호화 및 PCI-DSS 준수', hours: 6, progress: 56 },
  { date: '2026-01-23', content: '결제 실패 처리 로직 구현\n- 재시도 메커니즘 및 에러 핸들링', hours: 5, progress: 62 },
  { date: '2026-01-26', content: '결제 모듈 단위 테스트\n- 주요 시나리오 테스트 케이스 작성', hours: 6, progress: 68 },
  { date: '2026-01-27', content: '결제 통합 테스트\n- 전체 결제 프로세스 E2E 테스트', hours: 7, progress: 75 },
  { date: '2026-01-28', content: 'PG사 연동 테스트\n- 실제 결제 및 취소 시나리오 검증', hours: 6, progress: 82 },
  { date: '2026-01-29', content: '결제 모듈 성능 테스트\n- 동시 결제 처리 성능 검증', hours: 5, progress: 87 },
  { date: '2026-01-30', content: '결제 모듈 최종 QA 및 배포 준비\n- 운영 환경 설정 및 모니터링 구성', hours: 8, progress: 95 },
];
for (const log of lee_p2_task5_jan_new) {
  janWorkLogs.push({ taskId: p2_task5.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 이영희 - 프로젝트 3 회원가입 API 계속 (1월 확장)
const lee_p3_task12_jan_ext = [
  { date: '2026-01-21', content: '회원가입 이메일 인증 구현\n- 인증 메일 발송 및 토큰 검증', hours: 5, progress: 67 },
  { date: '2026-01-23', content: '회원가입 소셜 연동 추가\n- 소셜 계정 연동 회원가입 처리', hours: 4, progress: 69 },
  { date: '2026-01-26', content: '회원가입 유효성 검증 강화\n- 중복 체크 및 입력값 검증', hours: 3, progress: 70 },
  { date: '2026-01-28', content: '회원가입 테스트 케이스 추가\n- Edge case 시나리오 테스트', hours: 4, progress: 71 },
  { date: '2026-01-30', content: '회원가입 API 문서화 완료\n- Swagger 문서 업데이트', hours: 3, progress: 72 },
];
for (const log of lee_p3_task12_jan_ext) {
  janWorkLogs.push({ taskId: p3_task12.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 이영희 - 프로젝트 3 매장 찾기 API 최종 마무리 (1월 확장)
const lee_p3_task13_jan_ext = [
  { date: '2026-01-22', content: '매장 찾기 API 성능 최적화\n- 쿼리 인덱싱 및 캐싱 적용', hours: 4, progress: 98 },
  { date: '2026-01-27', content: '매장 찾기 API 최종 검증\n- 운영 환경 테스트 완료', hours: 3, progress: 99 },
];
for (const log of lee_p3_task13_jan_ext) {
  janWorkLogs.push({ taskId: p3_task13.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 정민수 - 프로젝트 1 UI/UX 디자인 계속 (1월 확장)
const jung_p1_task2_jan_ext = [
  { date: '2026-01-21', content: 'ERP 대시보드 디자인 개선\n- 주요 지표 시각화 작업', hours: 5, progress: 79 },
  { date: '2026-01-22', content: 'ERP 메뉴 구조 최적화\n- 사용자 동선 개선', hours: 4, progress: 79 },
  { date: '2026-01-23', content: 'ERP 상세 화면 디자인\n- 목록/상세/등록 화면 일관성 확보', hours: 6, progress: 80 },
  { date: '2026-01-26', content: 'ERP 모달 및 팝업 디자인\n- 알림, 확인 다이얼로그 디자인', hours: 4, progress: 80 },
  { date: '2026-01-27', content: 'ERP 반응형 디자인 적용\n- 태블릿 화면 레이아웃 조정', hours: 5, progress: 81 },
  { date: '2026-01-28', content: 'ERP 다크모드 디자인\n- 색상 팔레트 및 컴포넌트 적용', hours: 6, progress: 81 },
  { date: '2026-01-29', content: 'ERP 아이콘 세트 정리\n- 아이콘 라이브러리 구축', hours: 4, progress: 82 },
  { date: '2026-01-30', content: 'ERP 디자인 시스템 문서화\n- 컴포넌트 가이드 작성', hours: 5, progress: 82 },
];
for (const log of jung_p1_task2_jan_ext) {
  janWorkLogs.push({ taskId: p1_task2.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 정민수 - 프로젝트 2 모바일 디자인 시안 계속 (1월 확장)
const jung_p2_task2_jan_ext = [
  { date: '2026-01-21', content: '모바일 홈 화면 디자인 개선\n- 주요 기능 접근성 향상', hours: 5, progress: 86 },
  { date: '2026-01-22', content: '모바일 네비게이션 디자인\n- 하단 탭바 및 제스처 UX', hours: 4, progress: 87 },
  { date: '2026-01-23', content: '모바일 상세 화면 디자인\n- 컨텐츠 레이아웃 최적화', hours: 6, progress: 89 },
  { date: '2026-01-26', content: '모바일 폼 입력 디자인\n- 키보드 UX 및 입력 검증 피드백', hours: 4, progress: 90 },
  { date: '2026-01-27', content: '모바일 인터랙션 디자인\n- 터치 피드백 및 애니메이션', hours: 5, progress: 91 },
  { date: '2026-01-28', content: '모바일 디자인 최종 검토\n- 일관성 체크 및 보완', hours: 4, progress: 91 },
  { date: '2026-01-30', content: '모바일 디자인 시안 전달\n- 개발팀 핸드오프 완료', hours: 3, progress: 92 },
];
for (const log of jung_p2_task2_jan_ext) {
  janWorkLogs.push({ taskId: p2_task2.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 정민수 - 프로젝트 3 푸시 알림 계속 (1월 확장)
const jung_p3_task3_jan_ext = [
  { date: '2026-01-21', content: '푸시 알림 디자인 시안 작성\n- 알림 카드 레이아웃 디자인', hours: 4, progress: 57 },
  { date: '2026-01-23', content: '푸시 알림 아이콘 디자인\n- 알림 유형별 아이콘 제작', hours: 3, progress: 59 },
  { date: '2026-01-26', content: '푸시 알림 설정 화면 디자인\n- 알림 on/off 및 카테고리 설정', hours: 4, progress: 60 },
  { date: '2026-01-28', content: '푸시 알림 인터랙션 디자인\n- 스와이프 액션 및 퀵 리플라이', hours: 3, progress: 61 },
  { date: '2026-01-30', content: '푸시 알림 디자인 최종 검토\n- 개발팀 피드백 반영', hours: 4, progress: 62 },
];
for (const log of jung_p3_task3_jan_ext) {
  janWorkLogs.push({ taskId: p3_task3.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 정민수 - 프로젝트 3 멤버십 화면 마무리 (1월 확장)
const jung_p3_task5_jan_ext = [
  { date: '2026-01-22', content: '멤버십 화면 마이너 수정\n- 포인트 표시 개선', hours: 2, progress: 92 },
  { date: '2026-01-27', content: '멤버십 화면 최종 검토\n- QA 피드백 반영 완료', hours: 2, progress: 93 },
];
for (const log of jung_p3_task5_jan_ext) {
  janWorkLogs.push({ taskId: p3_task5.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 정민수 - 프로젝트 3 스타일가이드 계속 (1월 확장)
const jung_p3_task10_jan_ext = [
  { date: '2026-01-21', content: '스타일가이드 컴포넌트 추가\n- 버튼, 입력 필드 가이드 작성', hours: 4, progress: 81 },
  { date: '2026-01-22', content: '스타일가이드 색상 시스템 정리\n- 컬러 팔레트 및 사용 규칙', hours: 3, progress: 82 },
  { date: '2026-01-26', content: '스타일가이드 타이포그래피 정리\n- 폰트 사이즈 및 행간 체계', hours: 4, progress: 83 },
  { date: '2026-01-28', content: '스타일가이드 레이아웃 패턴\n- 그리드 시스템 및 간격 규칙', hours: 3, progress: 84 },
  { date: '2026-01-30', content: '스타일가이드 문서화 작업\n- Figma 라이브러리 정리', hours: 4, progress: 85 },
];
for (const log of jung_p3_task10_jan_ext) {
  janWorkLogs.push({ taskId: p3_task10.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 박지훈 - 프로젝트 1 인사관리 모듈 기획 (1월 신규)
const park_p1_task5_jan_new = [
  { date: '2026-01-15', content: '인사관리 모듈 기획 지원\n- 현행 업무 프로세스 문서화\n- 조직도 및 직급 체계 정리', hours: 5, progress: 8 },
  { date: '2026-01-16', content: 'HR 담당자 인터뷰 참여 및 기록\n- 인터뷰 내용 요약 정리\n- 주요 이슈 및 요구사항 문서화', hours: 6, progress: 15 },
  { date: '2026-01-17', content: '인사정보 관리 화면 정의\n- 사원 등록/수정/조회 화면 목록\n- 필수/선택 입력 항목 정리', hours: 5, progress: 22 },
  { date: '2026-01-20', content: '근태관리 화면 정의\n- 출퇴근 기록, 연차 신청 화면\n- 승인 프로세스 플로우 작성', hours: 6, progress: 30 },
  { date: '2026-01-21', content: '급여관리 화면 정의\n- 급여 명세서 조회 화면\n- 급여 계산 규칙 문서화', hours: 5, progress: 36 },
  { date: '2026-01-22', content: '평가관리 화면 정의\n- 평가 입력/조회 화면\n- 평가 항목 및 배점 정리', hours: 6, progress: 42 },
  { date: '2026-01-23', content: '조직관리 화면 정의\n- 조직도 편집 화면\n- 직급/직책 관리 화면', hours: 5, progress: 47 },
  { date: '2026-01-26', content: 'HR 메뉴 구조 설계 지원\n- 메뉴 depth 및 권한 체계 정리', hours: 4, progress: 50 },
  { date: '2026-01-27', content: 'HR 화면 상세 명세 작성\n- 화면별 입력 필드 및 버튼 정의', hours: 5, progress: 52 },
  { date: '2026-01-28', content: 'HR 업무 플로우 다이어그램 작성\n- 주요 시나리오별 흐름도', hours: 4, progress: 52 },
  { date: '2026-01-29', content: 'HR 기획서 초안 검토 지원\n- 문서 체계 정리 및 오탈자 검수', hours: 5, progress: 52 },
  { date: '2026-01-30', content: 'HR 기획서 보완 작업\n- 추가 요구사항 반영 및 정리', hours: 4, progress: 52 },
];
for (const log of park_p1_task5_jan_new) {
  janWorkLogs.push({ taskId: p1_task5.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 박지훈 - 프로젝트 3 주문 기능 기획 계속 (1월 확장)
const park_p3_task1_jan_ext = [
  { date: '2026-01-21', content: '주문 옵션 선택 화면 기획\n- 사이즈/색상 선택 UI 정의', hours: 4, progress: 36 },
  { date: '2026-01-23', content: '주문 결제 화면 기획\n- 결제 수단 선택 및 입력 필드', hours: 3, progress: 37 },
  { date: '2026-01-27', content: '주문 완료 화면 기획\n- 주문 확인 및 배송 정보 표시', hours: 3, progress: 37 },
  { date: '2026-01-30', content: '주문 기획서 최종 검토\n- 내부 리뷰 의견 반영', hours: 3, progress: 38 },
];
for (const log of park_p3_task1_jan_ext) {
  janWorkLogs.push({ taskId: p3_task1.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 박지훈 - 프로젝트 3 멤버십 포인트 계속 (1월 확장)
const park_p3_task9_jan_ext = [
  { date: '2026-01-21', content: '멤버십 포인트 적립 규칙 조사\n- 경쟁사 포인트 정책 분석', hours: 3, progress: 10 },
  { date: '2026-01-23', content: '포인트 사용 시나리오 작성\n- 결제 시 포인트 차감 프로세스', hours: 3, progress: 12 },
  { date: '2026-01-26', content: '포인트 이력 관리 요구사항 정리\n- 적립/사용 내역 조회 기능', hours: 3, progress: 13 },
  { date: '2026-01-28', content: '포인트 유효기간 정책 정리\n- 소멸 예정 포인트 알림 기능', hours: 2, progress: 14 },
  { date: '2026-01-30', content: '멤버십 포인트 기획 초안 작성\n- 주요 기능 및 정책 문서화', hours: 3, progress: 15 },
];
for (const log of park_p3_task9_jan_ext) {
  janWorkLogs.push({ taskId: p3_task9.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 최수진 - 프로젝트 1 UI/UX 디자인 퍼블리싱 (1월 신규)
const choi_p1_task2_jan_new = [
  { date: '2026-01-09', content: 'ERP 퍼블리싱 환경 설정\n- 프로젝트 구조 및 컴포넌트 라이브러리 파악', hours: 4, progress: 8 },
  { date: '2026-01-13', content: 'ERP 공통 레이아웃 마크업\n- Header, Sidebar, Footer 구조', hours: 6, progress: 15 },
  { date: '2026-01-15', content: 'ERP 대시보드 화면 퍼블리싱\n- 차트 및 위젯 레이아웃', hours: 6, progress: 22 },
  { date: '2026-01-17', content: 'ERP 목록 화면 퍼블리싱\n- 테이블 및 필터 컴포넌트', hours: 5, progress: 28 },
  { date: '2026-01-20', content: 'ERP 등록/수정 폼 퍼블리싱\n- 입력 필드 및 유효성 검증 UI', hours: 6, progress: 35 },
  { date: '2026-01-21', content: 'ERP 상세 화면 퍼블리싱\n- 정보 표시 레이아웃 및 탭', hours: 5, progress: 42 },
  { date: '2026-01-22', content: 'ERP 모달 컴포넌트 퍼블리싱\n- 알림, 확인 다이얼로그', hours: 6, progress: 48 },
  { date: '2026-01-23', content: 'ERP 반응형 스타일 적용\n- 미디어 쿼리 및 브레이크포인트', hours: 5, progress: 54 },
  { date: '2026-01-26', content: 'ERP 다크모드 스타일 적용\n- CSS 변수 및 테마 스위칭', hours: 4, progress: 60 },
  { date: '2026-01-27', content: 'ERP 애니메이션 효과 추가\n- Transition 및 Hover 효과', hours: 6, progress: 66 },
  { date: '2026-01-28', content: 'ERP 접근성 개선\n- ARIA 속성 및 키보드 내비게이션', hours: 5, progress: 72 },
  { date: '2026-01-29', content: 'ERP 브라우저 호환성 테스트\n- 크로스 브라우징 이슈 수정', hours: 6, progress: 78 },
  { date: '2026-01-30', content: 'ERP 퍼블리싱 최종 검수\n- 디자인 시안 대비 픽셀 퍼펙트 체크', hours: 4, progress: 82 },
];
for (const log of choi_p1_task2_jan_new) {
  janWorkLogs.push({ taskId: p1_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 최수진 - 프로젝트 3 매장 찾기 테스트 계속 (1월 확장)
const choi_p3_task2_jan_ext = [
  { date: '2026-01-21', content: '매장 찾기 추가 시나리오 테스트\n- 권한별 접근 테스트', hours: 3, progress: 67 },
  { date: '2026-01-23', content: '매장 찾기 성능 테스트\n- 대용량 데이터 조회 성능 확인', hours: 3, progress: 68 },
  { date: '2026-01-27', content: '매장 찾기 버그 리포팅\n- 발견된 이슈 정리 및 전달', hours: 2, progress: 69 },
  { date: '2026-01-30', content: '매장 찾기 재테스트\n- 버그 수정 사항 검증', hours: 3, progress: 70 },
];
for (const log of choi_p3_task2_jan_ext) {
  janWorkLogs.push({ taskId: p3_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 최수진 - 프로젝트 3 메인 화면 퍼블리싱 계속 (1월 확장)
const choi_p3_task11_jan_ext = [
  { date: '2026-01-21', content: '메인 화면 캐러셀 컴포넌트 퍼블리싱\n- 이미지 슬라이더 및 인디케이터', hours: 4, progress: 62 },
  { date: '2026-01-22', content: '메인 화면 카테고리 섹션 퍼블리싱\n- 아이콘 그리드 레이아웃', hours: 3, progress: 64 },
  { date: '2026-01-26', content: '메인 화면 추천 상품 섹션 퍼블리싱\n- 상품 카드 리스트 레이아웃', hours: 4, progress: 66 },
  { date: '2026-01-28', content: '메인 화면 반응형 스타일 적용\n- 모바일/태블릿 레이아웃', hours: 3, progress: 67 },
  { date: '2026-01-30', content: '메인 화면 퍼블리싱 최종 검수\n- 디자인 QA 및 보완', hours: 4, progress: 68 },
];
for (const log of choi_p3_task11_jan_ext) {
  janWorkLogs.push({ taskId: p3_task11.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}

// 최수진 - 프로젝트 3 홈 화면 오픈 대응 마무리 (1월 확장)
const choi_p3_task14_jan_ext = [
  { date: '2026-01-22', content: '홈 화면 오픈 후 모니터링\n- 사용자 피드백 수집', hours: 2, progress: 92 },
  { date: '2026-01-26', content: '홈 화면 마이너 이슈 수정\n- 긴급 패치 적용', hours: 2, progress: 92 },
  { date: '2026-01-29', content: '홈 화면 안정화 확인\n- 최종 모니터링 및 보고', hours: 2, progress: 93 },
];
for (const log of choi_p3_task14_jan_ext) {
  janWorkLogs.push({ taskId: p3_task14.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
}
