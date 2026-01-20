import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({
    description: '진행 상태',
    enum: ['WAITING', 'IN_PROGRESS', 'WORK_COMPLETED', 'OPEN_WAITING', 'OPEN_RESPONDING', 'COMPLETED'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['WAITING', 'IN_PROGRESS', 'WORK_COMPLETED', 'OPEN_WAITING', 'OPEN_RESPONDING', 'COMPLETED'], {
    message: '상태는 WAITING, IN_PROGRESS, WORK_COMPLETED, OPEN_WAITING, OPEN_RESPONDING, COMPLETED 중 하나여야 합니다'
  })
  status?: string;
}
