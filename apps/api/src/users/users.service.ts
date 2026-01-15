import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    search?: string;
    department?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number }> {
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
