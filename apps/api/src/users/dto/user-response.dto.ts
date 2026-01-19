import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: bigint;

  @ApiProperty({ example: 'hong.gildong@emotion.co.kr' })
  email: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: 'DEVELOPMENT' })
  department: string;

  @ApiProperty({ example: 'TEAM_MEMBER' })
  position: string;

  @ApiProperty({ example: 'MEMBER' })
  role: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T14:20:00Z', required: false })
  updatedAt?: Date;

  @Exclude()
  passwordHash: string;

  @Exclude()
  createdBy: bigint;

  @Exclude()
  updatedBy?: bigint;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
