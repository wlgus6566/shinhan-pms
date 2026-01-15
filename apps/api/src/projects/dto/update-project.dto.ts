import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({
    description: '프로젝트 상태',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'COMPLETED', 'SUSPENDED'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'COMPLETED', 'SUSPENDED'], {
    message: '상태는 ACTIVE, COMPLETED, SUSPENDED 중 하나여야 합니다',
  })
  status?: string;
}
