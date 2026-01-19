import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 1. 슈퍼 관리자 계정 생성
  const adminPasswordHash = await bcrypt.hash('2motion!', 10);
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
