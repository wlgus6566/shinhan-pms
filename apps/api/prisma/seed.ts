import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 1. 슈퍼 관리자 계정 생성
  const adminPasswordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@emotion.co.kr' },
    update: {
      role: 'SUPER_ADMIN',
      department: 'PLANNING_STRATEGY',
      position: 'GENERAL_MANAGER',
    },
    create: {
      email: 'admin@emotion.co.kr',
      passwordHash: adminPasswordHash,
      name: '시스템 관리자',
      department: 'PLANNING_STRATEGY',
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
    update: {
      role: 'PM',
      department: 'PLANNING_1',
      position: 'PRINCIPAL_LEADER',
    },
    create: {
      email: 'kim@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '김진아',
      department: 'PLANNING_1',
      position: 'PRINCIPAL_LEADER',
      role: 'PM',
      createdBy: admin.id,
    },
  });

  const lee = await prisma.user.upsert({
    where: { email: 'lee@emotion.co.kr' },
    update: {
      role: 'MEMBER',
      department: 'DEVELOPMENT_1',
      position: 'PRINCIPAL_LEADER',
    },
    create: {
      email: 'lee@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '이남규',
      department: 'DEVELOPMENT_1',
      position: 'PRINCIPAL_LEADER',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  const park = await prisma.user.upsert({
    where: { email: 'park@emotion.co.kr' },
    update: {
      role: 'MEMBER',
      department: 'PLANNING_1',
      position: 'SENIOR_LEADER',
    },
    create: {
      email: 'park@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '박기호',
      department: 'PLANNING_1',
      position: 'SENIOR_LEADER',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  const choi = await prisma.user.upsert({
    where: { email: 'choi@emotion.co.kr' },
    update: { role: 'MEMBER', department: 'DIGITAL_1', position: 'LEADER' },
    create: {
      email: 'choi@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '최승민',
      department: 'DIGITAL_1',
      position: 'LEADER',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  const jung = await prisma.user.upsert({
    where: { email: 'jung@emotion.co.kr' },
    update: {
      role: 'MEMBER',
      department: 'DIGITAL_1',
      position: 'SENIOR_LEADER',
    },
    create: {
      email: 'jung@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '정서영',
      department: 'DIGITAL_1',
      position: 'SENIOR_LEADER',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  console.log('✅ 테스트 계정 생성 완료');

  // 3. 프로젝트 생성 (3개)
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

  const project3 = await prisma.project.upsert({
    where: { projectName: '파리바게트 앱 구축' },
    update: {},
    create: {
      projectName: '파리바게트 앱 구축',
      client: '파리바게트',
      projectType: 'BUILD',
      description: '파리바게트 모바일 주문 및 멤버십 앱 신규 구축',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2026-06-30'),
      status: 'ACTIVE',
      createdBy: admin.id,
    },
  });

  console.log(
    '✅ 프로젝트 3개 생성 완료:',
    project1.projectName,
    ',',
    project2.projectName,
    ',',
    project3.projectName,
  );

  // 4. 프로젝트 멤버 추가
  // --- Project 1: 이모션 차세대 ERP 구축 ---
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project1.id, memberId: admin.id } },
    update: {},
    create: { projectId: project1.id, memberId: admin.id, role: 'PM', workArea: 'PROJECT_MANAGEMENT', notes: '총괄PM', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project1.id, memberId: kim.id } },
    update: {},
    create: { projectId: project1.id, memberId: kim.id, role: 'PL', workArea: 'PLANNING', notes: '책임리더', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project1.id, memberId: park.id } },
    update: {},
    create: { projectId: project1.id, memberId: park.id, role: 'PA', workArea: 'PLANNING', notes: '선임리더', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project1.id, memberId: jung.id } },
    update: {},
    create: { projectId: project1.id, memberId: jung.id, role: 'PL', workArea: 'DESIGN', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project1.id, memberId: choi.id } },
    update: {},
    create: { projectId: project1.id, memberId: choi.id, role: 'PA', workArea: 'DESIGN', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project1.id, memberId: lee.id } },
    update: {},
    create: { projectId: project1.id, memberId: lee.id, role: 'PL', workArea: 'BACKEND', createdBy: admin.id },
  });

  // --- Project 2: 모바일 앱 리뉴얼 ---
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project2.id, memberId: admin.id } },
    update: {},
    create: { projectId: project2.id, memberId: admin.id, role: 'PM', workArea: 'PROJECT_MANAGEMENT', notes: '총괄PM', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project2.id, memberId: kim.id } },
    update: {},
    create: { projectId: project2.id, memberId: kim.id, role: 'PL', workArea: 'PLANNING', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project2.id, memberId: park.id } },
    update: {},
    create: { projectId: project2.id, memberId: park.id, role: 'PA', workArea: 'PLANNING', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project2.id, memberId: jung.id } },
    update: {},
    create: { projectId: project2.id, memberId: jung.id, role: 'PL', workArea: 'DESIGN', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project2.id, memberId: lee.id } },
    update: {},
    create: { projectId: project2.id, memberId: lee.id, role: 'PL', workArea: 'BACKEND', createdBy: admin.id },
  });

  // --- Project 3: 파리바게트 앱 구축 ---
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project3.id, memberId: admin.id } },
    update: {},
    create: { projectId: project3.id, memberId: admin.id, role: 'PL', workArea: 'PROJECT_MANAGEMENT', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project3.id, memberId: kim.id } },
    update: {},
    create: { projectId: project3.id, memberId: kim.id, role: 'PM', workArea: 'PROJECT_MANAGEMENT', notes: 'PM', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project3.id, memberId: jung.id } },
    update: {},
    create: { projectId: project3.id, memberId: jung.id, role: 'PL', workArea: 'DESIGN', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project3.id, memberId: lee.id } },
    update: {},
    create: { projectId: project3.id, memberId: lee.id, role: 'PL', workArea: 'BACKEND', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project3.id, memberId: park.id } },
    update: {},
    create: { projectId: project3.id, memberId: park.id, role: 'PA', workArea: 'PLANNING', createdBy: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_memberId: { projectId: project3.id, memberId: choi.id } },
    update: {},
    create: { projectId: project3.id, memberId: choi.id, role: 'PA', workArea: 'DESIGN', createdBy: admin.id },
  });

  console.log('✅ 프로젝트 멤버 추가 완료');

  // 5. 업무(Tasks) 생성 - 상태별 골고루 배분, 프로젝트별 nodata 구간 포함
  // 기존 데이터 정리 (재실행 시 중복 방지)
  await prisma.scheduleParticipant.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.workLog.deleteMany({});
  await prisma.task.deleteMany({});

  // ============================================================
  // Project 1: 이모션 차세대 ERP 구축
  // nodata: WAITING, OPEN_RESPONDING
  // ============================================================
  const p1_task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: '요구사항 분석 및 정의',
      description: '사용자 요구사항 수집 및 기능 명세서 작성',
      difficulty: 'MEDIUM',
      status: 'WORK_COMPLETED',
      startDate: new Date('2026-01-02'),
      endDate: new Date('2026-02-15'),
      createdBy: admin.id,
      assignees: { create: [{ userId: kim.id, workArea: 'PLANNING' }] },
    },
  });

  const p1_task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: 'UI/UX 디자인',
      description: '화면 설계 및 디자인 시안 작성',
      difficulty: 'MEDIUM',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-03-31'),
      createdBy: admin.id,
      assignees: {
        create: [
          { userId: jung.id, workArea: 'DESIGN' },
          { userId: choi.id, workArea: 'DESIGN' },
        ],
      },
    },
  });

  const p1_task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: 'API 서버 개발',
      description: 'RESTful API 설계 및 구현',
      difficulty: 'HIGH',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-04-30'),
      createdBy: admin.id,
      assignees: { create: [{ userId: lee.id, workArea: 'BACKEND' }] },
    },
  });

  const p1_task4 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: '데이터베이스 설계',
      description: 'ERD 작성 및 테이블 구조 설계 완료, 오픈 대기 중',
      difficulty: 'HIGH',
      status: 'OPEN_WAITING',
      startDate: new Date('2026-01-03'),
      endDate: new Date('2026-01-31'),
      createdBy: admin.id,
      assignees: { create: [{ userId: lee.id, workArea: 'BACKEND' }] },
    },
  });

  const p1_task5 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: 'ERP 인사관리 모듈 기획',
      description: '인사관리 모듈 기획 완료 후 테스트 단계 진행 중',
      difficulty: 'HIGH',
      status: 'TESTING',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-03-15'),
      createdBy: admin.id,
      assignees: {
        create: [
          { userId: kim.id, workArea: 'PLANNING' },
          { userId: park.id, workArea: 'PLANNING' },
        ],
      },
    },
  });

  const p1_task6 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: 'ERP 프로젝트 킥오프 준비',
      description: '프로젝트 킥오프 미팅 자료 및 WBS 작성 완료',
      difficulty: 'LOW',
      status: 'COMPLETED',
      startDate: new Date('2025-12-15'),
      endDate: new Date('2026-01-02'),
      createdBy: admin.id,
      assignees: { create: [{ userId: kim.id, workArea: 'PLANNING' }] },
    },
  });

  const p1_task7 = await prisma.task.create({
    data: {
      projectId: project1.id,
      taskName: 'ERP 레거시 데이터 마이그레이션',
      description: '기존 시스템 데이터 이관 - 예산 문제로 중단',
      difficulty: 'HIGH',
      status: 'SUSPENDED',
      startDate: new Date('2026-01-20'),
      endDate: new Date('2026-03-31'),
      createdBy: admin.id,
      assignees: { create: [{ userId: lee.id, workArea: 'BACKEND' }] },
    },
  });

  // ============================================================
  // Project 2: 모바일 앱 리뉴얼
  // nodata: OPEN_WAITING, SUSPENDED
  // ============================================================
  const p2_task1 = await prisma.task.create({
    data: {
      projectId: project2.id,
      taskName: '모바일 화면 기획',
      description: '모바일 앱 화면 구조 및 플로우 기획',
      difficulty: 'MEDIUM',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-02'),
      endDate: new Date('2026-03-15'),
      createdBy: admin.id,
      assignees: { create: [{ userId: kim.id, workArea: 'PLANNING' }] },
    },
  });

  const p2_task2 = await prisma.task.create({
    data: {
      projectId: project2.id,
      taskName: '모바일 디자인 시안',
      description: '앱 디자인 시안 제작 완료, 검수 대기',
      difficulty: 'MEDIUM',
      status: 'WORK_COMPLETED',
      startDate: new Date('2026-01-08'),
      endDate: new Date('2026-02-28'),
      createdBy: admin.id,
      assignees: { create: [{ userId: jung.id, workArea: 'DESIGN' }] },
    },
  });

  const p2_task3 = await prisma.task.create({
    data: {
      projectId: project2.id,
      taskName: '모바일 로그인 기능 구현',
      description: '소셜 로그인 포함 인증 모듈 구현 후 테스트 중',
      difficulty: 'HIGH',
      status: 'TESTING',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-03-10'),
      createdBy: admin.id,
      assignees: { create: [{ userId: lee.id, workArea: 'BACKEND' }] },
    },
  });

  const p2_task4 = await prisma.task.create({
    data: {
      projectId: project2.id,
      taskName: '앱 성능 최적화 계획',
      description: '앱 퍼포먼스 분석 및 최적화 방안 수립',
      difficulty: 'MEDIUM',
      status: 'WAITING',
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-04-15'),
      createdBy: admin.id,
      assignees: { create: [{ userId: park.id, workArea: 'PLANNING' }] },
    },
  });

  const p2_task5 = await prisma.task.create({
    data: {
      projectId: project2.id,
      taskName: '모바일 결제 모듈 연동',
      description: 'PG사 연동 후 운영 이슈 대응 중',
      difficulty: 'HIGH',
      status: 'OPEN_RESPONDING',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-02-28'),
      createdBy: admin.id,
      assignees: { create: [{ userId: lee.id, workArea: 'BACKEND' }] },
    },
  });

  const p2_task6 = await prisma.task.create({
    data: {
      projectId: project2.id,
      taskName: '앱 시장조사 및 벤치마킹',
      description: '경쟁사 앱 분석 및 벤치마킹 보고서 작성 완료',
      difficulty: 'LOW',
      status: 'COMPLETED',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-01-10'),
      createdBy: admin.id,
      assignees: { create: [{ userId: kim.id, workArea: 'PLANNING' }] },
    },
  });

  // ============================================================
  // Project 3: 파리바게트 앱 구축
  // nodata: WORK_COMPLETED
  // ============================================================
  const p3_task1 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '주문 기능 기획',
      description: '모바일 사전주문 및 픽업 기능 기획',
      difficulty: 'HIGH',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-13'),
      endDate: new Date('2026-03-31'),
      createdBy: admin.id,
      assignees: { create: [{ userId: kim.id, workArea: 'PLANNING' }] },
    },
  });

  const p3_task2 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '매장 찾기 기능 테스트',
      description: '위치 기반 매장 찾기 기능 QA 테스트 진행 중',
      difficulty: 'MEDIUM',
      status: 'TESTING',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-02-20'),
      createdBy: admin.id,
      assignees: { create: [{ userId: choi.id, workArea: 'DESIGN' }] },
    },
  });

  const p3_task3 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '푸시 알림 기능 개발',
      description: '마케팅 푸시 알림 기능 개발 완료, 오픈 대기',
      difficulty: 'MEDIUM',
      status: 'OPEN_WAITING',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-02-28'),
      createdBy: admin.id,
      assignees: { create: [{ userId: jung.id, workArea: 'DESIGN' }] },
    },
  });

  const p3_task4 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '결제 연동 개발',
      description: 'PG사 결제 모듈 연동 개발 대기',
      difficulty: 'HIGH',
      status: 'WAITING',
      startDate: new Date('2026-02-15'),
      endDate: new Date('2026-04-30'),
      createdBy: admin.id,
      assignees: { create: [{ userId: lee.id, workArea: 'BACKEND' }] },
    },
  });

  const p3_task5 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '멤버십 화면 디자인',
      description: '포인트/쿠폰 화면 오픈 후 이슈 대응 중',
      difficulty: 'MEDIUM',
      status: 'OPEN_RESPONDING',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-02-15'),
      createdBy: admin.id,
      assignees: { create: [{ userId: jung.id, workArea: 'DESIGN' }] },
    },
  });

  const p3_task6 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '앱 기획서 작성',
      description: '파리바게트 앱 전체 기획서 작성 완료',
      difficulty: 'MEDIUM',
      status: 'COMPLETED',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-12-31'),
      createdBy: admin.id,
      assignees: { create: [{ userId: kim.id, workArea: 'PLANNING' }] },
    },
  });

  const p3_task7 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: 'AR 매장 탐색 기능',
      description: 'AR 기반 매장 탐색 기능 - 예산 조정으로 중단',
      difficulty: 'HIGH',
      status: 'SUSPENDED',
      startDate: new Date('2026-01-20'),
      endDate: new Date('2026-06-30'),
      createdBy: admin.id,
      assignees: { create: [{ userId: park.id, workArea: 'PLANNING' }] },
    },
  });

  console.log('✅ 업무 생성 완료 (3개 프로젝트, 20개 업무)');

  // ============================================================
  // 6. 1월 업무일지 (간략 - 히스토리용)
  // ============================================================
  const janWorkLogs: Array<{
    taskId: bigint;
    userId: bigint;
    workDate: Date;
    content: string;
    workHours: number;
    progress: number;
    issues?: string;
  }> = [];

  // 김진아 - P1 요구사항 분석 (1월)
  const kimJanP1 = [
    { date: '2026-01-02', content: '프로젝트 킥오프 미팅 및 요구사항 수집 계획 수립', hours: 8, progress: 5 },
    { date: '2026-01-03', content: '사용자 인터뷰 진행 (인사팀, 재무팀)\n- 급여 관리 기능 요구사항 수집', hours: 8, progress: 12 },
    { date: '2026-01-06', content: '요구사항 문서 초안 작성\n- 인사관리 모듈 기능 정의', hours: 7, progress: 20 },
    { date: '2026-01-07', content: '타 부서 인터뷰 진행 (구매팀, 영업팀)', hours: 8, progress: 28 },
    { date: '2026-01-08', content: '요구사항 명세서 작성\n- Use Case 다이어그램 작성', hours: 7.5, progress: 35 },
    { date: '2026-01-09', content: '이해관계자 리뷰 미팅\n- 피드백 수렴', hours: 6, progress: 42, issues: '일부 요구사항이 모호하여 추가 미팅 필요' },
    { date: '2026-01-10', content: '요구사항 명세서 수정\n- 비기능 요구사항 추가', hours: 8, progress: 50 },
    { date: '2026-01-13', content: '프로세스 플로우 다이어그램 작성', hours: 7, progress: 58 },
    { date: '2026-01-14', content: '화면 정의서 작성\n- 주요 화면 목록 정리', hours: 8, progress: 65 },
    { date: '2026-01-15', content: '화면 정의서 계속\n- 입력 항목 및 유효성 검사 규칙 정의', hours: 7.5, progress: 72 },
    { date: '2026-01-16', content: '데이터 사전 작성\n- 주요 엔티티 정의', hours: 8, progress: 80 },
    { date: '2026-01-17', content: '요구사항 추적표 작성 및 우선순위 결정', hours: 7, progress: 85 },
    { date: '2026-01-20', content: '최종 요구사항 명세서 검토 및 배포', hours: 6, progress: 90 },
  ];
  for (const log of kimJanP1) {
    janWorkLogs.push({ taskId: p1_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // 정서영 - P1 UI/UX 디자인 (1월)
  const jungJanP1 = [
    { date: '2026-01-06', content: 'UI/UX 디자인 가이드라인 검토 및 리서치', hours: 7, progress: 5 },
    { date: '2026-01-07', content: '와이어프레임 작성 시작\n- 메인 대시보드 구조 설계', hours: 8, progress: 12 },
    { date: '2026-01-08', content: '와이어프레임 계속\n- 인사관리, 재무관리 화면 구조', hours: 7.5, progress: 20 },
    { date: '2026-01-10', content: '디자인 시안 작업 시작\n- 컬러 팔레트, 타이포그래피 정의', hours: 8, progress: 30 },
    { date: '2026-01-13', content: '메인 대시보드 디자인 시안 작성', hours: 7, progress: 40 },
    { date: '2026-01-14', content: '인사관리 화면 디자인\n- 직원 목록, 상세 정보 화면', hours: 8, progress: 50 },
    { date: '2026-01-15', content: '재무관리 화면 디자인\n- 예산 현황 대시보드', hours: 7.5, progress: 60 },
    { date: '2026-01-17', content: '인터랙션 디자인 정의\n- 모달 및 알림 애니메이션', hours: 7, progress: 70 },
    { date: '2026-01-20', content: '디자인 시안 1차 완료 및 검토', hours: 6, progress: 78 },
  ];
  for (const log of jungJanP1) {
    janWorkLogs.push({ taskId: p1_task2.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 이남규 - P1 API 서버 개발 & DB 설계 (1월)
  const leeJanP1 = [
    { date: '2026-01-03', content: '데이터베이스 아키텍처 검토 및 마이그레이션 전략 수립', hours: 8, progress: 10, taskId: p1_task4.id },
    { date: '2026-01-06', content: 'ERD 작성\n- 주요 엔티티 식별 및 관계 정의', hours: 7, progress: 25, taskId: p1_task4.id },
    { date: '2026-01-07', content: 'ERD 계속\n- 인사/재무 관련 테이블 설계', hours: 8, progress: 40, taskId: p1_task4.id },
    { date: '2026-01-08', content: '테이블 상세 설계\n- 컬럼, 제약조건, 인덱스 전략', hours: 7.5, progress: 55, taskId: p1_task4.id },
    { date: '2026-01-10', content: 'DDL 스크립트 작성 및 검증', hours: 8, progress: 70, taskId: p1_task4.id },
    { date: '2026-01-13', content: '개발 환경 DB 구축\n- PostgreSQL 설정 및 검증', hours: 7, progress: 85, taskId: p1_task4.id },
    { date: '2026-01-15', content: 'Prisma 스키마 작성 및 마이그레이션 생성', hours: 8, progress: 95, taskId: p1_task4.id },
    { date: '2026-01-16', content: '데이터베이스 설계 최종 검토 완료', hours: 7, progress: 100, taskId: p1_task4.id },
    { date: '2026-01-17', content: 'API 아키텍처 설계\n- 모듈 구조 및 RESTful 원칙 정의', hours: 6, progress: 5, taskId: p1_task3.id },
    { date: '2026-01-20', content: '인증/인가 모듈 개발\n- JWT 인증 구현', hours: 8, progress: 12, taskId: p1_task3.id },
  ];
  for (const log of leeJanP1) {
    janWorkLogs.push({ taskId: log.taskId, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 김진아 - P2 모바일 화면 기획 (1월)
  const kimJanP2 = [
    { date: '2026-01-02', content: '모바일 앱 시장 조사 및 경쟁사 분석', hours: 4, progress: 8 },
    { date: '2026-01-03', content: '사용자 페르소나 정의 및 시나리오 작성', hours: 4, progress: 15 },
    { date: '2026-01-06', content: '정보 구조(IA) 설계\n- 메뉴 구조, 화면 플로우 정의', hours: 4, progress: 25 },
    { date: '2026-01-07', content: '주요 화면 기획서 작성\n- 홈, 로그인/회원가입 화면', hours: 4, progress: 35 },
    { date: '2026-01-09', content: '디자인팀과 기획 공유\n- 화면 구조 설명', hours: 3, progress: 42 },
    { date: '2026-01-10', content: '사용자 스토리 작성\n- 주요 기능별 수용 조건 정의', hours: 4, progress: 52 },
    { date: '2026-01-14', content: '푸시 알림 기획\n- 알림 유형 정의', hours: 3, progress: 60 },
    { date: '2026-01-16', content: '온보딩 플로우 기획\n- 첫 방문 사용자 가이드', hours: 3, progress: 68 },
    { date: '2026-01-20', content: '기획서 1차 리뷰 및 피드백 반영', hours: 3, progress: 75 },
  ];
  for (const log of kimJanP2) {
    janWorkLogs.push({ taskId: p2_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 정서영 - P2 모바일 디자인 시안 (1월)
  const jungJanP2 = [
    { date: '2026-01-08', content: '모바일 디자인 트렌드 분석 및 리서치', hours: 4, progress: 8 },
    { date: '2026-01-09', content: '스타일 가이드 작성\n- 컬러, 타이포그래피', hours: 5, progress: 18 },
    { date: '2026-01-10', content: '로우-파이 와이어프레임 스케치', hours: 4, progress: 28 },
    { date: '2026-01-13', content: '하이-파이 목업\n- 홈 화면, 네비게이션 디자인', hours: 5, progress: 40 },
    { date: '2026-01-14', content: '상세 화면 디자인\n- 콘텐츠 상세, 목록 화면', hours: 5, progress: 52 },
    { date: '2026-01-16', content: '마이페이지, 설정 메뉴 디자인', hours: 5, progress: 65 },
    { date: '2026-01-17', content: '모바일 아이콘 세트 제작', hours: 4, progress: 75 },
    { date: '2026-01-20', content: '디자인 시안 1차 완료 및 프로토타입 제작', hours: 5, progress: 85 },
  ];
  for (const log of jungJanP2) {
    janWorkLogs.push({ taskId: p2_task2.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 1월 업무일지 일괄 생성
  for (const logData of janWorkLogs) {
    await prisma.workLog.create({ data: logData });
  }
  console.log(`✅ 1월 업무일지 ${janWorkLogs.length}건 생성 완료`);

  // ============================================================
  // 7. 2월 업무일지 - 김진아(kim) 중심 + 기타 멤버
  // Kim 활성 업무: p1_task1(WORK_COMPLETED), p1_task5(TESTING),
  //               p2_task1(IN_PROGRESS), p3_task1(IN_PROGRESS)
  // ============================================================
  const febWorkLogs: Array<{
    taskId: bigint;
    userId: bigint;
    workDate: Date;
    content: string;
    workHours: number;
    progress: number;
    issues?: string;
  }> = [];

  // ---- 김진아 2월 업무일지 ----

  // P1 요구사항 분석 (WORK_COMPLETED) - 마무리 단계
  const kimFebP1T1 = [
    { date: '2026-02-02', content: '요구사항 최종 확정 회의 진행\n- 전체 요구사항 목록 확정\n- 변경 이력 관리 프로세스 수립', hours: 4, progress: 92 },
    { date: '2026-02-03', content: '변경 관리 대장 작성 및 배포\n- 요구사항 변경 요청서 양식 확정', hours: 3, progress: 95 },
    { date: '2026-02-04', content: 'API 개발 지원 - 요구사항 상세 설명\n- 개발팀 Q&A 대응', hours: 2, progress: 97 },
    { date: '2026-02-05', content: '요구사항 추적표 최종 업데이트\n- 개발 진행률 반영', hours: 2, progress: 98 },
    { date: '2026-02-06', content: '요구사항 분석 최종 문서 배포\n- 이해관계자 서명 완료', hours: 2, progress: 100 },
  ];
  for (const log of kimFebP1T1) {
    febWorkLogs.push({ taskId: p1_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // P1 ERP 인사관리 모듈 기획 (TESTING) - 테스트 지원
  const kimFebP1T5 = [
    { date: '2026-02-09', content: 'ERP 인사관리 모듈 테스트 케이스 작성\n- 주요 시나리오별 TC 정의\n- 엣지 케이스 정리', hours: 5, progress: 55 },
    { date: '2026-02-10', content: 'QA 1차 검수 진행\n- 급여 계산 로직 검증\n- 입/퇴사 프로세스 확인', hours: 6, progress: 60, issues: '급여 계산 소수점 처리 이슈 발견' },
    { date: '2026-02-11', content: 'QA 이슈 리포트 정리\n- 발견된 이슈 8건 분류\n- 개발팀 수정 요청', hours: 4, progress: 63 },
    { date: '2026-02-12', content: '이슈 수정 확인 및 재테스트\n- Critical 이슈 2건 수정 확인', hours: 3, progress: 68 },
    { date: '2026-02-16', content: 'QA 2차 검수 진행\n- 수정 항목 재검증\n- 추가 발견 이슈 정리', hours: 5, progress: 73 },
    { date: '2026-02-18', content: '사용자 수용 테스트(UAT) 준비\n- 테스트 시나리오 확정\n- 참여 인원 선정', hours: 4, progress: 78 },
    { date: '2026-02-19', content: 'UAT 1차 실행\n- 인사팀 참여 테스트\n- 피드백 수집', hours: 6, progress: 82 },
    { date: '2026-02-23', content: 'UAT 피드백 정리 및 전달\n- UI 개선 요청 5건\n- 기능 보완 요청 3건', hours: 4, progress: 85 },
    { date: '2026-02-25', content: 'UAT 2차 실행\n- 수정 항목 확인\n- 최종 승인 진행 중', hours: 5, progress: 90, issues: 'UAT 중 권한 관련 추가 요청 발생' },
    { date: '2026-02-27', content: '인사관리 모듈 테스트 결과 보고서 작성\n- 전체 테스트 커버리지 정리', hours: 3, progress: 93 },
  ];
  for (const log of kimFebP1T5) {
    febWorkLogs.push({ taskId: p1_task5.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // P2 모바일 화면 기획 (IN_PROGRESS) - 주력 업무
  const kimFebP2T1 = [
    { date: '2026-02-02', content: '모바일 마이페이지 상세 기획\n- 프로필 편집 화면\n- 주문 내역 화면 기획', hours: 4, progress: 78 },
    { date: '2026-02-03', content: '검색 기능 상세 기획\n- 검색 필터 UI 구조 설계\n- 최근 검색어 로직', hours: 5, progress: 80 },
    { date: '2026-02-04', content: '결제 화면 플로우 기획\n- 결제 수단 선택 화면\n- 결제 완료/실패 처리 플로우', hours: 5, progress: 83 },
    { date: '2026-02-05', content: '에러 처리 화면 기획\n- 네트워크 오류, 서버 오류\n- 빈 상태 화면 정의', hours: 4, progress: 85 },
    { date: '2026-02-06', content: '기획서 중간 리뷰\n- 디자인팀/개발팀 피드백 수렴', hours: 3, progress: 86 },
    { date: '2026-02-09', content: '접근성 가이드 작성\n- 스크린리더 대응 요구사항\n- 색상 대비 기준 정의', hours: 3, progress: 88 },
    { date: '2026-02-10', content: '푸시 알림 상세 기획\n- 알림 유형별 표시 방식\n- 알림 센터 화면 기획', hours: 4, progress: 90 },
    { date: '2026-02-13', content: '개발팀 기획 Q&A 대응\n- 기능별 상세 로직 설명\n- API 명세 협의', hours: 3, progress: 91 },
    { date: '2026-02-16', content: '사용자 피드백 기능 기획\n- 앱 내 피드백 수집 화면\n- FAQ 화면 기획', hours: 4, progress: 93 },
    { date: '2026-02-17', content: '태블릿 대응 레이아웃 기획\n- 화면 분할 구조 정의\n- 가로/세로 모드 대응', hours: 5, progress: 95 },
    { date: '2026-02-20', content: '기획서 2차 리뷰\n- 전체 기획 일관성 점검\n- 최종 피드백 반영', hours: 3, progress: 96 },
    { date: '2026-02-24', content: '화면 정의서 최종 정리\n- 전체 화면 번호 체계 확정\n- 변경 이력 반영', hours: 5, progress: 98 },
    { date: '2026-02-26', content: '기획서 최종 배포 준비\n- 문서 포맷 정리\n- 개발팀 전달 준비', hours: 3, progress: 99 },
  ];
  for (const log of kimFebP2T1) {
    febWorkLogs.push({ taskId: p2_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // P3 주문 기능 기획 (IN_PROGRESS) - 신규 프로젝트
  const kimFebP3T1 = [
    { date: '2026-02-03', content: '파리바게트 주문 프로세스 분석\n- 현행 오프라인 주문 플로우 조사\n- 경쟁사 앱 사전주문 기능 분석', hours: 5, progress: 8 },
    { date: '2026-02-04', content: '사전주문 기능 정의\n- 메뉴 선택 → 매장 선택 → 픽업 시간 선택 플로우\n- 주문 가능 시간대 정책 정의', hours: 6, progress: 15 },
    { date: '2026-02-05', content: '메뉴 카테고리 구조 설계\n- 빵류/케이크/음료/세트 분류 체계\n- 메뉴 상세 화면 기획', hours: 5, progress: 22 },
    { date: '2026-02-06', content: '장바구니 기능 기획\n- 수량 변경, 옵션 선택\n- 쿠폰/포인트 적용 로직', hours: 5, progress: 28 },
    { date: '2026-02-09', content: '주문 결제 플로우 기획\n- 결제 수단 (카드/간편결제/포인트)\n- 주문 확인 화면', hours: 5, progress: 35 },
    { date: '2026-02-11', content: '주문 상태 추적 기획\n- 주문접수 → 제조중 → 픽업가능 상태 플로우\n- 실시간 알림 정의', hours: 4, progress: 40 },
    { date: '2026-02-12', content: '매장 찾기 연동 기획\n- GPS 기반 근처 매장 리스트\n- 매장별 주문 가능 여부 표시', hours: 5, progress: 45, issues: '매장 영업시간 데이터 연동 방식 확인 필요' },
    { date: '2026-02-13', content: '취소/환불 프로세스 기획\n- 주문 취소 정책 정의\n- 환불 처리 플로우', hours: 4, progress: 50 },
    { date: '2026-02-17', content: '재주문 기능 기획\n- 이전 주문 내역 기반 빠른 재주문\n- 자주 주문하는 메뉴 관리', hours: 4, progress: 55 },
    { date: '2026-02-18', content: '예약 주문 기획\n- 케이크/세트 예약 주문 프로세스\n- 예약 가능 일시 선택 UI', hours: 5, progress: 60 },
    { date: '2026-02-19', content: '주문 기능 기획서 중간 리뷰\n- PM 및 클라이언트 피드백\n- 수정 요청 사항 정리', hours: 3, progress: 63 },
    { date: '2026-02-20', content: '피드백 반영 및 기획서 수정\n- 주문 수량 제한 정책 추가\n- 매장별 커스텀 메뉴 처리', hours: 5, progress: 68 },
    { date: '2026-02-23', content: '그룹 주문 기획\n- 단체 주문 기능 설계\n- 주문 공유 링크 생성 기획', hours: 5, progress: 73 },
    { date: '2026-02-24', content: '주문 알림 기획\n- 주문 단계별 푸시 알림\n- SMS/카카오톡 알림 연동', hours: 4, progress: 77 },
    { date: '2026-02-25', content: '주문 통계 대시보드 기획\n- 매장 관리자용 주문 현황 화면\n- 일별/주별 통계 차트', hours: 5, progress: 82 },
    { date: '2026-02-26', content: '주문 기능 화면 정의서 작성\n- 전체 화면 목록 확정\n- 화면별 인터랙션 정의', hours: 5, progress: 86 },
    { date: '2026-02-27', content: '주문 기능 기획서 2차 리뷰\n- 개발 가능성 검토 피드백 반영\n- API 명세 초안 협의', hours: 4, progress: 90 },
  ];
  for (const log of kimFebP3T1) {
    febWorkLogs.push({ taskId: p3_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // ---- 기타 멤버 2월 업무일지 (간략) ----

  // 이남규 - P1 API 서버 개발 (2월)
  const leeFebP1T3 = [
    { date: '2026-02-02', content: '사용자 CRUD API 개발\n- 목록 조회 (페이징, 필터링)', hours: 8, progress: 20 },
    { date: '2026-02-03', content: '사용자 생성/수정/삭제 API 완료\n- 유효성 검사 및 에러 핸들링', hours: 8, progress: 28 },
    { date: '2026-02-04', content: '프로젝트 관리 API 개발 시작\n- 프로젝트 목록/상세 조회', hours: 7.5, progress: 35 },
    { date: '2026-02-05', content: '프로젝트 멤버 관리 API\n- 역할별 권한 체크 로직', hours: 8, progress: 42, issues: '프로젝트 멤버 권한 체크 로직 복잡도 증가' },
    { date: '2026-02-06', content: 'API 통합 테스트 작성\n- 사용자/프로젝트 API 테스트', hours: 7, progress: 48 },
    { date: '2026-02-09', content: '업무 관리 API 개발\n- 업무 생성/수정/삭제', hours: 8, progress: 55 },
    { date: '2026-02-10', content: '업무 담당자 배정 API\n- 담당자 추가/변경/삭제', hours: 7, progress: 60 },
  ];
  for (const log of leeFebP1T3) {
    febWorkLogs.push({ taskId: p1_task3.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // 정서영 - P1 UI/UX 디자인 (2월)
  const jungFebP1T2 = [
    { date: '2026-02-02', content: '디자인 피드백 반영\n- 대시보드 차트 색상 변경', hours: 7, progress: 82 },
    { date: '2026-02-03', content: '추가 화면 디자인 - 알림 센터\n- 알림 목록 및 상세 팝업', hours: 8, progress: 86 },
    { date: '2026-02-04', content: '설정 화면 아이콘 세트 보완\n- 반응형 레이아웃 가이드', hours: 4, progress: 88 },
    { date: '2026-02-05', content: '퍼블리셔 가이드 문서 작성\n- 컴포넌트별 스펙 정리', hours: 7, progress: 92 },
    { date: '2026-02-06', content: '디자인 최종 검수 및 핸드오프\n- Figma 핸드오프 완료', hours: 6, progress: 96 },
  ];
  for (const log of jungFebP1T2) {
    febWorkLogs.push({ taskId: p1_task2.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - P1 UI/UX 디자인 (퍼블리싱, 2월)
  const choiFebP1T2 = [
    { date: '2026-02-02', content: '디자인 시안 기반 퍼블리싱 시작\n- 공통 컴포넌트 마크업', hours: 8, progress: 82 },
    { date: '2026-02-03', content: '대시보드 화면 퍼블리싱\n- 위젯 레이아웃 구현', hours: 8, progress: 86 },
    { date: '2026-02-05', content: '목록/상세 화면 퍼블리싱\n- 테이블 컴포넌트 스타일링', hours: 8, progress: 90 },
    { date: '2026-02-06', content: '폼 레이아웃 구현\n- 반응형 레이아웃 적용', hours: 7.5, progress: 94 },
  ];
  for (const log of choiFebP1T2) {
    febWorkLogs.push({ taskId: p1_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 박기호 - P1 ERP 인사관리 모듈 기획 보조 (2월)
  const parkFebP1T5 = [
    { date: '2026-02-02', content: '인사관리 모듈 회의록 작성\n- 요구사항 변경 이력 정리', hours: 7, progress: 55 },
    { date: '2026-02-03', content: '화면 정의서 업데이트\n- 신규 추가 화면 정의서 작성', hours: 8, progress: 60 },
    { date: '2026-02-05', content: '테스트 시나리오 작성 지원\n- 기능별 테스트 시나리오 초안', hours: 7, progress: 65 },
    { date: '2026-02-06', content: '사용자 매뉴얼 초안 작성\n- 주요 기능별 사용법', hours: 8, progress: 70 },
  ];
  for (const log of parkFebP1T5) {
    febWorkLogs.push({ taskId: p1_task5.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 2월 업무일지 일괄 생성
  for (const logData of febWorkLogs) {
    await prisma.workLog.create({ data: logData });
  }
  console.log(`✅ 2월 업무일지 ${febWorkLogs.length}건 생성 완료`);

  // ============================================================
  // 8. 2월 일정 (Schedules) 생성
  // ============================================================
  const allMembers = [kim, lee, jung, park, choi];

  // 주간 스크럼 (월~금 반복)
  const scrum = await prisma.schedule.create({
    data: {
      projectId: project1.id,
      title: '주간 스크럼',
      description: '매일 아침 스크럼 미팅 - 진행상황 공유 및 이슈 논의',
      scheduleType: 'SCRUM',
      startDate: new Date('2026-02-03T09:00:00'),
      endDate: new Date('2026-02-03T09:30:00'),
      location: '회의실A',
      isAllDay: false,
      teamScope: 'ALL',
      isRecurring: true,
      recurrenceType: 'WEEKLY',
      recurrenceDaysOfWeek: JSON.stringify(['MON','TUE','WED','THU','FRI']),
      recurrenceEndDate: new Date('2026-02-28T09:30:00'),
      createdBy: kim.id,
    },
  });
  for (const member of allMembers) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: scrum.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // ERP 기획 리뷰
  const meeting1 = await prisma.schedule.create({
    data: {
      projectId: project1.id,
      title: 'ERP 기획 리뷰',
      description: 'ERP 시스템 요구사항 및 기획 방향 리뷰 미팅',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-03T14:00:00'),
      endDate: new Date('2026-02-03T15:30:00'),
      location: '회의실A',
      isAllDay: false,
      teamScope: 'PLANNING',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, park, lee]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: meeting1.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 디자인 시안 검토
  const meeting2 = await prisma.schedule.create({
    data: {
      projectId: project1.id,
      title: '디자인 시안 검토',
      description: 'UI/UX 디자인 시안 검토 및 피드백',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-04T10:00:00'),
      endDate: new Date('2026-02-04T11:00:00'),
      location: '회의실B',
      isAllDay: false,
      teamScope: 'DESIGN',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, choi]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: meeting2.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 앱 기획 미팅
  const meeting3 = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '파리바게트 앱 기획 미팅',
      description: '파리바게트 앱 주문 기능 기획 방향 논의',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-05T15:00:00'),
      endDate: new Date('2026-02-05T16:30:00'),
      location: '회의실A',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, lee]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: meeting3.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // API 설계 협의
  const meeting4 = await prisma.schedule.create({
    data: {
      projectId: project1.id,
      title: 'API 설계 협의',
      description: 'RESTful API 설계 및 엔드포인트 구조 협의',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-06T11:00:00'),
      endDate: new Date('2026-02-06T12:00:00'),
      location: '온라인 (Zoom)',
      isAllDay: false,
      teamScope: 'BACKEND',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, lee]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: meeting4.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 주간 회고
  const meeting5 = await prisma.schedule.create({
    data: {
      projectId: project1.id,
      title: '주간 회고',
      description: '금주 진행 사항 회고 및 차주 계획 수립',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-07T16:00:00'),
      endDate: new Date('2026-02-07T17:00:00'),
      location: '회의실A',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of allMembers) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: meeting5.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 정서영 오전반차
  const halfDay = await prisma.schedule.create({
    data: {
      scheduleType: 'HALF_DAY',
      startDate: new Date('2026-02-05T00:00:00'),
      endDate: new Date('2026-02-05T12:00:00'),
      isAllDay: false,
      halfDayType: 'AM',
      usageDate: new Date('2026-02-05'),
      createdBy: jung.id,
    },
  });
  await prisma.scheduleParticipant.create({
    data: { scheduleId: halfDay.id, userId: jung.id, status: 'ACCEPTED' },
  });

  // 박기호 연차
  const vacation = await prisma.schedule.create({
    data: {
      scheduleType: 'VACATION',
      startDate: new Date('2026-02-07T00:00:00'),
      endDate: new Date('2026-02-07T23:59:59'),
      isAllDay: true,
      usageDate: new Date('2026-02-07'),
      createdBy: park.id,
    },
  });
  await prisma.scheduleParticipant.create({
    data: { scheduleId: vacation.id, userId: park.id, status: 'ACCEPTED' },
  });

  // 외부 세미나 참석
  const seminar = await prisma.schedule.create({
    data: {
      title: '외부 세미나 참석',
      description: '프론트엔드 기술 세미나 (코엑스)',
      scheduleType: 'OTHER',
      startDate: new Date('2026-02-04T13:00:00'),
      endDate: new Date('2026-02-04T17:00:00'),
      location: '코엑스 컨퍼런스홀',
      isAllDay: false,
      createdBy: lee.id,
    },
  });
  for (const member of [lee, choi]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: seminar.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // ============================================================
  // 모바일 앱 리뉴얼 (project2) 2월 일정
  // ============================================================

  // 모바일 앱 주간 스크럼 (매주 월/수/금)
  const p2Scrum = await prisma.schedule.create({
    data: {
      projectId: project2.id,
      title: '모바일 앱 스크럼',
      description: '모바일 앱 리뉴얼 프로젝트 스크럼 - 진행상황 공유',
      scheduleType: 'SCRUM',
      startDate: new Date('2026-02-02T10:00:00'),
      endDate: new Date('2026-02-02T10:30:00'),
      location: '회의실B',
      isAllDay: false,
      teamScope: 'ALL',
      isRecurring: true,
      recurrenceType: 'WEEKLY',
      recurrenceDaysOfWeek: JSON.stringify(['MON','WED','FRI']),
      recurrenceEndDate: new Date('2026-02-28T10:30:00'),
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, lee, park]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p2Scrum.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 모바일 앱 UI 리뷰
  const p2UiReview = await prisma.schedule.create({
    data: {
      projectId: project2.id,
      title: '모바일 앱 UI 리뷰',
      description: '모바일 앱 디자인 시안 최종 리뷰 및 수정사항 확정',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-03T14:00:00'),
      endDate: new Date('2026-02-03T15:30:00'),
      location: '회의실B',
      isAllDay: false,
      teamScope: 'DESIGN',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, park]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p2UiReview.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 모바일 앱 클라이언트 중간보고
  const p2ClientReport = await prisma.schedule.create({
    data: {
      projectId: project2.id,
      title: '모바일 앱 중간보고',
      description: '모바일 앱 리뉴얼 프로젝트 클라이언트 중간보고\n- 디자인 시안 공유\n- 개발 진행현황 보고',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-10T14:00:00'),
      endDate: new Date('2026-02-10T16:00:00'),
      location: '본사 대회의실',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, lee, park]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p2ClientReport.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 모바일 앱 백엔드 API 설계 회의
  const p2ApiMeeting = await prisma.schedule.create({
    data: {
      projectId: project2.id,
      title: '모바일 API 설계 회의',
      description: '모바일 앱 로그인/결제 API 엔드포인트 구조 협의',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-06T14:00:00'),
      endDate: new Date('2026-02-06T15:30:00'),
      location: '온라인 (Zoom)',
      isAllDay: false,
      teamScope: 'BACKEND',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, lee]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p2ApiMeeting.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 모바일 앱 사용성 테스트
  const p2UsabilityTest = await prisma.schedule.create({
    data: {
      projectId: project2.id,
      title: '모바일 앱 사용성 테스트',
      description: '프로토타입 기반 사용성 테스트 진행\n- 외부 사용자 5명 참여\n- 태스크 완료율 및 만족도 측정',
      scheduleType: 'OTHER',
      startDate: new Date('2026-02-13T10:00:00'),
      endDate: new Date('2026-02-13T17:00:00'),
      location: 'UX 랩',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, park]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p2UsabilityTest.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 모바일 앱 결제 모듈 QA 회의
  const p2PaymentQa = await prisma.schedule.create({
    data: {
      projectId: project2.id,
      title: '결제 모듈 QA 회의',
      description: '결제 연동 이슈 대응 및 QA 결과 리뷰',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-17T11:00:00'),
      endDate: new Date('2026-02-17T12:00:00'),
      location: '회의실B',
      isAllDay: false,
      teamScope: 'BACKEND',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, lee]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p2PaymentQa.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 모바일 앱 성능 최적화 워크숍
  const p2PerfWorkshop = await prisma.schedule.create({
    data: {
      projectId: project2.id,
      title: '앱 성능 최적화 워크숍',
      description: '모바일 앱 로딩 속도 및 메모리 최적화 방안 논의',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-20T14:00:00'),
      endDate: new Date('2026-02-20T16:00:00'),
      location: '회의실A',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, lee, park]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p2PerfWorkshop.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 모바일 앱 2월 스프린트 회고
  const p2Retro = await prisma.schedule.create({
    data: {
      projectId: project2.id,
      title: '2월 스프린트 회고',
      description: '2월 스프린트 회고\n- Keep/Problem/Try 정리\n- 3월 스프린트 목표 수립',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-27T16:00:00'),
      endDate: new Date('2026-02-27T17:30:00'),
      location: '회의실B',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, lee, park]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p2Retro.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // ============================================================
  // 파리바게트 앱 구축 (project3) 2월 일정
  // ============================================================

  // 파리바게트 주간 스크럼 (매주 화/목)
  const p3Scrum = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '파리바게트 스크럼',
      description: '파리바게트 앱 구축 프로젝트 스크럼 미팅',
      scheduleType: 'SCRUM',
      startDate: new Date('2026-02-03T09:30:00'),
      endDate: new Date('2026-02-03T10:00:00'),
      location: '회의실C',
      isAllDay: false,
      teamScope: 'ALL',
      isRecurring: true,
      recurrenceType: 'WEEKLY',
      recurrenceDaysOfWeek: JSON.stringify(['TUE','THU']),
      recurrenceEndDate: new Date('2026-02-28T10:00:00'),
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, lee, park, choi]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3Scrum.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 클라이언트 킥오프 (2차)
  const p3Kickoff = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '파리바게트 2차 킥오프',
      description: '파리바게트 앱 구축 2차 킥오프 미팅\n- 주문 기능 범위 확정\n- 2월 마일스톤 공유',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-04T14:00:00'),
      endDate: new Date('2026-02-04T16:00:00'),
      location: '파리바게트 본사 회의실',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, lee, park]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3Kickoff.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 주문 기능 기획 회의
  const p3OrderMeeting = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '주문 기능 기획 회의',
      description: '사전주문/픽업 기능 상세 기획 리뷰\n- 메뉴 카테고리 구조\n- 주문 플로우 확정',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-06T10:00:00'),
      endDate: new Date('2026-02-06T11:30:00'),
      location: '회의실C',
      isAllDay: false,
      teamScope: 'PLANNING',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, park]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3OrderMeeting.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 매장 방문 조사
  const p3StoreVisit = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '파리바게트 매장 방문 조사',
      description: '주문/픽업 프로세스 현장 조사\n- 강남역점, 역삼점 방문\n- 매장 오퍼레이션 파악',
      scheduleType: 'OTHER',
      startDate: new Date('2026-02-07T10:00:00'),
      endDate: new Date('2026-02-07T17:00:00'),
      location: '파리바게트 강남역점',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, choi]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3StoreVisit.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 디자인 리뷰
  const p3DesignReview = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '파리바게트 앱 디자인 리뷰',
      description: '멤버십/매장찾기 화면 디자인 시안 리뷰\n- 클라이언트 CI 가이드 반영 확인',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-11T14:00:00'),
      endDate: new Date('2026-02-11T15:30:00'),
      location: '회의실C',
      isAllDay: false,
      teamScope: 'DESIGN',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, choi]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3DesignReview.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 PG사 결제 연동 미팅
  const p3PgMeeting = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: 'PG사 결제 연동 미팅',
      description: 'KG이니시스 결제 모듈 연동 기술 미팅\n- API 스펙 공유\n- 테스트 환경 세팅',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-12T10:00:00'),
      endDate: new Date('2026-02-12T11:30:00'),
      location: '온라인 (Teams)',
      isAllDay: false,
      teamScope: 'BACKEND',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, lee]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3PgMeeting.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 멤버십 기획 워크숍
  const p3MembershipWorkshop = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '멤버십 기획 워크숍',
      description: '포인트/쿠폰/등급 체계 기획 워크숍\n- 타사 멤버십 벤치마킹 결과 공유\n- 적립/사용 정책 확정',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-13T14:00:00'),
      endDate: new Date('2026-02-13T17:00:00'),
      location: '회의실A',
      isAllDay: false,
      teamScope: 'PLANNING',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, park, jung]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3MembershipWorkshop.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 클라이언트 중간보고
  const p3ClientReport = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '파리바게트 2월 중간보고',
      description: '파리바게트 앱 구축 프로젝트 2월 중간보고\n- 주문 기능 기획 진행현황\n- 디자인 시안 공유\n- 매장찾기 QA 결과',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-18T14:00:00'),
      endDate: new Date('2026-02-18T16:00:00'),
      location: '파리바게트 본사 회의실',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, lee, park, choi]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3ClientReport.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 푸시 알림 기능 협의
  const p3PushMeeting = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '푸시 알림 기능 협의',
      description: '마케팅 푸시 알림 시나리오 정의\n- FCM 연동 방안\n- 알림 유형별 우선순위',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-19T10:00:00'),
      endDate: new Date('2026-02-19T11:00:00'),
      location: '회의실C',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, lee]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3PushMeeting.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 백엔드 아키텍처 회의
  const p3BackendArch = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '백엔드 아키텍처 회의',
      description: '파리바게트 앱 백엔드 아키텍처 설계\n- 주문 도메인 모델 설계\n- 매장 재고 연동 방안',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-24T10:00:00'),
      endDate: new Date('2026-02-24T12:00:00'),
      location: '회의실C',
      isAllDay: false,
      teamScope: 'BACKEND',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, lee]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3BackendArch.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 파리바게트 2월 스프린트 회고
  const p3Retro = await prisma.schedule.create({
    data: {
      projectId: project3.id,
      title: '파리바게트 2월 회고',
      description: '2월 진행 사항 회고 및 3월 계획 수립\n- 주문 기능 기획 완료 목표\n- 디자인/개발 일정 조율',
      scheduleType: 'MEETING',
      startDate: new Date('2026-02-26T16:00:00'),
      endDate: new Date('2026-02-26T17:30:00'),
      location: '회의실C',
      isAllDay: false,
      teamScope: 'ALL',
      createdBy: kim.id,
    },
  });
  for (const member of [kim, jung, lee, park, choi]) {
    await prisma.scheduleParticipant.create({
      data: { scheduleId: p3Retro.id, userId: member.id, status: 'ACCEPTED' },
    });
  }

  // 최승민 오후반차
  const choiHalfDay = await prisma.schedule.create({
    data: {
      scheduleType: 'HALF_DAY',
      startDate: new Date('2026-02-11T12:00:00'),
      endDate: new Date('2026-02-11T23:59:59'),
      isAllDay: false,
      halfDayType: 'PM',
      usageDate: new Date('2026-02-11'),
      createdBy: choi.id,
    },
  });
  await prisma.scheduleParticipant.create({
    data: { scheduleId: choiHalfDay.id, userId: choi.id, status: 'ACCEPTED' },
  });

  // 이남규 연차
  const leeVacation = await prisma.schedule.create({
    data: {
      scheduleType: 'VACATION',
      startDate: new Date('2026-02-20T00:00:00'),
      endDate: new Date('2026-02-20T23:59:59'),
      isAllDay: true,
      usageDate: new Date('2026-02-20'),
      createdBy: lee.id,
    },
  });
  await prisma.scheduleParticipant.create({
    data: { scheduleId: leeVacation.id, userId: lee.id, status: 'ACCEPTED' },
  });

  console.log('✅ 2월 일정 22건 생성 완료 (기존 8건 + 추가 14건)');
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
