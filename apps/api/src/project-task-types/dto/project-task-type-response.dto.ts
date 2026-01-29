import type { ProjectTaskType } from '@repo/schema';

export class ProjectTaskTypeResponseDto implements ProjectTaskType {
  id: string;
  projectId: string;
  name: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
}
