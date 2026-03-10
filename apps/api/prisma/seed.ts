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
  await prisma.projectTaskType.deleteMany({});

  // 업무 구분(ProjectTaskType) 생성
  // --- Project 1 ---
  const p1TypePlanning = await prisma.projectTaskType.create({ data: { projectId: project1.id, name: '기획', createdBy: admin.id } });
  const p1TypeDesign = await prisma.projectTaskType.create({ data: { projectId: project1.id, name: '디자인', createdBy: admin.id } });
  const p1TypeDev = await prisma.projectTaskType.create({ data: { projectId: project1.id, name: '개발', createdBy: admin.id } });
  const p1TypeData = await prisma.projectTaskType.create({ data: { projectId: project1.id, name: '데이터', createdBy: admin.id } });
  // --- Project 2 ---
  const p2TypePlanning = await prisma.projectTaskType.create({ data: { projectId: project2.id, name: '기획', createdBy: admin.id } });
  const p2TypeDesign = await prisma.projectTaskType.create({ data: { projectId: project2.id, name: '디자인', createdBy: admin.id } });
  const p2TypeDev = await prisma.projectTaskType.create({ data: { projectId: project2.id, name: '개발', createdBy: admin.id } });
  const p2TypeQA = await prisma.projectTaskType.create({ data: { projectId: project2.id, name: 'QA', createdBy: admin.id } });
  // --- Project 3 ---
  const p3TypePlanning = await prisma.projectTaskType.create({ data: { projectId: project3.id, name: '기획', createdBy: admin.id } });
  const p3TypeDesign = await prisma.projectTaskType.create({ data: { projectId: project3.id, name: '디자인', createdBy: admin.id } });
  const p3TypeDev = await prisma.projectTaskType.create({ data: { projectId: project3.id, name: '개발', createdBy: admin.id } });
  const p3TypeQA = await prisma.projectTaskType.create({ data: { projectId: project3.id, name: 'QA', createdBy: admin.id } });
  console.log('✅ 업무 구분(ProjectTaskType) 생성 완료');

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
      clientName: '홍길동',
      taskTypeId: p1TypePlanning.id,
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
      clientName: '강미래',
      taskTypeId: p1TypeDesign.id,
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
      clientName: '홍길동',
      taskTypeId: p1TypeDev.id,
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
      openDates: { create: [{ openDate: new Date('2026-02-20'), sortOrder: 0 }] },
      clientName: '홍길동',
      taskTypeId: p1TypeData.id,
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
      clientName: '강미래',
      taskTypeId: p1TypePlanning.id,
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
      openDates: { create: [{ openDate: new Date('2026-01-05'), sortOrder: 0 }] },
      clientName: '홍길동',
      taskTypeId: p1TypePlanning.id,
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
      clientName: '강미래',
      taskTypeId: p1TypeData.id,
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
      clientName: '강미래',
      taskTypeId: p2TypePlanning.id,
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
      clientName: '강미래',
      taskTypeId: p2TypeDesign.id,
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
      clientName: '홍길동',
      taskTypeId: p2TypeDev.id,
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
      clientName: '유재석',
      taskTypeId: p2TypePlanning.id,
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
      openDates: { create: [{ openDate: new Date('2026-02-01'), sortOrder: 0 }] },
      clientName: '홍길동',
      taskTypeId: p2TypeDev.id,
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
      openDates: { create: [{ openDate: new Date('2026-01-15'), sortOrder: 0 }] },
      clientName: '유재석',
      taskTypeId: p2TypePlanning.id,
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
      clientName: '이정훈',
      taskTypeId: p3TypePlanning.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: park.id, workArea: 'PLANNING' }] },
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
      openDates: { create: [{ openDate: new Date('2026-02-25'), sortOrder: 0 }] },
      clientName: '한소영',
      taskTypeId: p3TypeQA.id,
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
      openDates: { create: [{ openDate: new Date('2026-03-01'), sortOrder: 0 }] },
      clientName: '이정훈',
      taskTypeId: p3TypeDev.id,
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
      clientName: '이정훈',
      taskTypeId: p3TypeDev.id,
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
      openDates: { create: [{ openDate: new Date('2026-02-05'), sortOrder: 0 }] },
      clientName: '한소영',
      taskTypeId: p3TypeDesign.id,
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
      openDates: { create: [{ openDate: new Date('2025-12-20'), sortOrder: 0 }] },
      clientName: '이정훈',
      taskTypeId: p3TypePlanning.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: park.id, workArea: 'PLANNING' }] },
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
      clientName: '한소영',
      taskTypeId: p3TypeDev.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: park.id, workArea: 'PLANNING' }] },
    },
  });

  // WAITING +1
  const p3_task8 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '앱 푸시 마케팅 자동화 개발',
      description: '마케팅 푸시 알림 자동 발송 시스템 개발 대기',
      difficulty: 'MEDIUM',
      status: 'WAITING',
      startDate: new Date('2026-02-17'),
      endDate: new Date('2026-04-30'),
      clientName: '이정훈',
      taskTypeId: p3TypeDev.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: park.id, workArea: 'PLANNING' }] },
    },
  });

  // IN_PROGRESS +1
  const p3_task9 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '멤버십 포인트 시스템 기획',
      description: '파리바게트 멤버십 포인트 적립/사용/등급 체계 기획',
      difficulty: 'HIGH',
      status: 'IN_PROGRESS',
      startDate: new Date('2026-01-20'),
      endDate: new Date('2026-03-15'),
      clientName: '한소영',
      taskTypeId: p3TypePlanning.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: park.id, workArea: 'PLANNING' }] },
    },
  });

  // WORK_COMPLETED +2
  const p3_task10 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '앱 UI 스타일가이드 제작',
      description: '파리바게트 CI 기반 앱 UI 스타일가이드 제작 완료',
      difficulty: 'MEDIUM',
      status: 'WORK_COMPLETED',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-02-10'),
      openDates: { create: [{ openDate: new Date('2026-02-15'), sortOrder: 0 }] },
      clientName: '한소영',
      taskTypeId: p3TypeDesign.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: jung.id, workArea: 'DESIGN' }] },
    },
  });

  const p3_task11 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '메인 화면 퍼블리싱',
      description: '파리바게트 앱 메인/홈 화면 퍼블리싱 작업 완료',
      difficulty: 'MEDIUM',
      status: 'WORK_COMPLETED',
      startDate: new Date('2026-01-13'),
      endDate: new Date('2026-02-10'),
      openDates: { create: [{ openDate: new Date('2026-02-15'), sortOrder: 0 }] },
      clientName: '이정훈',
      taskTypeId: p3TypeDesign.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: choi.id, workArea: 'DESIGN' }] },
    },
  });

  // TESTING +1
  const p3_task12 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '회원가입/로그인 API 개발',
      description: '소셜 로그인 포함 회원 인증 API 개발 후 테스트 진행 중',
      difficulty: 'HIGH',
      status: 'TESTING',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-02-28'),
      clientName: '이정훈',
      taskTypeId: p3TypeDev.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: lee.id, workArea: 'BACKEND' }] },
    },
  });

  // OPEN_WAITING +1
  const p3_task13 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '매장 찾기 API 개발',
      description: 'GPS 기반 매장 검색 및 매장 상세 정보 API 개발 완료, 오픈 대기',
      difficulty: 'MEDIUM',
      status: 'OPEN_WAITING',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-02-15'),
      openDates: { create: [{ openDate: new Date('2026-02-20'), sortOrder: 0 }] },
      clientName: '한소영',
      taskTypeId: p3TypeDev.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: lee.id, workArea: 'BACKEND' }] },
    },
  });

  // OPEN_RESPONDING +1
  const p3_task14 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '홈 화면 디자인 오픈 대응',
      description: '앱 홈 화면 디자인 오픈 후 사용자 피드백 기반 수정 대응',
      difficulty: 'MEDIUM',
      status: 'OPEN_RESPONDING',
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-02-15'),
      openDates: { create: [{ openDate: new Date('2026-01-25'), sortOrder: 0 }] },
      clientName: '이정훈',
      taskTypeId: p3TypeDesign.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: choi.id, workArea: 'DESIGN' }] },
    },
  });

  // COMPLETED +1
  const p3_task15 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '앱 IA(정보구조) 설계',
      description: '파리바게트 앱 전체 메뉴 구조 및 화면 플로우 설계 완료',
      difficulty: 'MEDIUM',
      status: 'COMPLETED',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2026-01-31'),
      openDates: { create: [{ openDate: new Date('2026-01-20'), sortOrder: 0 }] },
      clientName: '한소영',
      taskTypeId: p3TypePlanning.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: park.id, workArea: 'PLANNING' }] },
    },
  });

  // SUSPENDED +1
  const p3_task16 = await prisma.task.create({
    data: {
      projectId: project3.id,
      taskName: '음성 주문 기능 연구',
      description: '음성 인식 기반 주문 기능 R&D - 기술 검토 후 보류',
      difficulty: 'HIGH',
      status: 'SUSPENDED',
      startDate: new Date('2026-01-20'),
      endDate: new Date('2026-06-30'),
      clientName: '이정훈',
      taskTypeId: p3TypeDev.id,
      createdBy: admin.id,
      assignees: { create: [{ userId: lee.id, workArea: 'BACKEND' }] },
    },
  });

  console.log('✅ 업무 생성 완료 (3개 프로젝트, 29개 업무)');

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

  // ---- 파리바게트 앱 구축 (P3) 1월 업무일지 ----

  // 박기호 - P3 주문 기능 기획 (1월, IN_PROGRESS)
  const parkJanP3T1 = [
    { date: '2026-01-13', content: '파리바게트 앱 주문 기능 리서치 시작\n- 경쟁사 앱(스타벅스, 배민) 주문 플로우 분석', hours: 6, progress: 5 },
    { date: '2026-01-14', content: '파리바게트 현행 주문 프로세스 파악\n- 오프라인 매장 방문 조사 결과 정리', hours: 7, progress: 12 },
    { date: '2026-01-15', content: '주문 기능 요구사항 정의\n- 사전주문/픽업 기능 범위 확정', hours: 8, progress: 20 },
    { date: '2026-01-16', content: '주문 화면 플로우 초안 작성\n- 메뉴 선택→장바구니→결제 흐름 설계', hours: 7, progress: 28 },
    { date: '2026-01-20', content: '클라이언트 미팅 준비 및 주문 기능 방향 정리\n- 파리바게트 운영팀 요구사항 수렴', hours: 6, progress: 35 },
  ];
  for (const log of parkJanP3T1) {
    janWorkLogs.push({ taskId: p3_task1.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - P3 매장 찾기 기능 테스트 (1월, TESTING)
  const choiJanP3T2 = [
    { date: '2026-01-06', content: '매장 찾기 기능 QA 테스트 계획 수립\n- 테스트 항목 목록화', hours: 5, progress: 5 },
    { date: '2026-01-07', content: '테스트 환경 세팅 및 테스트 케이스 작성\n- iOS/Android 디바이스별 테스트 케이스', hours: 7, progress: 12 },
    { date: '2026-01-08', content: 'GPS 기반 매장 검색 기능 테스트 시작\n- 실내/실외 위치 정확도 테스트', hours: 8, progress: 20 },
    { date: '2026-01-09', content: '매장 목록 정렬/필터 기능 테스트\n- 거리순/인기순 정렬 검증', hours: 7, progress: 28 },
    { date: '2026-01-13', content: '매장 상세 정보 표시 테스트\n- 영업시간, 주소, 전화번호 노출 확인', hours: 8, progress: 35 },
    { date: '2026-01-14', content: '지도 연동 기능 테스트\n- 핀 표시, 경로 안내 연동 확인', hours: 7, progress: 42, issues: '일부 매장 좌표 데이터 오류 발견' },
    { date: '2026-01-15', content: '매장 영업시간/재고 표시 테스트\n- 실시간 데이터 갱신 주기 확인', hours: 8, progress: 50 },
    { date: '2026-01-16', content: '크로스 플랫폼 테스트 (iOS/Android)\n- 기기별 UI 깨짐 확인', hours: 7, progress: 57 },
    { date: '2026-01-20', content: '1차 테스트 이슈 리포트 정리\n- 발견 이슈 12건 분류 및 버그 리포트 작성', hours: 8, progress: 65 },
  ];
  for (const log of choiJanP3T2) {
    janWorkLogs.push({ taskId: p3_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // 정서영 - P3 푸시 알림 기능 개발 (1월, OPEN_WAITING)
  const jungJanP3T3 = [
    { date: '2026-01-15', content: '푸시 알림 UI 디자인 시작\n- 알림 유형별 디자인 방향 수립', hours: 5, progress: 10 },
    { date: '2026-01-16', content: '알림 센터 화면 레이아웃 설계\n- 읽음/안읽음 상태 표시 디자인', hours: 7, progress: 25 },
    { date: '2026-01-17', content: '알림 유형별 템플릿 디자인\n- 프로모션/주문상태/이벤트 알림', hours: 6, progress: 40 },
    { date: '2026-01-20', content: '푸시 알림 인터랙션 디자인\n- 스와이프 삭제, 탭 이동 동작 정의', hours: 7, progress: 55 },
  ];
  for (const log of jungJanP3T3) {
    janWorkLogs.push({ taskId: p3_task3.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 정서영 - P3 멤버십 화면 디자인 (1월, OPEN_RESPONDING)
  const jungJanP3T5 = [
    { date: '2026-01-06', content: '멤버십 화면 벤치마킹 리서치\n- 스타벅스, 배민, 쿠팡 멤버십 UI 분석', hours: 5, progress: 8 },
    { date: '2026-01-07', content: '포인트 적립/사용 내역 화면 와이어프레임\n- 리스트 구조 및 필터 UI 설계', hours: 7, progress: 18 },
    { date: '2026-01-08', content: '쿠폰 목록/상세 화면 디자인\n- 쿠폰 카드 레이아웃 및 만료일 표시', hours: 6, progress: 28 },
    { date: '2026-01-09', content: '등급 체계 표시 화면 디자인\n- 등급 진행바, 혜택 목록 UI', hours: 7, progress: 40 },
    { date: '2026-01-13', content: '멤버십 카드 UI 디자인\n- 바코드/QR 표시 영역 설계', hours: 6, progress: 52 },
    { date: '2026-01-14', content: '멤버십 화면 프로토타입 제작\n- Figma 인터랙티브 프로토타입', hours: 8, progress: 65 },
    { date: '2026-01-15', content: '클라이언트 리뷰용 디자인 시안 정리\n- 주요 화면 시안 패키징', hours: 4, progress: 72 },
    { date: '2026-01-16', content: '멤버십 화면 디자인 피드백 반영\n- 등급 UI 색상 변경, 쿠폰 레이아웃 수정', hours: 7, progress: 82 },
    { date: '2026-01-20', content: '멤버십 화면 디자인 최종 확정 및 핸드오프\n- 개발팀 전달 완료', hours: 6, progress: 92 },
  ];
  for (const log of jungJanP3T5) {
    janWorkLogs.push({ taskId: p3_task5.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 박기호 - P3 멤버십 포인트 시스템 기획 (1월, IN_PROGRESS)
  const parkJanP3T9 = [
    { date: '2026-01-20', content: '멤버십 포인트 시스템 벤치마킹 조사 시작\n- 스타벅스/배민/CJ ONE 포인트 정책 분석', hours: 7, progress: 8 },
  ];
  for (const log of parkJanP3T9) {
    janWorkLogs.push({ taskId: p3_task9.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 정서영 - P3 앱 UI 스타일가이드 (1월, WORK_COMPLETED)
  const jungJanP3T10 = [
    { date: '2026-01-06', content: '파리바게트 CI 가이드 분석\n- 앱 디자인 방향 수립', hours: 4, progress: 8 },
    { date: '2026-01-07', content: '컬러 팔레트 정의\n- Primary(#E8590C)/Secondary/Accent 색상 확정', hours: 5, progress: 18 },
    { date: '2026-01-08', content: '타이포그래피 스케일 및 아이콘 세트 정의\n- Pretendard 폰트 스케일 설정', hours: 5, progress: 28 },
    { date: '2026-01-09', content: '버튼/입력폼 등 기본 컴포넌트 스타일 정의\n- 상태별(default/hover/disabled) 스타일', hours: 6, progress: 40 },
    { date: '2026-01-13', content: '카드/리스트/모달 등 복합 컴포넌트 스타일\n- 간격/그림자/모서리 규칙 정의', hours: 6, progress: 52 },
    { date: '2026-01-14', content: '다크모드 컬러 팔레트 정의\n- 라이트/다크 모드 토글 규칙', hours: 5, progress: 62 },
    { date: '2026-01-16', content: '스타일가이드 문서화 시작\n- Figma 컴포넌트 라이브러리 구축', hours: 5, progress: 72 },
    { date: '2026-01-20', content: '스타일가이드 1차 완료 및 팀 리뷰\n- 피드백 수렴 후 수정 계획 수립', hours: 5, progress: 80 },
  ];
  for (const log of jungJanP3T10) {
    janWorkLogs.push({ taskId: p3_task10.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - P3 메인 화면 퍼블리싱 (1월, WORK_COMPLETED)
  const choiJanP3T11 = [
    { date: '2026-01-13', content: '메인 화면 레이아웃 퍼블리싱 시작\n- 스타일가이드 기반 기본 구조 마크업', hours: 7, progress: 10 },
    { date: '2026-01-14', content: '메인 배너 슬라이더 구현\n- Swiper 라이브러리 연동', hours: 8, progress: 22 },
    { date: '2026-01-15', content: '카테고리 메뉴 그리드 구현\n- 빵/케이크/음료/세트 아이콘 그리드', hours: 7, progress: 35 },
    { date: '2026-01-16', content: '추천 상품 목록 컴포넌트 구현\n- 가로 스크롤 상품 카드 리스트', hours: 8, progress: 48 },
    { date: '2026-01-20', content: '하단 네비게이션 바 구현\n- 홈/주문/매장/멤버십/마이 탭 구현', hours: 7, progress: 60 },
  ];
  for (const log of choiJanP3T11) {
    janWorkLogs.push({ taskId: p3_task11.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 이남규 - P3 회원가입/로그인 API (1월, TESTING)
  const leeJanP3T12 = [
    { date: '2026-01-10', content: '회원 DB 스키마 설계 및 API 아키텍처 수립\n- 인증 모듈 구조 설계', hours: 8, progress: 8 },
    { date: '2026-01-13', content: '이메일 회원가입 API 개발\n- 입력값 검증 및 비밀번호 암호화', hours: 7, progress: 18 },
    { date: '2026-01-14', content: '로그인/로그아웃 API 개발\n- JWT 액세스/리프레시 토큰 발급', hours: 8, progress: 30 },
    { date: '2026-01-15', content: '카카오 소셜 로그인 연동 개발\n- OAuth 2.0 플로우 구현', hours: 8, progress: 42 },
    { date: '2026-01-16', content: '네이버/애플 소셜 로그인 연동\n- 플랫폼별 SDK 연동', hours: 7, progress: 55 },
    { date: '2026-01-20', content: '비밀번호 찾기/변경 API 개발\n- 이메일 인증 코드 발송 로직', hours: 8, progress: 65 },
  ];
  for (const log of leeJanP3T12) {
    janWorkLogs.push({ taskId: p3_task12.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 이남규 - P3 매장 찾기 API (1월, OPEN_WAITING)
  const leeJanP3T13 = [
    { date: '2026-01-06', content: '매장 데이터 모델 설계\n- 매장 테이블 구조 및 위치 데이터 인덱싱 전략', hours: 4, progress: 8 },
    { date: '2026-01-07', content: '매장 목록 조회 API 개발\n- 위치 기반 거리순 정렬 (PostGIS 활용)', hours: 6, progress: 20 },
    { date: '2026-01-08', content: '매장 상세 정보 API 개발\n- 영업시간/메뉴/이벤트 정보 조회', hours: 5, progress: 32 },
    { date: '2026-01-09', content: '매장 검색 API 개발\n- 키워드/지역명 기반 검색 구현', hours: 6, progress: 45 },
    { date: '2026-01-13', content: '영업시간/재고 연동 API 개발\n- 외부 POS 시스템 데이터 연동', hours: 5, progress: 58 },
    { date: '2026-01-14', content: '매장 즐겨찾기 API 개발\n- 사용자별 즐겨찾기 CRUD', hours: 4, progress: 68 },
    { date: '2026-01-15', content: 'API 통합 테스트 작성\n- Jest 기반 e2e 테스트 30건', hours: 6, progress: 80 },
    { date: '2026-01-16', content: '매장 찾기 API 성능 최적화\n- 쿼리 인덱싱 및 Redis 캐싱 적용', hours: 5, progress: 90 },
    { date: '2026-01-20', content: 'API 코드 리뷰 및 문서화 완료\n- Swagger 문서 업데이트', hours: 4, progress: 98 },
  ];
  for (const log of leeJanP3T13) {
    janWorkLogs.push({ taskId: p3_task13.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - P3 홈 화면 디자인 오픈 대응 (1월, OPEN_RESPONDING)
  const choiJanP3T14 = [
    { date: '2026-01-06', content: '홈 화면 디자인 시안 작업 시작\n- 메인 비주얼 레이아웃 설계', hours: 5, progress: 8 },
    { date: '2026-01-07', content: '홈 화면 메인 비주얼 디자인\n- 배너/프로모션 영역 디자인', hours: 7, progress: 20 },
    { date: '2026-01-08', content: '카테고리/추천 섹션 디자인\n- 상품 카드 레이아웃', hours: 8, progress: 35 },
    { date: '2026-01-09', content: '프로모션 배너 영역 디자인\n- 슬라이드 배너 애니메이션 정의', hours: 6, progress: 48 },
    { date: '2026-01-13', content: '홈 화면 디자인 완료 및 퍼블리싱 전달\n- Figma 핸드오프 완료', hours: 7, progress: 62 },
    { date: '2026-01-14', content: '퍼블리싱 결과 확인 및 수정 요청\n- 간격/폰트 미세 수정 5건', hours: 5, progress: 72 },
    { date: '2026-01-15', content: '오픈 전 최종 디자인 검수\n- QA 체크리스트 기반 검수', hours: 6, progress: 85 },
    { date: '2026-01-16', content: '홈 화면 오픈 완료\n- 운영 환경 배포 확인', hours: 3, progress: 90 },
    { date: '2026-01-20', content: '오픈 후 사용자 피드백 수집 시작\n- 피드백 분류 및 우선순위 정리', hours: 4, progress: 92 },
  ];
  for (const log of choiJanP3T14) {
    janWorkLogs.push({ taskId: p3_task14.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 박기호 - P3 앱 IA 설계 (1월, COMPLETED)
  const parkJanP3T15 = [
    { date: '2026-01-02', content: 'IA 설계 2차 리뷰\n- 주문/멤버십 플로우 상세 확인', hours: 7, progress: 82 },
    { date: '2026-01-05', content: '화면 흐름도 최종 수정 및 문서화\n- 전체 화면 맵 업데이트', hours: 8, progress: 88 },
    { date: '2026-01-06', content: 'IA 설계 내부 검토 회의\n- PM/디자인팀 피드백 수렴', hours: 6, progress: 92 },
    { date: '2026-01-07', content: '클라이언트 리뷰 피드백 반영\n- 메뉴 구조 일부 변경', hours: 7, progress: 95 },
    { date: '2026-01-08', content: 'IA 설계 문서 최종본 작성\n- 화면 번호 체계 확정', hours: 8, progress: 98 },
    { date: '2026-01-09', content: 'IA 설계 최종 승인 및 배포\n- 전체 팀 공유 완료', hours: 4, progress: 100 },
  ];
  for (const log of parkJanP3T15) {
    janWorkLogs.push({ taskId: p3_task15.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // ---- 1월 추가 업무일지 (Jan 21-30 갭 + 누락 태스크) ----

  // 김진아 - 프로젝트 1 킥오프 준비 완료 (1월 완료)
  const kim_p1_task6_jan = [
    { date: '2026-01-02', content: '킥오프 미팅 최종 준비\n- 발표 자료 리허설\n- 장비 점검 완료', hours: 3, progress: 100 },
  ];
  for (const log of kim_p1_task6_jan) {
    janWorkLogs.push({ taskId: p1_task6.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 김진아 - 프로젝트 2 시장조사 완료 (1월 완료)
  const kim_p2_task6_jan = [
    { date: '2026-01-05', content: '경쟁사 분석 보고서 작성\n- 주요 경쟁사 5개사 기능 비교\n- 시장 점유율 데이터 정리', hours: 4, progress: 92 },
    { date: '2026-01-08', content: '시장조사 최종 보고서 작성\n- 인사이트 도출 및 권고사항 정리', hours: 5, progress: 97 },
    { date: '2026-01-09', content: '시장조사 보고서 최종 검토 및 제출\n- 이해관계자 리뷰 완료', hours: 3, progress: 100 },
  ];
  for (const log of kim_p2_task6_jan) {
    janWorkLogs.push({ taskId: p2_task6.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 김진아 - 프로젝트 1 요구사항 분석 유지보수 (1월 확장)
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

  // 김진아 - 프로젝트 1 인사관리 모듈 기획 (1월 신규)
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

  // 김진아 - 프로젝트 2 모바일 화면 기획 계속 (1월 확장)
  const kim_p2_task1_jan_ext = [
    { date: '2026-01-21', content: '모바일 화면 추가 요구사항 반영\n- 사용자 피드백 기반 개선', hours: 3, progress: 76 },
    { date: '2026-01-23', content: '모바일 화면 플로우 최적화\n- 사용자 경험 개선 포인트 정리', hours: 3, progress: 77 },
    { date: '2026-01-27', content: '모바일 화면 명세서 업데이트\n- 디자인 가이드 추가', hours: 2, progress: 77 },
    { date: '2026-01-30', content: '모바일 기획 문서 최종 검토\n- QA 체크리스트 작성', hours: 3, progress: 78 },
  ];
  for (const log of kim_p2_task1_jan_ext) {
    janWorkLogs.push({ taskId: p2_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 이남규 - 프로젝트 1 API 서버 개발 계속 (1월 확장)
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

  // 이남규 - 프로젝트 2 모바일 로그인 개발 (1월 신규)
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

  // 이남규 - 프로젝트 2 결제 모듈 개발 (1월 신규 - 오픈 임박)
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

  // 이남규 - 프로젝트 3 회원가입 API 계속 (1월 확장)
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

  // 이남규 - 프로젝트 3 매장 찾기 API 최종 마무리 (1월 확장)
  const lee_p3_task13_jan_ext = [
    { date: '2026-01-22', content: '매장 찾기 API 성능 최적화\n- 쿼리 인덱싱 및 캐싱 적용', hours: 4, progress: 98 },
    { date: '2026-01-27', content: '매장 찾기 API 최종 검증\n- 운영 환경 테스트 완료', hours: 3, progress: 99 },
  ];
  for (const log of lee_p3_task13_jan_ext) {
    janWorkLogs.push({ taskId: p3_task13.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 정서영 - 프로젝트 1 UI/UX 디자인 계속 (1월 확장)
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

  // 정서영 - 프로젝트 2 모바일 디자인 시안 계속 (1월 확장)
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

  // 정서영 - 프로젝트 3 푸시 알림 계속 (1월 확장)
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

  // 정서영 - 프로젝트 3 멤버십 화면 마무리 (1월 확장)
  const jung_p3_task5_jan_ext = [
    { date: '2026-01-22', content: '멤버십 화면 마이너 수정\n- 포인트 표시 개선', hours: 2, progress: 92 },
    { date: '2026-01-27', content: '멤버십 화면 최종 검토\n- QA 피드백 반영 완료', hours: 2, progress: 93 },
  ];
  for (const log of jung_p3_task5_jan_ext) {
    janWorkLogs.push({ taskId: p3_task5.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 정서영 - 프로젝트 3 스타일가이드 계속 (1월 확장)
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

  // 박기호 - 프로젝트 1 인사관리 모듈 기획 (1월 신규)
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

  // 박기호 - 프로젝트 3 주문 기능 기획 계속 (1월 확장)
  const park_p3_task1_jan_ext = [
    { date: '2026-01-21', content: '주문 옵션 선택 화면 기획\n- 사이즈/색상 선택 UI 정의', hours: 4, progress: 36 },
    { date: '2026-01-23', content: '주문 결제 화면 기획\n- 결제 수단 선택 및 입력 필드', hours: 3, progress: 37 },
    { date: '2026-01-27', content: '주문 완료 화면 기획\n- 주문 확인 및 배송 정보 표시', hours: 3, progress: 37 },
    { date: '2026-01-30', content: '주문 기획서 최종 검토\n- 내부 리뷰 의견 반영', hours: 3, progress: 38 },
  ];
  for (const log of park_p3_task1_jan_ext) {
    janWorkLogs.push({ taskId: p3_task1.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 박기호 - 프로젝트 3 멤버십 포인트 계속 (1월 확장)
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

  // 최승민 - 프로젝트 1 UI/UX 디자인 퍼블리싱 (1월 신규)
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

  // 최승민 - 프로젝트 3 매장 찾기 테스트 계속 (1월 확장)
  const choi_p3_task2_jan_ext = [
    { date: '2026-01-21', content: '매장 찾기 추가 시나리오 테스트\n- 권한별 접근 테스트', hours: 3, progress: 67 },
    { date: '2026-01-23', content: '매장 찾기 성능 테스트\n- 대용량 데이터 조회 성능 확인', hours: 3, progress: 68 },
    { date: '2026-01-27', content: '매장 찾기 버그 리포팅\n- 발견된 이슈 정리 및 전달', hours: 2, progress: 69 },
    { date: '2026-01-30', content: '매장 찾기 재테스트\n- 버그 수정 사항 검증', hours: 3, progress: 70 },
  ];
  for (const log of choi_p3_task2_jan_ext) {
    janWorkLogs.push({ taskId: p3_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - 프로젝트 3 메인 화면 퍼블리싱 계속 (1월 확장)
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

  // 최승민 - 프로젝트 3 홈 화면 오픈 대응 마무리 (1월 확장)
  const choi_p3_task14_jan_ext = [
    { date: '2026-01-22', content: '홈 화면 오픈 후 모니터링\n- 사용자 피드백 수집', hours: 2, progress: 92 },
    { date: '2026-01-26', content: '홈 화면 마이너 이슈 수정\n- 긴급 패치 적용', hours: 2, progress: 92 },
    { date: '2026-01-29', content: '홈 화면 안정화 확인\n- 최종 모니터링 및 보고', hours: 2, progress: 93 },
  ];
  for (const log of choi_p3_task14_jan_ext) {
    janWorkLogs.push({ taskId: p3_task14.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
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

  // 박기호 - P3 주문 기능 기획 (2월, IN_PROGRESS)
  const parkFebP3T1 = [
    { date: '2026-02-02', content: '주문 기능 요구사항 정리 및 우선순위 분류\n- MoSCoW 기법으로 기능 우선순위 정의\n- 1차 스프린트 범위 확정', hours: 5, progress: 38 },
    { date: '2026-02-03', content: '파리바게트 주문 프로세스 상세 분석\n- 현행 오프라인 주문 플로우 조사\n- 경쟁사 앱 사전주문 기능 분석', hours: 5, progress: 42 },
    { date: '2026-02-04', content: '사전주문 기능 정의\n- 메뉴 선택 → 매장 선택 → 픽업 시간 선택 플로우\n- 주문 가능 시간대 정책 정의', hours: 6, progress: 48 },
    { date: '2026-02-05', content: '메뉴 카테고리 구조 설계\n- 빵류/케이크/음료/세트 분류 체계\n- 메뉴 상세 화면 기획', hours: 5, progress: 53 },
    { date: '2026-02-06', content: '장바구니 기능 기획\n- 수량 변경, 옵션 선택\n- 쿠폰/포인트 적용 로직', hours: 5, progress: 58 },
    { date: '2026-02-09', content: '주문 결제 플로우 기획\n- 결제 수단 (카드/간편결제/포인트)\n- 주문 확인 화면', hours: 5, progress: 63 },
    { date: '2026-02-10', content: '주문 상태 추적 기획\n- 주문접수 → 제조중 → 픽업가능 상태 플로우\n- 실시간 알림 정의', hours: 5, progress: 68, issues: '매장 영업시간 데이터 연동 방식 확인 필요' },
  ];
  for (const log of parkFebP3T1) {
    febWorkLogs.push({ taskId: p3_task1.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
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

  // ---- 파리바게트 앱 구축 (P3) 2월 업무일지 ----

  // 최승민 - P3 매장 찾기 기능 테스트 (2월, TESTING)
  const choiFebP3T2 = [
    { date: '2026-02-02', content: '매장 찾기 기능 2차 테스트 시작\n- 1차 이슈 수정 확인 테스트\n- 좌표 데이터 오류 수정 검증', hours: 7, progress: 70 },
    { date: '2026-02-03', content: '위치 권한 및 GPS 정확도 테스트\n- 실내/실외 GPS 수신율 비교\n- 권한 거부 시 대체 플로우 확인', hours: 8, progress: 75 },
    { date: '2026-02-04', content: '매장 상세 정보 로딩 속도 테스트\n- 매장 200개 이상 목록 로딩 성능\n- 이미지 로딩 최적화 확인', hours: 7, progress: 78 },
    { date: '2026-02-05', content: '지도 줌인/줌아웃 시 매장 핀 표시 테스트\n- 클러스터링 동작 확인\n- 핀 탭 인터랙션 검증', hours: 8, progress: 82 },
    { date: '2026-02-06', content: '매장 즐겨찾기 기능 테스트\n- 즐겨찾기 추가/삭제 동작\n- 오프라인 모드 동기화 확인', hours: 7, progress: 85, issues: '즐겨찾기 동기화 지연 이슈 발견 - 3초 이상 소요' },
    { date: '2026-02-09', content: '테스트 결과 보고서 작성\n- 전체 테스트 항목 42건 결과 정리\n- 잔여 이슈 5건 분류', hours: 8, progress: 90 },
    { date: '2026-02-10', content: '잔여 이슈 재테스트 및 최종 리포트\n- Critical 이슈 0건 확인\n- Minor 이슈 3건 개발팀 전달', hours: 7, progress: 93 },
  ];
  for (const log of choiFebP3T2) {
    febWorkLogs.push({ taskId: p3_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // 정서영 - P3 푸시 알림 기능 개발 (2월, OPEN_WAITING)
  const jungFebP3T3 = [
    { date: '2026-02-02', content: '푸시 알림 UI 개발 결과 디자인 QA\n- 알림 목록 화면 레이아웃 검수\n- 읽음/안읽음 상태 표시 확인', hours: 6, progress: 62 },
    { date: '2026-02-03', content: '알림 수신 시 뱃지 표시 UI 검수\n- iOS/Android 뱃지 카운트 동작 확인\n- 알림 팝업 디자인 검증', hours: 7, progress: 70 },
    { date: '2026-02-04', content: '알림 설정 화면 디자인 보완\n- 알림 유형별 on/off 토글 UI\n- 야간 수신 설정 화면 추가', hours: 5, progress: 76 },
    { date: '2026-02-05', content: 'FCM 연동 테스트 및 알림 표시 확인\n- 프로모션/주문/이벤트 알림별 테스트\n- 알림 딥링크 동작 확인', hours: 7, progress: 83 },
    { date: '2026-02-06', content: '푸시 알림 기능 최종 디자인 검수 완료\n- 전체 알림 시나리오 Walk-through\n- 개발팀 최종 수정 요청 3건', hours: 6, progress: 90 },
    { date: '2026-02-09', content: '오픈 전 최종 점검\n- 알림 유형별 수신 테스트 완료\n- 알림 센터 UI 최종 확인', hours: 5, progress: 96 },
    { date: '2026-02-10', content: '푸시 알림 기능 개발 완료 확인\n- 전체 기능 검수 완료\n- 오픈 대기 전환 승인', hours: 4, progress: 100 },
  ];
  for (const log of jungFebP3T3) {
    febWorkLogs.push({ taskId: p3_task3.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 정서영 - P3 멤버십 화면 디자인 (2월, OPEN_RESPONDING)
  const jungFebP3T5 = [
    { date: '2026-02-02', content: '멤버십 화면 오픈 후 사용자 피드백 분석\n- 고객센터 접수 피드백 15건 분류\n- 개선 우선순위 선정', hours: 4, progress: 93 },
    { date: '2026-02-03', content: '포인트 내역 화면 가독성 개선 디자인\n- 글씨 크기 확대, 적립/사용 색상 구분 강화', hours: 5, progress: 94 },
    { date: '2026-02-04', content: '쿠폰 만료 알림 UI 수정\n- 만료 임박 쿠폰 뱃지 추가\n- D-day 카운트 표시', hours: 4, progress: 95 },
    { date: '2026-02-05', content: '등급 진행바 표시 오류 수정 디자인\n- 진행률 계산 표시 개선\n- 다음 등급까지 남은 금액 표시', hours: 3, progress: 96 },
    { date: '2026-02-09', content: '멤버십 카드 디자인 미세 조정\n- 바코드 영역 밝기 개선\n- 카드 이미지 해상도 최적화', hours: 4, progress: 97 },
    { date: '2026-02-10', content: '사용자 피드백 기반 추가 수정 대응\n- 쿠폰 사용처 표시 추가\n- 등급 혜택 안내 팝업 디자인', hours: 5, progress: 98 },
  ];
  for (const log of jungFebP3T5) {
    febWorkLogs.push({ taskId: p3_task5.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 박기호 - P3 멤버십 포인트 시스템 기획 (2월, IN_PROGRESS)
  const parkFebP3T9 = [
    { date: '2026-02-02', content: '경쟁사 멤버십 프로그램 벤치마킹 완료\n- 스타벅스/배민/CJ ONE 비교표 작성\n- 파리바게트 차별화 포인트 도출', hours: 8, progress: 15 },
    { date: '2026-02-03', content: '포인트 적립 정책 초안 수립\n- 구매금액 대비 적립률 정의 (1%~5%)\n- 이벤트 추가 적립 정책', hours: 7, progress: 22 },
    { date: '2026-02-04', content: '포인트 사용 정책 기획\n- 최소 사용 단위 1,000P\n- 사용 제한 조건 (할인 상품 제외 등)', hours: 8, progress: 30 },
    { date: '2026-02-05', content: '등급 체계 설계\n- 4단계 (일반/실버/골드/VIP)\n- 등급별 혜택 및 승급 조건 정의', hours: 7, progress: 38 },
    { date: '2026-02-06', content: '쿠폰 시스템 기획\n- 쿠폰 유형 (할인/증정/무료배송)\n- 발급/사용/만료 정책', hours: 8, progress: 45, issues: '등급별 할인율 기준 클라이언트 확인 필요' },
    { date: '2026-02-09', content: '이벤트 포인트 기획\n- 출석체크/미션/생일 포인트\n- 시즌 이벤트 포인트 정책', hours: 7, progress: 52 },
    { date: '2026-02-10', content: '멤버십 가입 플로우 기획\n- 본인인증/약관동의 절차\n- 기존 고객 데이터 마이그레이션 방안', hours: 8, progress: 58 },
  ];
  for (const log of parkFebP3T9) {
    febWorkLogs.push({ taskId: p3_task9.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // 정서영 - P3 앱 UI 스타일가이드 (2월, WORK_COMPLETED)
  const jungFebP3T10 = [
    { date: '2026-02-02', content: '스타일가이드 피드백 반영\n- 컬러 팔레트 미세 조정 (#E8590C → #E85A0C)\n- 보조 색상 대비 개선', hours: 5, progress: 85 },
    { date: '2026-02-03', content: '반응형 브레이크포인트 가이드 추가\n- 모바일/태블릿/데스크탑 기준점\n- 그리드 시스템 정의', hours: 6, progress: 88 },
    { date: '2026-02-04', content: '애니메이션/트랜지션 가이드 추가\n- 페이지 전환 효과 정의\n- 마이크로 인터랙션 규칙', hours: 5, progress: 91 },
    { date: '2026-02-05', content: '접근성 가이드라인 추가\n- WCAG 2.1 기준 색상 대비\n- 스크린리더 대응 규칙', hours: 6, progress: 94 },
    { date: '2026-02-06', content: '스타일가이드 내부 최종 리뷰\n- 디자인팀/개발팀 합동 리뷰\n- 수정 사항 3건 반영', hours: 4, progress: 96 },
    { date: '2026-02-09', content: '클라이언트 피드백 최종 반영\n- 브랜드 로고 사용 규칙 보완\n- 서브 브랜드 컬러 추가', hours: 5, progress: 98 },
    { date: '2026-02-10', content: '앱 UI 스타일가이드 최종 완료 및 배포\n- Figma 라이브러리 퍼블리시\n- 개발팀 가이드 문서 전달', hours: 4, progress: 100 },
  ];
  for (const log of jungFebP3T10) {
    febWorkLogs.push({ taskId: p3_task10.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - P3 메인 화면 퍼블리싱 (2월, WORK_COMPLETED)
  const choiFebP3T11 = [
    { date: '2026-02-02', content: '이벤트 배너 영역 퍼블리싱\n- 자동 슬라이드 기능 구현\n- 배너 인디케이터 UI', hours: 8, progress: 68 },
    { date: '2026-02-03', content: '빠른 주문 바로가기 섹션 구현\n- 최근 주문 메뉴 표시\n- 원탭 재주문 버튼', hours: 7, progress: 75 },
    { date: '2026-02-04', content: '실시간 인기 메뉴 목록 구현\n- 랭킹 뱃지 표시\n- 실시간 업데이트 로직', hours: 8, progress: 82 },
    { date: '2026-02-05', content: '반응형 레이아웃 테스트 및 수정\n- iPhone SE ~ Pro Max 대응\n- Android 다양한 해상도 테스트', hours: 7, progress: 88, issues: 'iOS Safari에서 배너 슬라이드 터치 이벤트 이슈' },
    { date: '2026-02-06', content: '크로스 브라우저 테스트\n- iOS Safari/Chrome, Android Chrome\n- 터치 이벤트 이슈 수정', hours: 8, progress: 93 },
    { date: '2026-02-09', content: '최종 디자인 QA 및 수정 완료\n- 스타일가이드 준수 확인\n- 간격/폰트 미세 수정', hours: 7, progress: 100 },
  ];
  for (const log of choiFebP3T11) {
    febWorkLogs.push({ taskId: p3_task11.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // 이남규 - P3 회원가입/로그인 API (2월, TESTING)
  const leeFebP3T12 = [
    { date: '2026-02-02', content: '토큰 갱신 API 개발 및 보안 강화\n- Refresh Token Rotation 구현\n- 토큰 블랙리스트 관리', hours: 8, progress: 72 },
    { date: '2026-02-03', content: '회원 프로필 조회/수정 API 개발\n- 프로필 이미지 업로드 (S3 연동)\n- 닉네임 중복 체크', hours: 7, progress: 78 },
    { date: '2026-02-04', content: 'API 통합 테스트 작성\n- 회원가입/로그인 시나리오 e2e 테스트\n- 소셜 로그인 모킹 테스트', hours: 8, progress: 83 },
    { date: '2026-02-05', content: '소셜 로그인 엣지 케이스 처리\n- 이메일 미제공 소셜 계정 처리\n- 중복 이메일 연동 정책 구현', hours: 7, progress: 87 },
    { date: '2026-02-06', content: 'QA팀 테스트 환경 배포 및 가이드\n- Staging 서버 배포\n- API 테스트 가이드 문서 작성', hours: 8, progress: 90, issues: '카카오 로그인 콜백 URL 설정 이슈 - 도메인 화이트리스트 필요' },
    { date: '2026-02-09', content: 'QA 1차 이슈 수정\n- 토큰 만료 후 자동 갱신 오류 수정\n- 로그아웃 시 세션 정리 로직 보완', hours: 7, progress: 93 },
    { date: '2026-02-10', content: 'QA 테스트 지원 및 추가 이슈 대응\n- 비밀번호 규칙 에러 메시지 개선\n- 소셜 로그인 실패 시 안내 화면 추가', hours: 8, progress: 95 },
  ];
  for (const log of leeFebP3T12) {
    febWorkLogs.push({ taskId: p3_task12.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // 이남규 - P3 매장 찾기 API (2월, OPEN_WAITING)
  const leeFebP3T13 = [
    { date: '2026-02-02', content: '매장 찾기 API 최종 성능 테스트\n- 동시 접속 1,000명 부하 테스트\n- 응답 시간 200ms 이내 확인', hours: 4, progress: 99 },
    { date: '2026-02-03', content: 'API 문서 최종 정리 및 프론트엔드 연동 가이드\n- Swagger 문서 최종 업데이트\n- 프론트엔드 개발자 인수인계 완료', hours: 3, progress: 100 },
  ];
  for (const log of leeFebP3T13) {
    febWorkLogs.push({ taskId: p3_task13.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - P3 홈 화면 디자인 오픈 대응 (2월, OPEN_RESPONDING)
  const choiFebP3T14 = [
    { date: '2026-02-02', content: '홈 화면 오픈 후 모니터링\n- 사용자 행동 분석 (히트맵 확인)\n- 주요 이탈 구간 파악', hours: 5, progress: 93 },
    { date: '2026-02-03', content: '배너 클릭률 저조 개선\n- 배너 디자인 A/B 테스트안 제작\n- CTA 버튼 위치/색상 변경', hours: 7, progress: 94 },
    { date: '2026-02-04', content: '카테고리 아이콘 가시성 개선 작업\n- 아이콘 크기 20% 확대\n- 아이콘 하단 텍스트 폰트 조정', hours: 6, progress: 95 },
    { date: '2026-02-05', content: '사용자 피드백 기반 폰트 크기 조정\n- 상품명/가격 폰트 2pt 확대\n- 할인율 강조 색상 변경', hours: 5, progress: 96 },
    { date: '2026-02-06', content: '추천 섹션 레이아웃 변경 디자인\n- 2열 → 1열 레이아웃 변경안\n- 상품 이미지 확대 표시', hours: 7, progress: 97, issues: '추천 섹션 로딩 지연 시 UI 깨짐 이슈 발견' },
    { date: '2026-02-09', content: '수정 디자인 적용 확인 및 추가 피드백 대응\n- A/B 테스트 결과 분석\n- 최종 디자인 확정', hours: 6, progress: 98 },
    { date: '2026-02-10', content: '홈 화면 2차 피드백 수집 및 분석\n- 개선 후 클릭률 15% 상승 확인\n- 추가 개선 포인트 3건 정리', hours: 5, progress: 98 },
  ];
  for (const log of choiFebP3T14) {
    febWorkLogs.push({ taskId: p3_task14.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress, issues: (log as any).issues });
  }

  // ---- 2월 추가 데이터 (Feb 11-12 갭 + 누락 태스크) ----

  // 김진아 - 프로젝트 2 모바일 화면 기획 (2월 추가)
  const kimP2T1Feb2 = [
    { date: '2026-02-11', content: '메인 화면 최종 기획 검토\n- 레이아웃 조정 사항 정리\n- 디자이너 피드백 반영', hours: 4, progress: 91 },
    { date: '2026-02-12', content: '모바일 화면 기획 최종 마무리\n- 개발팀 전달 준비\n- 기획서 최종 검토', hours: 3, progress: 92 },
  ];
  for (const log of kimP2T1Feb2) {
    febWorkLogs.push({ taskId: p2_task1.id, userId: kim.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 이남규 - 프로젝트 1 API 서버 개발 (2월 추가)
  const leeP1T3Feb2 = [
    { date: '2026-02-11', content: 'REST API 엔드포인트 추가 개발\n- 인증 미들웨어 보완\n- 단위 테스트 작성', hours: 6, progress: 62 },
    { date: '2026-02-12', content: 'API 성능 최적화 작업\n- 쿼리 최적화\n- 캐싱 전략 구현', hours: 7, progress: 65 },
  ];
  for (const log of leeP1T3Feb2) {
    febWorkLogs.push({ taskId: p1_task3.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 이남규 - 프로젝트 2 모바일 로그인 (2월 추가)
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

  // 이남규 - 프로젝트 2 결제 모듈 연동 (2월 추가)
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

  // 이남규 - 프로젝트 3 회원가입/로그인 API (2월 추가)
  const leeP3T12Feb2 = [
    { date: '2026-02-11', content: '최종 QA 피드백 수정\n- 비밀번호 검증 강화\n- 에러 메시지 개선', hours: 5, progress: 96 },
    { date: '2026-02-12', content: 'API 최종 테스트\n- 통합 테스트 완료\n- 배포 준비', hours: 4, progress: 97 },
  ];
  for (const log of leeP3T12Feb2) {
    febWorkLogs.push({ taskId: p3_task12.id, userId: lee.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 정서영 - 프로젝트 1 UI/UX 디자인 (2월 추가)
  const jungP1T2Feb2 = [
    { date: '2026-02-09', content: '디자인 최종 검토\n- 컬러 시스템 통일\n- 아이콘 일관성 확인', hours: 5, progress: 96 },
    { date: '2026-02-10', content: 'UI 컴포넌트 정리\n- 디자인 가이드 작성\n- 개발팀 전달', hours: 6, progress: 97 },
    { date: '2026-02-11', content: '디자인 시스템 문서화\n- 사용 가이드 작성\n- 예제 화면 정리', hours: 5, progress: 97 },
    { date: '2026-02-12', content: 'UI/UX 디자인 최종 마무리\n- 피드백 반영 완료\n- 최종 산출물 전달', hours: 4, progress: 98 },
  ];
  for (const log of jungP1T2Feb2) {
    febWorkLogs.push({ taskId: p1_task2.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 정서영 - 프로젝트 2 모바일 디자인 시안 (2월 추가)
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

  // 정서영 - 프로젝트 3 멤버십 화면 (2월 추가)
  const jungP3T5Feb2 = [
    { date: '2026-02-11', content: '오픈 후 사용자 피드백 수집\n- UI 개선사항 정리\n- 이슈 우선순위 결정', hours: 4, progress: 98 },
    { date: '2026-02-12', content: '멤버십 화면 개선안 작성\n- 디자인 수정안 전달\n- 다음 스프린트 계획', hours: 3, progress: 99 },
  ];
  for (const log of jungP3T5Feb2) {
    febWorkLogs.push({ taskId: p3_task5.id, userId: jung.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 박기호 - 프로젝트 1 인사관리 기획 (2월 추가)
  const parkP1T5Feb2 = [
    { date: '2026-02-09', content: '인사관리 테스트 지원\n- QA팀 협업\n- 테스트 케이스 검증', hours: 5, progress: 73 },
    { date: '2026-02-10', content: '테스트 피드백 정리\n- 개선사항 문서화\n- 우선순위 조정', hours: 6, progress: 76 },
    { date: '2026-02-11', content: '테스트 이슈 대응\n- 기획 보완사항 정리\n- 개발팀 전달', hours: 5, progress: 78 },
    { date: '2026-02-12', content: '인사관리 최종 검수\n- 테스트 결과 분석\n- 오픈 준비', hours: 4, progress: 80 },
  ];
  for (const log of parkP1T5Feb2) {
    febWorkLogs.push({ taskId: p1_task5.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 박기호 - 프로젝트 3 주문 기능 기획 (2월 추가)
  const parkP3T1Feb2 = [
    { date: '2026-02-11', content: '주문 프로세스 기획 보완\n- 주문 취소/환불 플로우 정리\n- 예외 케이스 정의', hours: 6, progress: 70 },
    { date: '2026-02-12', content: '주문 상태 관리 기획\n- 상태 전이도 작성\n- 알림 시나리오 정리', hours: 5, progress: 72 },
  ];
  for (const log of parkP3T1Feb2) {
    febWorkLogs.push({ taskId: p3_task1.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 박기호 - 프로젝트 3 멤버십 포인트 (2월 추가)
  const parkP3T9Feb2 = [
    { date: '2026-02-11', content: '포인트 적립/차감 규칙 상세화\n- 이벤트별 적립률 정리\n- 유효기간 정책 수립', hours: 6, progress: 60 },
    { date: '2026-02-12', content: '포인트 시스템 기획 진행\n- 등급별 혜택 정의\n- 화면 플로우 작성', hours: 5, progress: 62 },
  ];
  for (const log of parkP3T9Feb2) {
    febWorkLogs.push({ taskId: p3_task9.id, userId: park.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - 프로젝트 1 UI/UX 디자인 퍼블리싱 (2월 추가)
  const choiP1T2Feb2 = [
    { date: '2026-02-09', content: '퍼블리싱 마무리 작업\n- CSS 최적화\n- 브라우저 호환성 테스트', hours: 6, progress: 95 },
    { date: '2026-02-10', content: '반응형 CSS 점검\n- 미디어 쿼리 조정\n- 모바일 레이아웃 검증', hours: 7, progress: 96 },
    { date: '2026-02-11', content: '접근성 개선\n- ARIA 속성 추가\n- 키보드 네비게이션 테스트', hours: 6, progress: 97 },
    { date: '2026-02-12', content: '퍼블리싱 최종 완료\n- 코드 리뷰 반영\n- 최종 산출물 전달', hours: 5, progress: 98 },
  ];
  for (const log of choiP1T2Feb2) {
    febWorkLogs.push({ taskId: p1_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - 프로젝트 3 매장 찾기 테스트 (2월 추가)
  const choiP3T2Feb2 = [
    { date: '2026-02-11', content: '매장 찾기 최종 테스트\n- 지도 API 성능 검증\n- 검색 정확도 테스트', hours: 5, progress: 94 },
    { date: '2026-02-12', content: '테스트 완료 및 리포트 작성\n- 버그 수정 확인\n- 배포 승인 요청', hours: 4, progress: 96 },
  ];
  for (const log of choiP3T2Feb2) {
    febWorkLogs.push({ taskId: p3_task2.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
  }

  // 최승민 - 프로젝트 3 홈 화면 오픈 대응 (2월 추가)
  const choiP3T14Feb2 = [
    { date: '2026-02-11', content: '홈 화면 모니터링 계속\n- 사용자 행동 분석\n- 성능 지표 확인', hours: 3, progress: 98 },
    { date: '2026-02-12', content: '오픈 대응 유지\n- 실시간 이슈 대응\n- 안정화 확인', hours: 3, progress: 99 },
  ];
  for (const log of choiP3T14Feb2) {
    febWorkLogs.push({ taskId: p3_task14.id, userId: choi.id, workDate: new Date(log.date), content: log.content, workHours: log.hours, progress: log.progress });
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
