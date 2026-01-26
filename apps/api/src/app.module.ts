import { Module } from '@nestjs/common';

import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { WorkLogsModule } from './work-logs/work-logs.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [CommonModule, PrismaModule, AuthModule, UsersModule, ProjectsModule, TasksModule, WorkLogsModule, SchedulesModule],
})
export class AppModule {}
