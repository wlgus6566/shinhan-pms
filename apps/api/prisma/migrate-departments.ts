import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 기존 한글 부서명을 새로운 enum 값으로 마이그레이션하는 스크립트
 */

// 한글 → 영문 enum 매핑
const DEPARTMENT_MAPPING: Record<string, string> = {
  경영전략본부: 'PLANNING_STRATEGY',
  기획본부1: 'PLANNING_1',
  개발본부1: 'DEVELOPMENT_1',
  디자인본부1: 'DIGITAL_1',
  디지인본부1: 'DIGITAL_1', // 오타 대응
  디지털본부1: 'DIGITAL_1', // 오타 대응
  사업본부1: 'BUSINESS_1',
  사업부본1: 'BUSINESS_1', // 오타 대응
  기획본부2: 'PLANNING_2',
  개발본부2: 'DEVELOPMENT_2',
  디자인본부2: 'DIGITAL_2',
  디지털본부2: 'DIGITAL_2', // 오타 대응
  서비스운영본부: 'SERVICE_OPERATION',
  플랫폼운영본부: 'PLATFORM_OPERATION',
  플랫폼전략실: 'PLATFORM_STRATEGY',
  마케팅전략실: 'MARKETING_STRATEGY',
  XC본부: 'XC',
};

async function main() {
  console.log('🔄 Department 마이그레이션 시작...\n');

  // 1. 현재 사용 중인 department 값 확인
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      department: true,
    },
  });

  console.log(`📊 총 ${users.length}명의 사용자 발견\n`);

  // 2. 현재 department 값 통계
  const deptStats = users.reduce(
    (acc, user) => {
      acc[user.department] = (acc[user.department] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log('현재 Department 값:');
  Object.entries(deptStats).forEach(([dept, count]) => {
    const newValue = DEPARTMENT_MAPPING[dept] || '❌ 매핑 없음';
    console.log(`  - ${dept} (${count}명) → ${newValue}`);
  });

  // 3. 매핑되지 않은 값 확인
  const unmappedDepts = Object.keys(deptStats).filter(
    (dept) => !DEPARTMENT_MAPPING[dept],
  );

  if (unmappedDepts.length > 0) {
    console.error('\n❌ 다음 department 값에 대한 매핑이 없습니다:');
    unmappedDepts.forEach((dept) => console.error(`  - ${dept}`));
    console.error('\n스크립트를 종료합니다. 매핑을 추가해주세요.\n');
    process.exit(1);
  }

  // 4. 사용자 확인
  console.log('\n계속 진행하시겠습니까? (Ctrl+C로 취소)');
  console.log('5초 후 자동으로 진행됩니다...\n');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // 5. 마이그레이션 실행
  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    const oldDept = user.department;
    const newDept = DEPARTMENT_MAPPING[oldDept];

    if (!newDept) {
      console.error(`❌ ${user.name} (${user.id}): 매핑 없음 - ${oldDept}`);
      errorCount++;
      continue;
    }

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { department: newDept },
      });

      console.log(`✅ ${user.name} (${user.id}): ${oldDept} → ${newDept}`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${user.name} (${user.id}) 업데이트 실패:`, error);
      errorCount++;
    }
  }

  console.log('\n\n📊 마이그레이션 완료');
  console.log(`✅ 성공: ${successCount}명`);
  console.log(`❌ 실패: ${errorCount}명`);
}

main()
  .catch((e) => {
    console.error('\n❌ 마이그레이션 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
