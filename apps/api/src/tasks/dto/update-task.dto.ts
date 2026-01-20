import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ description: '상태', enum: ['TODO', 'IN_PROGRESS', 'DONE', 'HOLD'], required: false })
  @IsOptional()
  @IsString()
  @IsIn(['TODO', 'IN_PROGRESS', 'DONE', 'HOLD'], { message: '상태는 TODO, IN_PROGRESS, DONE, HOLD 중 하나여야 합니다' })
  status?: string;
}
