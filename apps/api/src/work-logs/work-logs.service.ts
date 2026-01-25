import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
import { UpdateWorkLogDto } from './dto/update-work-log.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { parsePaginationParams } from '../common/helpers/pagination.helper';
import * as ExcelJS from 'exceljs';
import { TASK_STATUS_METADATA } from '@repo/schema';

@Injectable()
export class WorkLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 업무일지 생성
   */
  async create(
    taskId: bigint,
    userId: bigint,
    createWorkLogDto: CreateWorkLogDto,
  ) {
    // 1. 업무 존재 확인
    const task = await this.prisma.task.findUnique({
      where: { id: taskId, isActive: true },
    });

    if (!task) {
      throw new NotFoundException('업무를 찾을 수 없습니다');
    }

    // 2. 담당자인지 확인
    const isAssignee = await this.checkIsAssignee(taskId, userId);
    if (!isAssignee) {
      throw new ForbiddenException(
        '해당 업무의 담당자만 일지를 작성할 수 있습니다',
      );
    }

    // 3. 프로젝트 멤버 역할 확인 (PM 제외)
    const memberRole = await this.getProjectMemberRole(task.projectId, userId);
    if (memberRole === 'PM') {
      throw new ForbiddenException('PM은 업무일지를 작성할 수 없습니다');
    }

    // 4. 동일 날짜에 이미 일지가 있는지 확인
    const workDate = new Date(createWorkLogDto.workDate);
    const existingLog = await this.prisma.workLog.findFirst({
      where: {
        taskId,
        userId,
        workDate,
        isActive: true,
      },
    });

    if (existingLog) {
      throw new ConflictException('해당 날짜에 이미 업무일지가 존재합니다');
    }

    // 5. 업무일지 생성
    return await this.prisma.workLog.create({
      data: {
        taskId,
        userId,
        workDate,
        content: createWorkLogDto.content,
        workHours: createWorkLogDto.workHours
          ? new Decimal(createWorkLogDto.workHours)
          : null,
        progress: createWorkLogDto.progress,
        issues: createWorkLogDto.issues,
      },
      include: {
        task: {
          select: {
            id: true,
            taskName: true,
            projectId: true,
            status: true,
            difficulty: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * 특정 업무의 일지 목록 조회
   */
  async findByTask(
    taskId: bigint,
    params?: {
      startDate?: string;
      endDate?: string;
      pageNum?: number;
      pageSize?: number;
    },
  ) {
    const { pageSize, skip } = parsePaginationParams(params ?? {});

    const where: any = {
      taskId,
      isActive: true,
    };

    if (params?.startDate || params?.endDate) {
      where.workDate = {};
      if (params?.startDate) where.workDate.gte = new Date(params.startDate);
      if (params?.endDate) where.workDate.lte = new Date(params.endDate);
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.workLog.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          task: {
            select: {
              id: true,
              taskName: true,
              projectId: true,
              status: true,
              difficulty: true,
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { workDate: 'desc' },
      }),
      this.prisma.workLog.count({ where }),
    ]);

    return { list: items, totalCount };
  }

  /**
   * 내 일지 목록 조회
   * pageSize=0이면 전체 조회 (달력용)
   */
  async findByUser(
    userId: bigint,
    params?: {
      startDate?: string;
      endDate?: string;
      pageNum?: number;
      pageSize?: number;
    },
  ) {
    const { pageSize, skip } = parsePaginationParams(params ?? {});
    const fetchAll = pageSize === 0;

    const where: any = {
      userId,
      isActive: true,
    };

    if (params?.startDate || params?.endDate) {
      where.workDate = {};
      if (params?.startDate) where.workDate.gte = new Date(params.startDate);
      if (params?.endDate) where.workDate.lte = new Date(params.endDate);
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.workLog.findMany({
        where,
        ...(fetchAll ? {} : { skip, take: pageSize }),
        include: {
          task: {
            select: {
              id: true,
              taskName: true,
              projectId: true,
              status: true,
              difficulty: true,
            },
          },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { workDate: 'desc' },
      }),
      this.prisma.workLog.count({ where }),
    ]);

    return { list: items, totalCount };
  }

  /**
   * 프로젝트 전체 팀원의 일지 조회
   */
  async findByProject(projectId: bigint, startDate?: string, endDate?: string) {
    const where: any = {
      task: {
        projectId,
        isActive: true,
      },
      isActive: true,
    };

    if (startDate || endDate) {
      where.workDate = {};
      if (startDate) where.workDate.gte = new Date(startDate);
      if (endDate) where.workDate.lte = new Date(endDate);
    }

    return await this.prisma.workLog.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            taskName: true,
            projectId: true,
            status: true,
            difficulty: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { workDate: 'desc' },
    });
  }

  /**
   * 단일 일지 조회
   */
  async findOne(id: bigint) {
    const workLog = await this.prisma.workLog.findUnique({
      where: { id },
      include: {
        task: {
          select: {
            id: true,
            taskName: true,
            projectId: true,
            status: true,
            difficulty: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!workLog || !workLog.isActive) {
      throw new NotFoundException('업무일지를 찾을 수 없습니다');
    }

    return workLog;
  }

  /**
   * 업무일지 수정
   */
  async update(id: bigint, userId: bigint, updateWorkLogDto: UpdateWorkLogDto) {
    const workLog = await this.findOne(id);

    // 작성자 본인만 수정 가능
    if (workLog.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 일지만 수정할 수 있습니다');
    }

    // 날짜 변경 시 중복 체크
    if (updateWorkLogDto.workDate) {
      const newDate = new Date(updateWorkLogDto.workDate);
      const existingLog = await this.prisma.workLog.findFirst({
        where: {
          taskId: workLog.taskId,
          userId,
          workDate: newDate,
          isActive: true,
          id: { not: id },
        },
      });

      if (existingLog) {
        throw new ConflictException('해당 날짜에 이미 업무일지가 존재합니다');
      }
    }

    return await this.prisma.workLog.update({
      where: { id },
      data: {
        workDate: updateWorkLogDto.workDate
          ? new Date(updateWorkLogDto.workDate)
          : undefined,
        content: updateWorkLogDto.content,
        workHours:
          updateWorkLogDto.workHours !== undefined
            ? updateWorkLogDto.workHours
              ? new Decimal(updateWorkLogDto.workHours)
              : null
            : undefined,
        progress: updateWorkLogDto.progress,
        issues: updateWorkLogDto.issues,
      },
      include: {
        task: {
          select: {
            id: true,
            taskName: true,
            projectId: true,
            status: true,
            difficulty: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * 업무일지 삭제 (soft delete)
   */
  async remove(id: bigint, userId: bigint) {
    const workLog = await this.findOne(id);

    // 작성자 본인만 삭제 가능
    if (workLog.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 일지만 삭제할 수 있습니다');
    }

    await this.prisma.workLog.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * 내가 담당하는 업무 목록 조회
   */
  async findMyTasks(userId: bigint) {
    return await this.prisma.task.findMany({
      where: {
        isActive: true,
        assignees: {
          some: {
            userId,
          },
        },
      },
      include: {
        project: { select: { id: true, projectName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 담당자 여부 확인
   */
  private async checkIsAssignee(
    taskId: bigint,
    userId: bigint,
  ): Promise<boolean> {
    const assignee = await this.prisma.taskAssignee.findFirst({
      where: {
        taskId,
        userId,
      },
    });
    return !!assignee;
  }

  /**
   * 프로젝트 멤버 역할 조회
   * @returns MemberRole ('PM' | 'PL' | 'PA') or null (멤버가 아님)
   */
  private async getProjectMemberRole(
    projectId: bigint,
    userId: bigint,
  ): Promise<string | null> {
    const projectMember = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        memberId: userId,
      },
      select: {
        role: true,
      },
    });

    return projectMember?.role ?? null;
  }

  /**
   * 주간 업무일지 엑셀 다운로드
   *
   * 행 구조: 업무 × 투입역할 × 작업자 1명 조합
   * - 같은 업무라도 역할이나 작업자가 다르면 행 분리
   * - 업무 공통 정보는 첫 번째 행에만 표시
   */
  async generateWeeklyReport(
    projectId: bigint,
    startDate: string,
    endDate: string,
  ): Promise<Buffer> {
    // 1. 데이터 조회 - 해당 기간의 모든 업무일지
    const workLogs = await this.prisma.workLog.findMany({
      where: {
        task: { projectId, isActive: true },
        workDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        isActive: true,
      },
      include: {
        task: {
          include: {
            assignees: {
              include: { user: true },
            },
          },
        },
        user: true,
      },
      orderBy: [{ task: { status: 'asc' } }, { task: { taskName: 'asc' } }],
    });

    // 2. Task × Role × Assignee 조합으로 행 생성
    interface ExcelRow {
      taskId: bigint;
      status: string;
      taskName: string;
      rmName: string | null;
      role: string; // 투입현황 (기획/디자인/퍼블리싱 등)
      assigneeName: string; // 작업자명 (1명만)
      startDate: Date | null;
      workHours: number; // 금주작업 시간 (숫자만)
      openDate: Date | null;
      contents: string[]; // 금주 작업 내용
      issues: string[]; // 비고
    }

    const rowsMap = new Map<string, ExcelRow>();

    // 역할명 한글 변환 맵
    const roleMap: Record<string, string> = {
      PLANNING: '기획',
      DESIGN: '디자인',
      PUBLISHING: '퍼블리싱',
      FRONTEND: '프론트엔드',
      BACKEND: '백엔드',
      QA: 'QA',
    };

    for (const workLog of workLogs as any[]) {
      const key = `${workLog.taskId}_${workLog.userId}`;

      if (!rowsMap.has(key)) {
        // 해당 작업자의 역할 조회
        const assignee = workLog.task.assignees.find(
          (a: any) => a.userId === workLog.userId,
        );
        const role = roleMap[assignee?.workArea] || assignee?.workArea || '';

        rowsMap.set(key, {
          taskId: workLog.taskId,
          status: workLog.task.status,
          taskName: workLog.task.taskName,
          rmName: workLog.task.clientName,
          role: role,
          assigneeName: workLog.user.name,
          startDate: workLog.task.startDate,
          workHours: 0,
          openDate: workLog.task.openDate,
          contents: [],
          issues: [],
        });
      }

      // 시간 누적 및 내용 수집
      const row = rowsMap.get(key);
      if (row) {
        row.workHours += Number(workLog.workHours || 0);
        if (workLog.content) row.contents.push(workLog.content);
        if (workLog.issues) row.issues.push(workLog.issues);
      }
    }

    // 3. 같은 업무끼리 그룹핑하여 정렬
    const rows = Array.from(rowsMap.values());
    // taskId로 정렬하여 같은 업무가 연속되도록
    rows.sort((a, b) => {
      if (a.taskId < b.taskId) return -1;
      if (a.taskId > b.taskId) return 1;
      // 같은 task 내에서는 역할 순서로 정렬
      const roleOrder = ['기획', '디자인', '퍼블리싱', '백엔드', 'QA'];
      return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
    });

    // 4. ExcelJS로 파일 생성
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Emotion PMS';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('주간 업무 보고서');

    // 프로젝트 정보 조회 (헤더용)
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { projectName: true },
    });
    const projectName = project?.projectName || '프로젝트';

    // 헤더 행 1: 프로젝트명 + 기간
    const titleRow = worksheet.addRow([
      `${projectName} 주간 업무 보고서 (${startDate} ~ ${endDate})`,
    ]);
    worksheet.mergeCells(1, 1, 1, 10);
    titleRow.getCell(1).font = { bold: true, size: 14 };
    titleRow.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    titleRow.height = 25;

    // 헤더 행 2: 빈 행
    worksheet.addRow([]);

    // 헤더 행 3: 컬럼 헤더
    const headers = [
      '진행 상태',
      '업무명',
      '담당RM',
      '오픈일',
      '투입현황',
      '작업자',
      '작업시작일',
      '금주작업 시간',
      '금주 작업 내용',
      '비고',
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7F3FF' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // 5. 데이터 행 추가 및 병합을 위한 taskId별 행 번호 추적
    // taskId -> { startRow, endRow } 매핑
    const taskRowRanges = new Map<
      string,
      { startRow: number; endRow: number }
    >();
    const dataStartRow = 4; // 타이틀(1) + 빈행(2) + 헤더(3) 다음
    let currentExcelRow = dataStartRow;

    rows.forEach((row) => {
      const taskIdStr = row.taskId.toString();

      // 첫 번째 행인지 확인
      const isFirstRowOfTask = !taskRowRanges.has(taskIdStr);

      if (isFirstRowOfTask) {
        taskRowRanges.set(taskIdStr, {
          startRow: currentExcelRow,
          endRow: currentExcelRow,
        });
      } else {
        // 같은 업무의 마지막 행 업데이트
        const range = taskRowRanges.get(taskIdStr)!;
        range.endRow = currentExcelRow;
      }

      // 상태, 업무명, RM, 오픈일은 첫 번째 행에만 값 입력 (병합 후 표시)
      const statusLabel = isFirstRowOfTask
        ? TASK_STATUS_METADATA[row.status]?.label || row.status
        : '';
      const taskName = isFirstRowOfTask ? row.taskName : '';
      const rmName = isFirstRowOfTask ? row.rmName || '' : '';
      const openDateText =
        isFirstRowOfTask && row.openDate
          ? row.openDate.toISOString().split('T')[0]
          : '';

      const startDateText = row.startDate
        ? row.startDate.toISOString().split('T')[0]
        : '';
      const contentText = row.contents.join('\n');
      const issuesText = row.issues.join('\n');

      const dataRow = worksheet.addRow([
        statusLabel, // 1. 진행 상태 (병합 대상)
        taskName, // 2. 업무명 (병합 대상)
        rmName, // 3. 담당RM (병합 대상)
        openDateText, // 4. 오픈일 (병합 대상)
        row.role, // 5. 투입현황
        row.assigneeName, // 6. 작업자
        startDateText, // 7. 작업시작일
        row.workHours || '', // 8. 금주작업 시간
        contentText, // 9. 금주 작업 내용
        issuesText, // 10. 비고
      ]);

      dataRow.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      currentExcelRow++;
    });

    // 6. 같은 업무에 속하는 행들의 셀 병합 (진행상태, 업무명, 담당RM, 오픈일)
    // 병합 대상 컬럼: 1(진행상태), 2(업무명), 3(담당RM), 4(오픈일)
    const columnsToMerge = [1, 2, 3, 4];

    taskRowRanges.forEach((range) => {
      if (range.startRow < range.endRow) {
        // 2개 이상의 행이 있는 경우에만 병합
        columnsToMerge.forEach((colNum) => {
          worksheet.mergeCells(range.startRow, colNum, range.endRow, colNum);
          // 병합된 셀의 정렬을 중앙으로
          const cell = worksheet.getCell(range.startRow, colNum);
          cell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
            wrapText: true,
          };
        });
      }
    });

    // 7. 컬럼 너비 설정
    // [진행상태, 업무명, 담당RM, 오픈일, 투입현황, 작업자, 작업시작일, 금주작업시간, 금주작업내용, 비고]
    const columnWidths = [12, 35, 12, 14, 10, 10, 14, 14, 40, 30];
    columnWidths.forEach((width, i) => {
      worksheet.getColumn(i + 1).width = width;
    });

    // 7. Buffer 반환
    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
