import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { parsePaginationParams } from '../common/helpers/pagination.helper';
import type { CreateUserRequest } from '@repo/schema';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserRequest,
    createdBy: bigint,
  ): Promise<UserResponseDto> {
    // 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다');
    }

    // 초기 비밀번호 고정: password123
    const passwordHash = await bcrypt.hash('password123', 10);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        name: createUserDto.name,
        profileImage: createUserDto.profileImage,
        department: createUserDto.department,
        position: createUserDto.position,
        role: createUserDto.role,
        grade: createUserDto.grade,
        requirePasswordChange: true,
        createdBy,
      },
    });

    return new UserResponseDto(user);
  }

  async findAll(filters?: {
    search?: string;
    department?: string;
    role?: string;
    isActive?: boolean;
    pageNum?: number;
    pageSize?: number;
    excludeProject?: string;
  }): Promise<{
    list: UserResponseDto[];
    totalCount: number;
  }> {
    const { pageSize, skip } = parsePaginationParams(filters ?? {});

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.department) {
      where.department = filters.department;
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // 특정 프로젝트에 속하지 않은 사용자만 조회
    if (filters?.excludeProject) {
      const projectId = BigInt(filters.excludeProject);
      const projectMembers = await this.prisma.projectMember.findMany({
        where: { projectId },
        select: { memberId: true },
      });
      const excludedMemberIds = projectMembers.map((pm) => pm.memberId);

      if (excludedMemberIds.length > 0) {
        where.id = { notIn: excludedMemberIds };
      }
    }

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: pageSize === 0 ? undefined : skip,
        take: pageSize === 0 ? undefined : pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      list: users.map((user) => new UserResponseDto(user)),
      totalCount,
    };
  }

  async findOne(id: bigint): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    return new UserResponseDto(user);
  }

  async update(
    id: bigint,
    updateUserDto: UpdateUserDto,
    currentUserId: bigint,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        updatedBy: currentUserId,
        updatedAt: new Date(),
      },
    });

    return new UserResponseDto(user);
  }

  async deactivate(id: bigint, currentUserId: bigint): Promise<void> {
    // 본인 계정 비활성화 방지
    if (id === currentUserId) {
      throw new BadRequestException('본인 계정은 비활성화할 수 없습니다');
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: currentUserId,
        updatedAt: new Date(),
      },
    });
  }
}
