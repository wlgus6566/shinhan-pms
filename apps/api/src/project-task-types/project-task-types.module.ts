import { Module } from '@nestjs/common';
import { ProjectTaskTypesController } from './project-task-types.controller';
import { ProjectTaskTypesService } from './project-task-types.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectTaskTypesController],
  providers: [ProjectTaskTypesService],
  exports: [ProjectTaskTypesService],
})
export class ProjectTaskTypesModule {}
