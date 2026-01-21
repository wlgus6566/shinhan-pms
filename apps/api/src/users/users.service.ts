import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
    createdBy: bigint,
  ): Promise<UserResponseDto> {
    // 이메일 중복 체크
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다');
    }

    // 비밀번호 해시
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

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
    page?: number;
    limit?: number;
    excludeProject?: string;
  }): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

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

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => new UserResponseDto(user)),
      total,
      page,
      limit,
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
    // 본인 등급 변경 방지
    if (id === currentUserId && updateUserDto.role) {
      throw new BadRequestException('본인의 등급은 변경할 수 없습니다');
    }

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
