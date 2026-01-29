import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_TASK_TYPES = [
  { name: '프로젝트성 업무' },
  { name: '신규 / 단건 제작' },
  { name: '운영 / 수정 작업' },
  { name: '관리 업무' },
];

async function main() {
  console.log('Starting task types seed...');

  // 모든 활성 프로젝트 조회
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: {
      taskTypes: true,
      tasks: true,
    },
  });

  console.log(`Found ${projects.length} active projects`);

  for (const project of projects) {
    console.log(`\nProcessing project: ${project.projectName} (ID: ${project.id})`);

    // 이미 업무 구분이 있는 프로젝트는 스킵
    if (project.taskTypes.length > 0) {
      console.log(`  ⏭️  Skipping - already has ${project.taskTypes.length} task types`);
      continue;
    }

    // 기본 업무 구분 생성
    const createdTaskTypes = [];
    for (const taskType of DEFAULT_TASK_TYPES) {
      const created = await prisma.projectTaskType.create({
        data: {
          projectId: project.id,
          name: taskType.name,
          createdBy: project.createdBy,
        },
      });
      createdTaskTypes.push(created);
      console.log(`  ✅ Created task type: ${created.name}`);
    }

    // 기존 업무들에 업무 구분 할당 (골고루 분배)
    const tasks = project.tasks.filter((task) => task.isActive);
    if (tasks.length > 0) {
      console.log(`  📋 Assigning task types to ${tasks.length} tasks...`);

      for (let i = 0; i < tasks.length; i++) {
        const taskTypeIndex = i % createdTaskTypes.length;
        const taskType = createdTaskTypes[taskTypeIndex];

        await prisma.task.update({
          where: { id: tasks[i].id },
          data: { taskTypeId: taskType.id },
        });
      }

      console.log(`  ✅ Assigned task types to all tasks`);
    } else {
      console.log(`  ℹ️  No active tasks to assign`);
    }
  }

  console.log('\n✨ Task types seed completed!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
