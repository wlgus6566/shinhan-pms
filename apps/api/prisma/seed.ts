import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 1. 관리자 계정 생성
  const adminPasswordHash = await bcrypt.hash('2motion!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@emotion.co.kr' },
    update: {},
    create: {
      email: 'admin@emotion.co.kr',
      passwordHash: adminPasswordHash,
      name: '시스템 관리자',
      department: '운영팀',
      role: 'PM',
      createdBy: BigInt(1),
    },
  });
  console.log('✅ 관리자 계정 생성 완료:', admin.email);

  // 2. 다른 테스트 계정 생성
  const userPasswordHash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'kim@emotion.co.kr' },
    update: {},
    create: {
      email: 'kim@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '김철수 PM',
      department: '기획부',
      role: 'PM',
      createdBy: admin.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'lee@emotion.co.kr' },
    update: {},
    create: {
      email: 'lee@emotion.co.kr',
      passwordHash: userPasswordHash,
      name: '이영희 PL',
      department: '개발부',
      role: 'PL',
      createdBy: admin.id,
    },
  });

  // 3. 초기 프로젝트 생성
  const project1 = await prisma.project.upsert({
    where: { projectName: '이모션 차세대 ERP 구축' },
    update: {},
    create: {
      projectName: '이모션 차세대 ERP 구축',
      description: '전사적 자원 관리 시스템 고도화 프로젝트',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'IN_PROGRESS',
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
      status: 'PENDING',
      createdBy: admin.id,
    },
  });

  console.log('✅ 초기 프로젝트 생성 완료:', project1.projectName, ',', project2.projectName);
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
