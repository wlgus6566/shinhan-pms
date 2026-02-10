import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { CommonModule } from './common/common.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectTaskTypesModule } from './project-task-types/project-task-types.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { WorkLogsModule } from './work-logs/work-logs.module';
import { SchedulesModule } from './schedules/schedules.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000,
          limit: 60,
        },
      ],
    }),
    CommonModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ProjectTaskTypesModule,
    TasksModule,
    WorkLogsModule,
    SchedulesModule,
    DashboardModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
