import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import type { User } from '@repo/schema';

export class UserResponseDto implements User {
  @ApiProperty({ example: '1' })
  id: string;

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
  lastLoginAt?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T14:20:00Z', required: false })
  updatedAt?: string;

  @Exclude()
  passwordHash: string;

  @Exclude()
  createdBy: bigint;

  @Exclude()
  updatedBy?: bigint;

  constructor(partial: Partial<UserResponseDto> | any) {
    if (partial.id && typeof partial.id === 'bigint') {
      partial.id = partial.id.toString();
    }

    // Convert Date objects to ISO strings
    if (partial.createdAt instanceof Date) {
      partial.createdAt = partial.createdAt.toISOString();
    }
    if (partial.updatedAt instanceof Date) {
      partial.updatedAt = partial.updatedAt.toISOString();
    }
    if (partial.lastLoginAt instanceof Date) {
      partial.lastLoginAt = partial.lastLoginAt.toISOString();
    }

    Object.assign(this, partial);
  }
}
