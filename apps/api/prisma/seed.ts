import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 1. 슈퍼 관리자 계정 생성
  const adminPasswordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@emotion.co.kr' },
    update: { role: 'SUPER_ADMIN', department: '경영전략본부', position: 'GENERAL_MANAGER' },
    create: {
      email: 'admin@emotion.co.kr',
      passwordHash: adminPasswordHash,
      name: '시스템 관리자',
      department: '경영전략본부',
      position: 'GENERAL_MANAGER',
      role: 'SUPER_ADMIN',
      createdBy: BigInt(1),
    },
  });
  console.log('✅ 슈퍼 관리자 계정 생성 완료:', admin.email);

  // 2. 다른 테스트 계정 생성
  const userPasswordHash = await bcrypt.hash('password123', 10);
  const kim = await prisma.user.upsert({
    where: { email: 'kim@emotion.co.kr' },
    update: { role: 'PM', department: '기획본부1', position: 'PRINCIPAL_LEADER' },
    create: {
      email: 'kim@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '김진아',
      department: '기획본부1',
      position: 'PRINCIPAL_LEADER',
      role: 'PM',
      createdBy: admin.id,
    },
  });

  const lee = await prisma.user.upsert({
    where: { email: 'lee@emotion.co.kr' },
    update: { role: 'MEMBER', department: '개발본부1', position: 'PRINCIPAL_LEADER' },
    create: {
      email: 'lee@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '이남규',
      department: '개발본부1',
      position: 'PRINCIPAL_LEADER',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  const park = await prisma.user.upsert({
    where: { email: 'park@emotion.co.kr' },
    update: { role: 'MEMBER', department: '기획본부1', position: 'SENIOR_LEADER' },
    create: {
      email: 'park@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '박기호',
      department: '기획본부1',
      position: 'SENIOR_LEADER',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  const choi = await prisma.user.upsert({
    where: { email: 'choi@emotion.co.kr' },
    update: { role: 'MEMBER', department: '디자인본부1', position: 'LEADER' },
    create: {
      email: 'choi@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '최승민',
      department: '디자인본부1',
      position: 'LEADER',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  const jung = await prisma.user.upsert({
    where: { email: 'jung@emotion.co.kr' },
    update: { role: 'MEMBER', department: '디자인본부1', position: 'SENIOR_LEADER' },
    create: {
      email: 'jung@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '정서영',
      department: '디자인본부1',
      position: 'SENIOR_LEADER',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  console.log('✅ 테스트 계정 생성 완료');

  // 3. 초기 프로젝트 생성
  const project1 = await prisma.project.upsert({
    where: { projectName: '이모션 차세대 ERP 구축' },
    update: {},
    create: {
      projectName: '이모션 차세대 ERP 구축',
      client: '이모션',
      projectType: 'BUILD',
      description: '전사적 자원 관리 시스템 고도화 프로젝트',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'ACTIVE',
      createdBy: admin.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { projectName: '모바일 앱 리뉴얼' },
    update: {},
    create: {
      projectName: '모바일 앱 리뉴얼',
      client: '이모션',
      projectType: 'BUILD',
      description: '사용자 경험 개선을 위한 모바일 앱 UI/UX 개편',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      status: 'ACTIVE',
      createdBy: admin.id,
    },
  });

  console.log('✅ 초기 프로젝트 생성 완료:', project1.projectName, ',', project2.projectName);

  // 4. 프로젝트 멤버 추가
  // 프로젝트 1 "이모션 차세대 ERP 구축" 멤버 추가
  // 각 담당 분야별 PL 필수
  
  // 프로젝트 관리 분야 (PM)
  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project1.id,
        memberId: admin.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      memberId: admin.id,
      role: 'PM',
      workArea: 'PROJECT_MANAGEMENT',
      notes: '총괄PM',
      createdBy: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project1.id,
        memberId: kim.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      memberId: kim.id,
      role: 'PL',
      workArea: 'PLANNING',
      notes: '책임리더',
      createdBy: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project1.id,
        memberId: park.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      memberId: park.id,
      role: 'PA',
      workArea: 'PLANNING',
      notes: '선임리더 교체 인력',
      createdBy: admin.id,
    },
  });

  // 디자인 분야 (PL 필수)
  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project1.id,
        memberId: jung.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      memberId: jung.id,
      role: 'PL',
      workArea: 'DESIGN',
      notes: '선임리더 교체 인력',
      createdBy: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project1.id,
        memberId: choi.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      memberId: choi.id,
      role: 'PA',
      workArea: 'DESIGN',
      createdBy: admin.id,
    },
  });

  // 백엔드 분야 (PL 필수)
  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project1.id,
        memberId: lee.id,
      },
    },
    update: {},
    create: {
      projectId: project1.id,
      memberId: lee.id,
      role: 'PL',
      workArea: 'BACKEND',
      createdBy: admin.id,
    },
  });

  // 프로젝트 2 "모바일 앱 리뉴얼" 멤버 추가
  // 프로젝트 관리 분야 (PM)
  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project2.id,
        memberId: admin.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      memberId: admin.id,
      role: 'PM',
      workArea: 'PROJECT_MANAGEMENT',
      notes: '총괄PM',
      createdBy: admin.id,
    },
  });

  // 기획 분야 (PL 필수)
  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project2.id,
        memberId: kim.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      memberId: kim.id,
      role: 'PL',
      workArea: 'PLANNING',
      notes: '정인아 님 교체 인력',
      createdBy: admin.id,
    },
  });

  // 디자인 분야 (PL 필수)
  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project2.id,
        memberId: jung.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      memberId: jung.id,
      role: 'PL',
      workArea: 'DESIGN',
      notes: '박세나 님 교체 인력 (디자인 > 퍼블)',
      createdBy: admin.id,
    },
  });

  console.log('✅ 프로젝트 멤버 추가 완료');

  // 5. 업무(Tasks) 생성
  // 기존 업무 삭제 (재실행 시 중복 방지)
  await prisma.workLog.deleteMany({});
  await prisma.task.deleteMany({});

  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: '요구사항 분석 및 정의',
      description: '사용자 요구사항 수집 및 기능 명세서 작성',
      difficulty: 'MEDIUM',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-02'),
      endDate: new Date('2026-01-31'),
      createdBy: admin.id,
      assignees: {
        create: [
          {
            userId: kim.id,
            workArea: 'PLANNING',
          },
        ],
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: 'UI/UX 디자인',
      description: '화면 설계 및 디자인 시안 작성',
      difficulty: 'MEDIUM',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-01-31'),
      createdBy: admin.id,
      assignees: {
        create: [
          {
            userId: jung.id,
            workArea: 'DESIGN',
          },
        ],
      },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: 'API 서버 개발',
      description: 'RESTful API 설계 및 구현',
      difficulty: 'HIGH',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-02-28'),
      createdBy: admin.id,
      assignees: {
        create: [
          {
            userId: lee.id,
            workArea: 'BACKEND',
          },
        ],
      },
    },
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: '데이터베이스 설계',
      description: 'ERD 작성 및 테이블 구조 설계',
      difficulty: 'HIGH',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-03'),
      endDate: new Date('2026-01-20'),
      createdBy: admin.id,
      assignees: {
        create: [
          {
            userId: lee.id,
            workArea: 'BACKEND',
          },
        ],
      },
    },
  });

  const task5 = await prisma.task.create({
    data: {
      projectId: project2.id,
      taskName: '모바일 화면 기획',
      description: '모바일 앱 화면 구조 및 플로우 기획',
      difficulty: 'MEDIUM',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-02'),
      endDate: new Date('2026-01-31'),
      createdBy: admin.id,
      assignees: {
        create: [
          {
            userId: kim.id,
            workArea: 'PLANNING',
          },
        ],
      },
    },
  });

  const task6 = await prisma.task.create({
    data: {
      projectId: project2.id,
      taskName: '모바일 디자인 시안',
      description: '앱 디자인 시안 제작 및 검토',
      difficulty: 'MEDIUM',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-08'),
      endDate: new Date('2026-01-31'),
      createdBy: admin.id,
      assignees: {
        create: [
          {
            userId: jung.id,
            workArea: 'DESIGN',
          },
        ],
      },
    },
  });

  console.log('✅ 업무 생성 완료');

  // 6. 업무일지(Work Logs) 생성 - 1월 2일부터 1월 20일까지
  const workLogData = [];

  // 김진아 - 요구사항 분석 (1월 2일 ~ 1월 20일, 평일만)
  const kimWorkDates = [
    { date: '2026-01-02', content: '프로젝트 킥오프 미팅 및 요구사항 수집 계획 수립', hours: 8, progress: 5 },
    { date: '2026-01-03', content: '사용자 인터뷰 진행 (인사팀, 재무팀)\n- 급여 관리 기능 요구사항 수집\n- 예산 편성 프로세스 검토', hours: 8, progress: 10 },
    { date: '2026-01-06', content: '요구사항 문서 초안 작성\n- 인사관리 모듈 기능 정의\n- 재무관리 모듈 기능 정의', hours: 7, progress: 15 },
    { date: '2026-01-07', content: '타 부서 인터뷰 진행 (구매팀, 영업팀)\n- 구매 발주 프로세스 분석\n- 영업 관리 요구사항 수집', hours: 8, progress: 22 },
    { date: '2026-01-08', content: '요구사항 명세서 작성 중\n- Use Case 다이어그램 작성\n- 기능 우선순위 정리', hours: 7.5, progress: 30 },
    { date: '2026-01-09', content: '이해관계자 리뷰 미팅\n- 요구사항 검토 및 피드백 수렴\n- 추가 요구사항 논의', hours: 6, progress: 35, issues: '일부 요구사항이 모호하여 추가 미팅 필요' },
    { date: '2026-01-10', content: '요구사항 명세서 수정\n- 피드백 반영\n- 비기능 요구사항 추가', hours: 8, progress: 45 },
    { date: '2026-01-13', content: '프로세스 플로우 다이어그램 작성\n- 주요 업무 프로세스 시각화\n- 시스템 간 데이터 흐름 정의', hours: 7, progress: 55 },
    { date: '2026-01-14', content: '화면 정의서 작성 시작\n- 주요 화면 목록 정리\n- 화면별 기능 요구사항 매핑', hours: 8, progress: 60 },
    { date: '2026-01-15', content: '화면 정의서 계속 작성\n- 입력 항목 및 유효성 검사 규칙 정의\n- 권한별 화면 접근 제어 정의', hours: 7.5, progress: 68 },
    { date: '2026-01-16', content: '데이터 사전 작성\n- 주요 엔티티 정의\n- 속성 및 제약조건 명세', hours: 8, progress: 75 },
    { date: '2026-01-17', content: '요구사항 추적표 작성\n- 요구사항별 담당자 배정\n- 개발 우선순위 결정', hours: 7, progress: 82 },
    { date: '2026-01-20', content: '최종 요구사항 명세서 검토\n- 문서 완성도 점검\n- 개발팀과 협의', hours: 6, progress: 90 },
  ];

  for (const log of kimWorkDates) {
    workLogData.push({
      taskId: task1.id,
      userId: kim.id,
      workDate: new Date(log.date),
      content: log.content,
      workHours: log.hours,
      progress: log.progress,
      issues: log.issues,
    });
  }

  // 정서영 - UI/UX 디자인 (1월 6일 ~ 1월 20일)
  const jungWorkDates = [
    { date: '2026-01-06', content: 'UI/UX 디자인 가이드라인 검토\n- 브랜드 아이덴티티 분석\n- 디자인 시스템 리서치', hours: 7, progress: 5 },
    { date: '2026-01-07', content: '와이어프레임 작성 시작\n- 메인 대시보드 화면 구조 설계\n- 주요 메뉴 구조 정의', hours: 8, progress: 12 },
    { date: '2026-01-08', content: '와이어프레임 계속 작성\n- 인사관리 화면 구조\n- 재무관리 화면 구조', hours: 7.5, progress: 20 },
    { date: '2026-01-09', content: '기획팀과 와이어프레임 리뷰\n- 화면 플로우 검증\n- 사용성 개선 방안 논의', hours: 6, progress: 25 },
    { date: '2026-01-10', content: '디자인 시안 작업 시작\n- 컬러 팔레트 선정\n- 타이포그래피 정의', hours: 8, progress: 30 },
    { date: '2026-01-13', content: '메인 대시보드 디자인 시안 작성\n- 위젯 레이아웃 디자인\n- 차트 및 그래프 스타일 정의', hours: 7, progress: 40 },
    { date: '2026-01-14', content: '인사관리 화면 디자인\n- 직원 목록 화면\n- 상세 정보 화면', hours: 8, progress: 50 },
    { date: '2026-01-15', content: '재무관리 화면 디자인\n- 예산 현황 대시보드\n- 비용 승인 화면', hours: 7.5, progress: 60 },
    { date: '2026-01-16', content: '아이콘 및 일러스트 제작\n- 메뉴 아이콘 세트 제작\n- 빈 상태 일러스트 제작', hours: 8, progress: 68 },
    { date: '2026-01-17', content: '인터랙션 디자인 정의\n- 버튼 호버/클릭 효과\n- 모달 및 알림 애니메이션', hours: 7, progress: 75 },
    { date: '2026-01-20', content: '디자인 시안 1차 완료 및 검토\n- 전체 화면 일관성 점검\n- 피드백 수렴', hours: 6, progress: 85, issues: '일부 화면에 대한 추가 디자인 요청' },
  ];

  for (const log of jungWorkDates) {
    workLogData.push({
      taskId: task2.id,
      userId: jung.id,
      workDate: new Date(log.date),
      content: log.content,
      workHours: log.hours,
      progress: log.progress,
      issues: log.issues,
    });
  }

  // 이남규 - 데이터베이스 설계 & API 개발 (1월 3일 ~ 1월 20일)
  const leeWorkDates = [
    { date: '2026-01-03', content: '데이터베이스 아키텍처 검토\n- 기존 시스템 분석\n- 마이그레이션 전략 수립', hours: 8, progress: 5, taskId: task4.id },
    { date: '2026-01-06', content: 'ERD 작성 시작\n- 주요 엔티티 식별\n- 관계 정의', hours: 7, progress: 15, taskId: task4.id },
    { date: '2026-01-07', content: 'ERD 계속 작성\n- 인사 관련 테이블 설계\n- 재무 관련 테이블 설계', hours: 8, progress: 25, taskId: task4.id },
    { date: '2026-01-08', content: '테이블 상세 설계\n- 컬럼 정의 및 제약조건\n- 인덱스 전략 수립', hours: 7.5, progress: 35, taskId: task4.id },
    { date: '2026-01-09', content: '기획팀과 데이터 모델 리뷰\n- ERD 검증\n- 추가 요구사항 반영', hours: 6, progress: 42, taskId: task4.id },
    { date: '2026-01-10', content: 'DDL 스크립트 작성\n- 테이블 생성 스크립트\n- 초기 데이터 INSERT 스크립트', hours: 8, progress: 55, taskId: task4.id },
    { date: '2026-01-13', content: '개발 환경 DB 구축\n- 로컬 PostgreSQL 설정\n- 테이블 생성 및 검증', hours: 7, progress: 65, taskId: task4.id },
    { date: '2026-01-14', content: 'API 서버 프로젝트 초기 설정\n- NestJS 프로젝트 생성\n- Prisma ORM 설정', hours: 7, progress: 75, taskId: task4.id },
    { date: '2026-01-15', content: 'Prisma 스키마 작성\n- ERD 기반 스키마 정의\n- 마이그레이션 생성', hours: 8, progress: 85, taskId: task4.id },
    { date: '2026-01-16', content: '데이터베이스 설계 최종 검토\n- 성능 최적화 검토\n- 보안 고려사항 점검', hours: 7, progress: 95, taskId: task4.id },
    { date: '2026-01-17', content: '데이터베이스 설계 완료\n- 문서화 완료\n- API 개발 준비', hours: 6, progress: 100, taskId: task4.id },
    { date: '2026-01-17', content: 'API 아키텍처 설계\n- 모듈 구조 설계\n- RESTful API 설계 원칙 정의', hours: 2, progress: 5, taskId: task3.id },
    { date: '2026-01-20', content: '인증/인가 모듈 개발 시작\n- JWT 인증 구현\n- Role-based 권한 관리', hours: 8, progress: 15, taskId: task3.id },
  ];

  for (const log of leeWorkDates) {
    workLogData.push({
      taskId: log.taskId,
      userId: lee.id,
      workDate: new Date(log.date),
      content: log.content,
      workHours: log.hours,
      progress: log.progress,
      issues: (log as any).issues,
    });
  }

  // 프로젝트 2 - 김진아 (모바일 화면 기획)
  const kimProject2Dates = [
    { date: '2026-01-02', content: '모바일 앱 시장 조사\n- 경쟁사 앱 분석\n- 최신 UI/UX 트렌드 리서치', hours: 4, progress: 8 },
    { date: '2026-01-03', content: '사용자 페르소나 정의\n- 타겟 사용자 그룹 분석\n- 사용 시나리오 작성', hours: 4, progress: 15 },
    { date: '2026-01-06', content: '정보 구조(IA) 설계\n- 메뉴 구조 설계\n- 화면 플로우 정의', hours: 4, progress: 25 },
    { date: '2026-01-07', content: '주요 화면 기획서 작성\n- 홈 화면 기획\n- 로그인/회원가입 화면', hours: 4, progress: 35 },
    { date: '2026-01-08', content: '상세 기능 기획\n- 검색 기능\n- 필터링 및 정렬', hours: 3, progress: 42 },
    { date: '2026-01-09', content: '디자인팀과 기획 공유\n- 화면 구조 설명\n- 디자인 방향 논의', hours: 3, progress: 48 },
    { date: '2026-01-10', content: '사용자 스토리 작성\n- 주요 기능별 스토리 작성\n- 수용 조건 정의', hours: 4, progress: 58 },
    { date: '2026-01-13', content: '화면 상세 기획서 작성\n- 마이페이지 기획\n- 설정 화면 기획', hours: 4, progress: 68 },
    { date: '2026-01-14', content: '푸시 알림 기획\n- 알림 유형 정의\n- 알림 설정 화면 기획', hours: 3, progress: 75 },
    { date: '2026-01-15', content: '기획서 리뷰 및 수정\n- 팀 피드백 반영\n- 추가 요구사항 정리', hours: 4, progress: 82 },
    { date: '2026-01-16', content: '온보딩 플로우 기획\n- 첫 방문 사용자 가이드\n- 튜토리얼 화면 기획', hours: 3, progress: 88 },
    { date: '2026-01-17', content: '에러 처리 및 빈 상태 기획\n- 오류 메시지 정의\n- 빈 상태 화면 기획', hours: 4, progress: 94 },
    { date: '2026-01-20', content: '기획서 최종 검토 및 완료\n- 전체 기획 일관성 점검\n- 개발팀 전달 준비', hours: 3, progress: 100 },
  ];

  for (const log of kimProject2Dates) {
    workLogData.push({
      taskId: task5.id,
      userId: kim.id,
      workDate: new Date(log.date),
      content: log.content,
      workHours: log.hours,
      progress: log.progress,
    });
  }

  // 프로젝트 2 - 정서영 (모바일 디자인 시안)
  const jungProject2Dates = [
    { date: '2026-01-08', content: '모바일 디자인 트렌드 분석\n- 최신 앱 디자인 리서치\n- 컬러 및 레이아웃 트렌드 조사', hours: 4, progress: 8 },
    { date: '2026-01-09', content: '스타일 가이드 작성\n- 컬러 시스템 정의\n- 타이포그래피 규칙', hours: 5, progress: 18 },
    { date: '2026-01-10', content: '로우-파이 와이어프레임\n- 주요 화면 구조 스케치\n- 기획팀 피드백 수렴', hours: 4, progress: 28 },
    { date: '2026-01-13', content: '하이-파이 목업 작성 시작\n- 홈 화면 디자인\n- 네비게이션 디자인', hours: 5, progress: 40 },
    { date: '2026-01-14', content: '상세 화면 디자인\n- 콘텐츠 상세 페이지\n- 목록 화면 디자인', hours: 5, progress: 52 },
    { date: '2026-01-15', content: '사용자 인증 화면 디자인\n- 로그인 화면\n- 회원가입 폼', hours: 4, progress: 62 },
    { date: '2026-01-16', content: '마이페이지 디자인\n- 프로필 화면\n- 설정 메뉴 디자인', hours: 5, progress: 72 },
    { date: '2026-01-17', content: '모바일 아이콘 세트 제작\n- 탭 바 아이콘\n- 기능 아이콘', hours: 4, progress: 80 },
    { date: '2026-01-20', content: '디자인 시안 1차 완료\n- 프로토타입 제작\n- 클라이언트 리뷰 준비', hours: 5, progress: 90, issues: '일부 화면 색상 대비 검토 필요' },
  ];

  for (const log of jungProject2Dates) {
    workLogData.push({
      taskId: task6.id,
      userId: jung.id,
      workDate: new Date(log.date),
      content: log.content,
      workHours: log.hours,
      progress: log.progress,
      issues: log.issues,
    });
  }

  // 업무일지 일괄 생성
  for (const logData of workLogData) {
    await prisma.workLog.create({
      data: logData,
    });
  }

  console.log(`✅ 업무일지 ${workLogData.length}건 생성 완료`);
  console.log('✨ 시드 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
