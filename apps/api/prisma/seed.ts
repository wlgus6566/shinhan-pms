import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 1. 슈퍼 관리자 계정 생성
  const adminPasswordHash = await bcrypt.hash('2motion!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@emotion.co.kr' },
    update: { role: 'SUPER_ADMIN', department: '경영전략본부' },
    create: {
      email: 'admin@emotion.co.kr',
      passwordHash: adminPasswordHash,
      name: '시스템 관리자',
      department: '경영전략본부',
      role: 'SUPER_ADMIN',
      createdBy: BigInt(1),
    },
  });
  console.log('✅ 슈퍼 관리자 계정 생성 완료:', admin.email);

  // 2. 다른 테스트 계정 생성
  const userPasswordHash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'kim@emotion.co.kr' },
    update: { role: 'PM', department: '기획본부1' },
    create: {
      email: 'kim@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '김철수',
      department: '기획본부1',
      role: 'PM',
      createdBy: admin.id,
    },
  });

  const lee = await prisma.user.upsert({
    where: { email: 'lee@emotion.co.kr' },
    update: { role: 'MEMBER', department: '개발본부1' },
    create: {
      email: 'lee@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '이영희',
      department: '개발본부1',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  const park = await prisma.user.upsert({
    where: { email: 'park@emotion.co.kr' },
    update: { role: 'MEMBER', department: '기획본부1' },
    create: {
      email: 'park@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '박민수',
      department: '기획본부1',
      role: 'MEMBER',
      createdBy: admin.id,
    },
  });

  const choi = await prisma.user.upsert({
    where: { email: 'choi@emotion.co.kr' },
    update: { role: 'MEMBER', department: '디자인본부' },
    create: {
      email: 'choi@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '최수진',
      department: '디자인본부',
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
      description: '사용자 경험 개선을 위한 모바일 앱 UI/UX 개편',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      status: 'ACTIVE',
      createdBy: admin.id,
    },
  });

  console.log('✅ 초기 프로젝트 생성 완료:', project1.projectName, ',', project2.projectName);

  // 4. 프로젝트 멤버 추가
  const kim = await prisma.user.findUnique({ where: { email: 'kim@emotion.co.kr' } });

  // 프로젝트 1 멤버 추가
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
      workArea: 'PLANNING',
      createdBy: admin.id,
    },
  });

  if (kim) {
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
        createdBy: admin.id,
      },
    });
  }

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
      role: 'PA',
      workArea: 'BACKEND',
      createdBy: admin.id,
    },
  });

  // 프로젝트 2 멤버 추가
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
      workArea: 'PLANNING',
      createdBy: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project2.id,
        memberId: park.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      memberId: park.id,
      role: 'PL',
      workArea: 'PLANNING',
      createdBy: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_memberId: {
        projectId: project2.id,
        memberId: choi.id,
      },
    },
    update: {},
    create: {
      projectId: project2.id,
      memberId: choi.id,
      role: 'PA',
      workArea: 'DESIGN',
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
