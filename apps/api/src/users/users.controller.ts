import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('사용자 관리')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'PM')
  @ApiOperation({ summary: '사용자 생성 (슈퍼관리자/PM 전용)' })
  @ApiResponse({
    status: 201,
    description: '사용자가 생성되었습니다',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: '이미 사용 중인 이메일' })
  async create(
    @Body() createUserDto: any,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto, currentUser.id);
  }

  @Get()
  @Roles('PM', 'PL')
  @ApiOperation({ summary: '사용자 목록 조회 (PM/PL 전용)' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '이름 또는 이메일 검색',
  })
  @ApiQuery({ name: 'department', required: false, description: '파트 필터' })
  @ApiQuery({ name: 'role', required: false, description: '등급 필터' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: '활성 상태 필터',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 개수',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async findAll(
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findAll({
      search,
      department,
      role,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  @Roles('PM', 'PL')
  @ApiOperation({ summary: '사용자 상세 조회 (PM/PL 전용)' })
  @ApiResponse({ status: 200, description: '조회 성공', type: UserResponseDto })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(BigInt(id));
  }

  @Patch(':id')
  @Roles('PM')
  @ApiOperation({ summary: '사용자 정보 수정 (PM 전용)' })
  @ApiResponse({ status: 200, description: '수정 성공', type: UserResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(BigInt(id), updateUserDto, currentUser.id);
  }

  @Delete(':id')
  @Roles('PM')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '사용자 비활성화 (PM 전용)' })
  @ApiResponse({ status: 204, description: '비활성화 성공' })
  @ApiResponse({ status: 400, description: '본인 계정 비활성화 불가' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async deactivate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UserResponseDto,
  ): Promise<void> {
    return this.usersService.deactivate(BigInt(id), currentUser.id);
  }
}
