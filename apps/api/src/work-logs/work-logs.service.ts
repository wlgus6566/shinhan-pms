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
   * 업무별 작업 내용 추천 조회
   * 해당 업무의 과거 작업 내용을 중복 제거하여 최근 사용순으로 반환
   * 현재 사용자가 작성한 작업 내용만 조회
   */
  async findContentSuggestions(taskId: bigint, userId: bigint, limit: number = 10) {
    // Prisma는 groupBy에서 직접 max(workDate)를 지원하지 않으므로,
    // raw query를 사용하여 content별 최신 날짜와 사용 횟수를 조회
    const suggestions = await this.prisma.$queryRaw<
      Array<{
        content: string;
        last_used_date: Date;
        usage_count: bigint;
      }>
    >`
      SELECT
        content,
        MAX(work_date) as last_used_date,
        COUNT(*) as usage_count
      FROM work_logs
      WHERE task_id = ${taskId}
        AND user_id = ${userId}
        AND is_active = true
        AND content IS NOT NULL
        AND content != ''
      GROUP BY content
      ORDER BY last_used_date DESC
      LIMIT ${limit}
    `;

    return suggestions.map((s) => ({
      content: s.content,
      lastUsedDate: s.last_used_date.toISOString(),
      usageCount: Number(s.usage_count),
    }));
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

  /**
   * 월간 투입인력별 상세업무현황 엑셀 다운로드
   */
  async generateMonthlyStaffReport(
    projectId: bigint,
    year: number,
    month: number,
  ): Promise<Buffer> {
    try {
      // 1. 해당 월의 첫날과 마지막날 계산
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0); // 해당 월의 마지막 날
      console.log('[generateMonthlyStaffReport] Start:', {
        projectId: projectId.toString(),
        year,
        month,
        firstDay,
        lastDay,
      });

      // 2. 해당 월의 work_logs 조회
      console.log('[generateMonthlyStaffReport] Fetching work logs...');
      const workLogs = await this.prisma.workLog.findMany({
        where: {
          task: { projectId, isActive: true },
          workDate: { gte: firstDay, lte: lastDay },
          isActive: true,
        },
        include: {
          task: true,
          user: true,
        },
      });
      console.log(
        '[generateMonthlyStaffReport] Work logs count:',
        workLogs.length,
      );

      // 3. 프로젝트 멤버 조회
      console.log('[generateMonthlyStaffReport] Fetching project members...');
      const projectMembers = await this.prisma.projectMember.findMany({
        where: { projectId },
        include: { member: true },
      });
      console.log(
        '[generateMonthlyStaffReport] Project members count:',
        projectMembers.length,
      );

      // 4. 해당 월의 휴가 데이터 조회 (VACATION, HALF_DAY)
      // usageDate 필드를 사용해야 함 (휴가/반차 전용 날짜 필드)
      const memberIds = projectMembers.map((m) => m.memberId);
      const memberIdSet = new Set(memberIds.map((id) => id.toString()));
      console.log(
        '[generateMonthlyStaffReport] Member IDs:',
        memberIds.map((id) => id.toString()),
      );

      let vacations: any[] = [];
      if (memberIds.length > 0) {
        console.log('[generateMonthlyStaffReport] Fetching vacations...');
        vacations = await this.prisma.schedule.findMany({
          where: {
            scheduleType: { in: ['VACATION', 'HALF_DAY'] },
            isActive: true,
            participants: {
              some: { userId: { in: memberIds } },
            },
            usageDate: { gte: firstDay, lte: lastDay },
          },
          include: {
            participants: true,
          },
        });
        console.log(
          '[generateMonthlyStaffReport] Vacations count:',
          vacations.length,
        );
      }

      // 5. 한글 변환 맵
      const gradeMap: Record<string, string> = {
        EXPERT: '특급',
        ADVANCED: '고급',
        INTERMEDIATE: '중급',
        BEGINNER: '초급',
      };

      const difficultyMap: Record<string, string> = {
        HIGH: '상',
        MEDIUM: '중',
        LOW: '하',
      };

      const workAreaMap: Record<string, string> = {
        PLANNING: '기획',
        DESIGN: '디자인',
        FRONTEND: '프론트엔드',
        BACKEND: '백엔드',
      };

      // 6. 주차 계산 함수
      const getWeekOfMonth = (date: Date): number => {
        const day = date.getDate();
        if (day <= 7) return 1;
        if (day <= 14) return 2;
        if (day <= 21) return 3;
        return 4;
      };

      // 7. 직원별 데이터 집계
      interface EmployeeTask {
        taskName: string;
        difficulty: string;
        details: string[];
        weeklyHours: {
          week1: number;
          week2: number;
          week3: number;
          week4: number;
        };
        totalHours: number;
      }

      interface EmployeeData {
        department: string;
        role: string;
        name: string;
        grade: string;
        tasks: EmployeeTask[];
        totalMonthlyHours: number;
      }

      const employeeMap = new Map<string, EmployeeData>();

      // 멤버 정보 초기화
      for (const pm of projectMembers) {
        const userId = pm.memberId.toString();
        if (!employeeMap.has(userId)) {
          employeeMap.set(userId, {
            department: workAreaMap[pm.workArea] || pm.workArea,
            role: pm.role,
            name: pm.member.name,
            grade: gradeMap[pm.member.grade] || pm.member.grade,
            tasks: [],
            totalMonthlyHours: 0,
          });
        }
      }

      // work_logs를 직원 × 업무별로 집계
      const taskMapByEmployee = new Map<string, Map<string, EmployeeTask>>();

      for (const log of workLogs) {
        const userId = log.userId.toString();
        const taskId = log.taskId.toString();
        const weekNum = getWeekOfMonth(new Date(log.workDate));
        const hours = Number(log.workHours || 0);

        if (!taskMapByEmployee.has(userId)) {
          taskMapByEmployee.set(userId, new Map());
        }
        const userTaskMap = taskMapByEmployee.get(userId)!;

        if (!userTaskMap.has(taskId)) {
          userTaskMap.set(taskId, {
            taskName: log.task.taskName,
            difficulty: difficultyMap[log.task.difficulty] || '-',
            details: [],
            weeklyHours: { week1: 0, week2: 0, week3: 0, week4: 0 },
            totalHours: 0,
          });
        }

        const taskData = userTaskMap.get(taskId)!;
        if (log.content) taskData.details.push(log.content);
        taskData.weeklyHours[
          `week${weekNum}` as keyof typeof taskData.weeklyHours
        ] += hours;
        taskData.totalHours += hours;
      }

      // 휴가 데이터 집계 (프로젝트 멤버만)
      for (const vacation of vacations) {
        // usageDate가 없으면 건너뛰기
        if (!vacation.usageDate) continue;

        for (const participant of vacation.participants) {
          const userId = participant.userId.toString();

          // 프로젝트 멤버가 아니면 건너뛰기
          if (!memberIdSet.has(userId)) continue;

          if (!taskMapByEmployee.has(userId)) {
            taskMapByEmployee.set(userId, new Map());
          }
          const userTaskMap = taskMapByEmployee.get(userId)!;

          const vacationKey = 'vacation';
          if (!userTaskMap.has(vacationKey)) {
            userTaskMap.set(vacationKey, {
              taskName: '휴가',
              difficulty: '-',
              details: ['연차'],
              weeklyHours: { week1: 0, week2: 0, week3: 0, week4: 0 },
              totalHours: 0,
            });
          }

          const weekNum = getWeekOfMonth(new Date(vacation.usageDate));
          const hours = vacation.scheduleType === 'HALF_DAY' ? 4 : 8;
          const vacationData = userTaskMap.get(vacationKey)!;
          vacationData.weeklyHours[
            `week${weekNum}` as keyof typeof vacationData.weeklyHours
          ] += hours;
          vacationData.totalHours += hours;
        }
      }

      // employeeMap에 tasks 추가 및 totalMonthlyHours 계산
      for (const [userId, taskMap] of taskMapByEmployee) {
        const employee = employeeMap.get(userId);
        if (employee) {
          employee.tasks = Array.from(taskMap.values());
          employee.totalMonthlyHours = employee.tasks.reduce(
            (sum, t) => sum + t.totalHours,
            0,
          );
        }
      }

      // 업무가 없는 멤버 제외
      const employees = Array.from(employeeMap.values()).filter(
        (e) => e.tasks.length > 0,
      );

      // 역할 순서에 따라 정렬 (PM → PL → PA)
      const roleOrder = ['PM', 'PL', 'PA'];
      employees.sort((a, b) => {
        const aOrder = roleOrder.indexOf(a.role);
        const bOrder = roleOrder.indexOf(b.role);
        return aOrder - bOrder;
      });

      // 8. ExcelJS로 파일 생성
      console.log(
        '[generateMonthlyStaffReport] Creating Excel with',
        employees.length,
        'employees',
      );
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Emotion PMS';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Sheet1');

      // 열 너비 설정
      worksheet.columns = [
        { width: 12 }, // A: 담당업무
        { width: 8 }, // B: 역할
        { width: 10 }, // C: 이름
        { width: 8 }, // D: 등급
        { width: 35 }, // E: 진행 업무
        { width: 8 }, // F: 난이도
        { width: 40 }, // G: 비고
        { width: 8 }, // H: 1주차
        { width: 8 }, // I: 2주차
        { width: 8 }, // J: 3주차
        { width: 8 }, // K: 4주차
        { width: 12 }, // L: 업무별 투입시간
        { width: 15 }, // M: 월 공수
        { width: 12 }, // N: 일평균
      ];

      // 헤더 영역
      // 1행: 빈 행
      worksheet.addRow([]);

      // 2행: 제목
      const titleRow = worksheet.addRow(['투입인력별 상세 업무현황']);
      worksheet.mergeCells(2, 1, 2, 14);
      titleRow.getCell(1).font = { name: 'Arial', size: 16, bold: true };
      titleRow.getCell(1).alignment = {
        horizontal: 'left',
        vertical: 'middle',
      };

      // 3행: 정상근무 시간
      const normalHoursRow = worksheet.addRow([]);
      normalHoursRow.getCell(13).value = '정상근무 160시간';
      normalHoursRow.getCell(13).font = { name: 'Arial', size: 11, bold: true };

      // 4행: 컬럼 헤더
      const headers = [
        '담당업무',
        '역할',
        '이름',
        '등급',
        '진행 업무',
        '난이도',
        '비고(작업상세 이력)',
        '1주차',
        '2주차',
        '3주차',
        '4주차',
        '업무별 투입시간',
        `${month}월 공수\n(m/h)`,
        '일평균 근무시간',
      ];

      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = {
          name: 'Arial',
          size: 12,
          bold: true,
          color: { argb: 'FFFFFFFF' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF000000' }, // 검은 배경
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // 데이터 행 생성
      let currentRow = 5;

      for (const employee of employees) {
        const startRow = currentRow;
        const taskCount = employee.tasks.length;

        for (let i = 0; i < taskCount; i++) {
          const task = employee.tasks[i];
          const isFirstRow = i === 0;

          const row = worksheet.addRow([
            isFirstRow ? employee.department : '',
            isFirstRow ? employee.role : '',
            isFirstRow ? employee.name : '',
            isFirstRow ? employee.grade : '',
            task.taskName,
            task.difficulty,
            task.details.join('\n'),
            task.weeklyHours.week1 || '',
            task.weeklyHours.week2 || '',
            task.weeklyHours.week3 || '',
            task.weeklyHours.week4 || '',
            { formula: `SUM(H${currentRow}:K${currentRow})` },
            isFirstRow
              ? taskCount === 1
                ? { formula: `L${currentRow}` }
                : { formula: `SUM(L${startRow}:L${startRow + taskCount - 1})` }
              : '',
            isFirstRow ? { formula: `M${currentRow}/20` } : '',
          ]);

          // 스타일 적용
          row.eachCell((cell, colNumber) => {
            cell.font = { name: 'Arial', size: 10 };
            cell.alignment = {
              vertical: 'middle',
              horizontal: colNumber === 7 ? 'left' : 'center',
              wrapText: true,
            };
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });

          currentRow++;
        }

        // 셀 병합 (직원이 여러 업무를 수행한 경우)
        if (taskCount > 1) {
          worksheet.mergeCells(startRow, 1, startRow + taskCount - 1, 1); // 담당업무
          worksheet.mergeCells(startRow, 2, startRow + taskCount - 1, 2); // 역할
          worksheet.mergeCells(startRow, 3, startRow + taskCount - 1, 3); // 이름
          worksheet.mergeCells(startRow, 4, startRow + taskCount - 1, 4); // 등급
          worksheet.mergeCells(startRow, 13, startRow + taskCount - 1, 13); // 월 공수
          worksheet.mergeCells(startRow, 14, startRow + taskCount - 1, 14); // 일평균

          // 병합된 셀 정렬
          [1, 2, 3, 4, 13, 14].forEach((col) => {
            const cell = worksheet.getCell(startRow, col);
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          });
        }
      }

      // Buffer 반환
      const arrayBuffer = await workbook.xlsx.writeBuffer();
      console.log('[generateMonthlyStaffReport] Success: Excel generated');
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('[generateMonthlyStaffReport] Error:', error);
      throw error;
    }
  }
}
