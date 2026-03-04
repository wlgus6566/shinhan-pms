import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { parsePaginationParams } from '../common/helpers/pagination.helper';
import * as ExcelJS from 'exceljs';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: bigint, userId: bigint, createTaskDto: CreateTaskDto) {
    // 1. 프로젝트 존재 확인
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    // 2. 프로젝트 멤버 권한 확인
    await this.checkMemberPermission(projectId, userId);

    // 3. 업무 구분 유효성 검증
    await this.validateTaskType(projectId, createTaskDto.taskTypeId);

    // 4. 날짜 유효성 검증
    if (createTaskDto.startDate && createTaskDto.endDate) {
      const startDate = new Date(createTaskDto.startDate);
      const endDate = new Date(createTaskDto.endDate);
      if (endDate < startDate) {
        throw new BadRequestException('종료일은 시작일보다 이후여야 합니다');
      }
    }

    // 5. 담당자 유효성 검증
    await this.validateAssignees(
      projectId,
      createTaskDto.planningAssigneeIds,
      createTaskDto.designAssigneeIds,
      createTaskDto.frontendAssigneeIds,
      createTaskDto.backendAssigneeIds,
    );

    // 6. 업무 생성
    const assigneesToCreate = [
      ...(createTaskDto.planningAssigneeIds?.map(id => ({
        userId: BigInt(id),
        workArea: 'PLANNING',
      })) || []),
      ...(createTaskDto.designAssigneeIds?.map(id => ({
        userId: BigInt(id),
        workArea: 'DESIGN',
      })) || []),
      ...(createTaskDto.frontendAssigneeIds?.map(id => ({
        userId: BigInt(id),
        workArea: 'FRONTEND',
      })) || []),
      ...(createTaskDto.backendAssigneeIds?.map(id => ({
        userId: BigInt(id),
        workArea: 'BACKEND',
      })) || []),
    ];

    return await this.prisma.task.create({
      data: {
        projectId,
        taskName: createTaskDto.taskName,
        description: createTaskDto.description,
        difficulty: createTaskDto.difficulty,
        clientName: createTaskDto.clientName,
        taskTypeId: BigInt(createTaskDto.taskTypeId),
        startDate: createTaskDto.startDate ? new Date(createTaskDto.startDate) : null,
        endDate: createTaskDto.endDate ? new Date(createTaskDto.endDate) : null,
        openDate: createTaskDto.openDate ? new Date(createTaskDto.openDate) : null,
        notes: createTaskDto.notes,
        createdBy: userId,
        assignees: {
          create: assigneesToCreate,
        },
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                position: true,
                role: true,
              },
            },
          },
        },
        taskType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAllByProject(
    projectId: bigint,
    params?: {
      pageNum?: number;
      pageSize?: number;
      search?: string;
      status?: string[];
      difficulty?: string[];
    },
  ) {
    const { pageSize, skip } = parsePaginationParams(params ?? {});

    const where: any = {
      projectId,
      isActive: true,
    };

    // Add search filter (case-insensitive)
    if (params?.search) {
      where.taskName = {
        contains: params.search,
        mode: 'insensitive',
      };
    }

    // Add status filter
    if (params?.status && params.status.length > 0) {
      where.status = { in: params.status };
    }

    // Add difficulty filter
    if (params?.difficulty && params.difficulty.length > 0) {
      where.difficulty = { in: params.difficulty };
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          assignees: {
            include: {
              user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                position: true,
                role: true,
              },
            },
            },
          },
          taskType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { list: items, totalCount };
  }

  async findOne(taskId: bigint) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                position: true,
                role: true,
              },
            },
          },
        },
        taskType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task || !task.isActive) {
      throw new NotFoundException('업무를 찾을 수 없습니다');
    }

    return task;
  }

  async update(taskId: bigint, userId: bigint, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(taskId);

    // 프로젝트 멤버 권한 확인
    await this.checkMemberPermission(task.projectId, userId);

    // 업무 구분 유효성 검증
    if (updateTaskDto.taskTypeId) {
      await this.validateTaskType(task.projectId, updateTaskDto.taskTypeId);
    }

    // 날짜 유효성 검증
    if (updateTaskDto.startDate || updateTaskDto.endDate) {
      const startDate = updateTaskDto.startDate
        ? new Date(updateTaskDto.startDate)
        : task.startDate;
      const endDate = updateTaskDto.endDate
        ? new Date(updateTaskDto.endDate)
        : task.endDate;

      if (startDate && endDate && endDate < startDate) {
        throw new BadRequestException('종료일은 시작일보다 이후여야 합니다');
      }
    }

    // 담당자 유효성 검증
    await this.validateAssignees(
      task.projectId,
      updateTaskDto.planningAssigneeIds,
      updateTaskDto.designAssigneeIds,
      updateTaskDto.frontendAssigneeIds,
      updateTaskDto.backendAssigneeIds,
    );

    // 업무 수정
    const updateData: any = {
      taskName: updateTaskDto.taskName,
      description: updateTaskDto.description,
      difficulty: updateTaskDto.difficulty,
      clientName: updateTaskDto.clientName,
      taskTypeId: updateTaskDto.taskTypeId ? BigInt(updateTaskDto.taskTypeId) : undefined,
      startDate: updateTaskDto.startDate ? new Date(updateTaskDto.startDate) : undefined,
      endDate: updateTaskDto.endDate ? new Date(updateTaskDto.endDate) : undefined,
      openDate: updateTaskDto.openDate ? new Date(updateTaskDto.openDate) : undefined,
      notes: updateTaskDto.notes,
      status: updateTaskDto.status,
      updatedBy: userId,
    };

    // 담당자가 제공된 경우에만 업데이트
    if (updateTaskDto.planningAssigneeIds !== undefined ||
        updateTaskDto.designAssigneeIds !== undefined ||
        updateTaskDto.frontendAssigneeIds !== undefined ||
        updateTaskDto.backendAssigneeIds !== undefined) {

      // 기존 할당 삭제
      await this.prisma.taskAssignee.deleteMany({
        where: { taskId },
      });

      // 새 할당 생성
      updateData.assignees = {
        create: [
          ...(updateTaskDto.planningAssigneeIds?.map(id => ({
            userId: BigInt(id),
            workArea: 'PLANNING',
          })) || []),
          ...(updateTaskDto.designAssigneeIds?.map(id => ({
            userId: BigInt(id),
            workArea: 'DESIGN',
          })) || []),
          ...(updateTaskDto.frontendAssigneeIds?.map(id => ({
            userId: BigInt(id),
            workArea: 'FRONTEND',
          })) || []),
          ...(updateTaskDto.backendAssigneeIds?.map(id => ({
            userId: BigInt(id),
            workArea: 'BACKEND',
          })) || []),
        ],
      };
    }

    return await this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
                position: true,
                role: true,
              },
            },
          },
        },
        taskType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(taskId: bigint, userId: bigint) {
    const task = await this.findOne(taskId);

    // 프로젝트 멤버 권한 확인
    await this.checkMemberPermission(task.projectId, userId);

    // Soft delete
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        isActive: false,
        updatedBy: userId,
      },
    });
  }

  async generateWbsExcel(
    projectId: bigint,
    startDateStr: string,
    endDateStr: string,
    flat = false,
  ): Promise<{ buffer: Buffer; projectName: string }> {
    // 프로젝트 조회
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { projectName: true },
    });
    if (!project) throw new NotFoundException('프로젝트를 찾을 수 없습니다');

    // 날짜 범위 계산
    const [sy, sm, sd] = startDateStr.split('-').map(Number);
    const [ey, em, ed] = endDateStr.split('-').map(Number);
    const rangeStart = new Date(Date.UTC(sy, sm - 1, sd));
    const rangeEnd = new Date(Date.UTC(ey, em - 1, ed));

    // 범위와 겹치는 업무 조회
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        isActive: true,
        startDate: { not: null, lte: rangeEnd },
        endDate: { not: null, gte: rangeStart },
      },
      include: {
        assignees: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        taskType: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 업무유형별 정렬
    tasks.sort((a, b) => {
      const aName = a.taskType?.name || '';
      const bName = b.taskType?.name || '';
      return aName.localeCompare(bName, 'ko');
    });

    // 날짜 배열 생성
    const dates: Date[] = [];
    const cur = new Date(rangeStart);
    while (cur <= rangeEnd) {
      dates.push(new Date(cur));
      cur.setUTCDate(cur.getUTCDate() + 1);
    }

    const fmtDate = (d: Date): string =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

    // 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('WBS 공정표');

    const FIXED_COL = 10;
    const DAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

    const ROLE_ARGB: Record<string, string> = {
      PLANNING: 'FF93C5FD',
      DESIGN: 'FFC4B5FD',
      PUBLISHING: 'FFFDBA74',
      FRONTEND: 'FF86EFAC',
      BACKEND: 'FFFCD34D',
    };

    /** 업무 메인 바 색상 (담당자 역할 색상과 구분되는 진한 색) */
    const TASK_BAR_ARGB = 'FF4E79A7'; // 진한 파랑

    const STATUS_KR: Record<string, string> = {
      WAITING: '작업 대기',
      IN_PROGRESS: '작업 중',
      WORK_COMPLETED: '작업 완료',
      TESTING: '테스트',
      OPEN_WAITING: '오픈 대기',
      OPEN_RESPONDING: '오픈 대응',
      COMPLETED: '완료',
      SUSPENDED: '업무 중단',
    };

    const DIFF_KR: Record<string, string> = { HIGH: '상', MEDIUM: '중', LOW: '하' };

    // 스타일
    const hdrFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF334155' },
    };
    const hdrFont: Partial<ExcelJS.Font> = {
      color: { argb: 'FFFFFFFF' },
      size: 9,
      bold: true,
      name: '맑은 고딕',
    };
    const bodyFont: Partial<ExcelJS.Font> = { size: 9, name: '맑은 고딕' };
    const thin: Partial<ExcelJS.Border> = {
      style: 'thin',
      color: { argb: 'FFD1D5DB' },
    };
    const borders: Partial<ExcelJS.Borders> = {
      top: thin,
      bottom: thin,
      left: thin,
      right: thin,
    };
    const wkndFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    };
    const altFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8FAFC' },
    };

    // 컬럼 너비
    const colWidths = [12, 20, 8, 10, 10, 12, 10, 10, 12, 12];
    colWidths.forEach((w, i) => {
      ws.getColumn(i + 1).width = w;
    });
    dates.forEach((_, i) => {
      ws.getColumn(FIXED_COL + 1 + i).width = 4.5;
    });

    const totalCols = FIXED_COL + dates.length;

    // Row 1: 제목
    if (!flat) ws.mergeCells(1, 1, 1, Math.max(totalCols, FIXED_COL));
    const titleCell = ws.getCell(1, 1);
    titleCell.value = `WBS 공정표 - ${project.projectName}`;
    titleCell.font = { size: 14, bold: true, name: '맑은 고딕' };
    titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getRow(1).height = 30;

    // Row 2: 기간
    if (!flat) ws.mergeCells(2, 1, 2, Math.max(totalCols, FIXED_COL));
    const periodCell = ws.getCell(2, 1);
    periodCell.value = `기간: ${startDateStr} ~ ${endDateStr}`;
    periodCell.font = {
      size: 10,
      name: '맑은 고딕',
      color: { argb: 'FF64748B' },
    };
    periodCell.alignment = { horizontal: 'left', vertical: 'middle' };
    ws.getRow(2).height = 22;

    // Row 3: 헤더
    const singleHeaders: { col: number; label: string }[] = [
      { col: 1, label: '업무유형' },
      { col: 2, label: '업무명' },
      { col: 3, label: '난이도' },
      { col: 4, label: '상태' },
      { col: 5, label: '담당RM' },
      { col: 6, label: '오픈일' },
      { col: 7, label: '파트' },
      { col: 8, label: '이름' },
      { col: 9, label: '시작일' },
      { col: 10, label: '종료일' },
    ];
    singleHeaders.forEach(({ col, label }) => {
      const c = ws.getCell(3, col);
      c.value = label;
      c.fill = hdrFill;
      c.font = hdrFont;
      c.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      c.border = borders;
    });

    // 일 헤더 (Row 3 - 날짜 컬럼)
    const todayNow = new Date();
    const todayStr = fmtDate(
      new Date(
        Date.UTC(
          todayNow.getFullYear(),
          todayNow.getMonth(),
          todayNow.getDate(),
        ),
      ),
    );
    dates.forEach((d, i) => {
      const col = FIXED_COL + 1 + i;
      const dow = d.getUTCDay();
      const isWknd = dow === 0 || dow === 6;
      const dStr = fmtDate(d);
      const isToday = dStr === todayStr;

      const c = ws.getCell(3, col);
      c.value = `${d.getUTCMonth() + 1}/${d.getUTCDate()}\n(${DAY_KR[dow]})`;
      c.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      };
      c.font = {
        size: 8,
        name: '맑은 고딕',
        bold: isToday,
        color: isToday
          ? { argb: 'FFEF4444' }
          : dow === 0
            ? { argb: 'FFEF4444' }
            : dow === 6
              ? { argb: 'FF3B82F6' }
              : { argb: 'FFFFFFFF' },
      };
      c.fill = isToday
        ? {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E3A5F' },
          }
        : isWknd
          ? {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FF475569' },
            }
          : hdrFill;
      c.border = borders;
    });

    ws.getRow(3).height = 30;

    // 컬럼 번호 → 엑셀 알파벳 변환 헬퍼
    const colLetter = (c: number): string => {
      let s = '';
      let n = c;
      while (n > 0) {
        n--;
        s = String.fromCharCode(65 + (n % 26)) + s;
        n = Math.floor(n / 26);
      }
      return s;
    };

    // 조건부 서식용 날짜 계산 수식 (COLUMN() 기반, 숨겨진 행 불필요)
    const dateFormula = `DATE(${sy},${sm},${sd})+COLUMN()-${FIXED_COL + 1}`;

    const firstDateCol = colLetter(FIXED_COL + 1);
    const lastDateCol = dates.length > 0 ? colLetter(FIXED_COL + dates.length) : firstDateCol;

    // 역할 라벨
    const ROLE_LABEL_KR: Record<string, string> = {
      PLANNING: '기획',
      DESIGN: '디자인',
      PUBLISHING: '퍼블리싱',
      FRONTEND: '프론트엔드',
      BACKEND: '백엔드',
    };
    const ROLE_ORDER = ['PLANNING', 'DESIGN', 'PUBLISHING', 'FRONTEND', 'BACKEND'];
    const subRowFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF1F5F9' },
    };
    const lightBorder: Partial<ExcelJS.Border> = {
      style: 'thin',
      color: { argb: 'FFE2E8F0' },
    };

    // 데이터 행
    let rowNum = 4;
    // 업무유형 셀 병합을 위한 그룹 추적
    const taskTypeGroups: { startRow: number; endRow: number; name: string }[] = [];
    let currentGroupName: string | null = null;
    let currentGroupStartRow = 4;

    tasks.forEach((task, idx) => {
      const typeName = task.taskType?.name || '-';

      if (typeName !== currentGroupName) {
        if (currentGroupName !== null) {
          taskTypeGroups.push({ startRow: currentGroupStartRow, endRow: rowNum - 1, name: currentGroupName });
        }
        currentGroupName = typeName;
        currentGroupStartRow = rowNum;
      }

      const r = rowNum++;

      // 업무 메인 바 색상 (모든 업무 동일)
      const barArgb = TASK_BAR_ARGB;

      const vals: any[] = [
        task.taskType?.name || '-',        // col 1: 업무유형
        task.taskName,                      // col 2: 업무명
        DIFF_KR[task.difficulty] || task.difficulty, // col 3: 난이도
        STATUS_KR[task.status] || task.status,       // col 4: 상태
        (task as any).clientName || '',              // col 5: 담당RM
        task.openDate                                // col 6: 오픈일
          ? new Date(Date.UTC(task.openDate.getUTCFullYear(), task.openDate.getUTCMonth(), task.openDate.getUTCDate()))
          : null,
        '', // col 7: 파트 (메인행은 비움)
        '', // col 8: 이름 (메인행은 비움)
        task.startDate                               // col 9: 시작일
          ? new Date(Date.UTC(task.startDate.getUTCFullYear(), task.startDate.getUTCMonth(), task.startDate.getUTCDate()))
          : null,
        task.endDate                                 // col 10: 종료일
          ? new Date(Date.UTC(task.endDate.getUTCFullYear(), task.endDate.getUTCMonth(), task.endDate.getUTCDate()))
          : null,
      ];

      const isOdd = idx % 2 === 1;
      vals.forEach((v, ci) => {
        const c = ws.getCell(r, ci + 1);
        c.value = v;
        c.font = bodyFont;
        c.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: ci === 1,
        };
        c.border = borders;
        if (isOdd) c.fill = altFill;
      });

      // 날짜 셀에 날짜 형식 적용
      [6, 9, 10].forEach((col) => {
        ws.getCell(r, col).numFmt = 'YYYY-MM-DD';
      });

      // Gantt 셀 (메인 행) - 수식 + 조건부 서식으로 날짜 연동
      const tStartDate = task.startDate
        ? new Date(Date.UTC(task.startDate.getUTCFullYear(), task.startDate.getUTCMonth(), task.startDate.getUTCDate()))
        : null;
      const tEndDate = task.endDate
        ? new Date(Date.UTC(task.endDate.getUTCFullYear(), task.endDate.getUTCMonth(), task.endDate.getUTCDate()))
        : null;

      dates.forEach((d, i) => {
        const col = FIXED_COL + 1 + i;
        const c = ws.getCell(r, col);
        const cLetter = colLetter(col);

        // 오픈일 ◆ 마커 수식 (날짜 일치 시 표시)
        c.value = { formula: `IF(AND($F${r}<>"",${dateFormula}=$F${r}),"◆","")` };
        c.font = bodyFont;
        c.alignment = { horizontal: 'center', vertical: 'middle' };
        c.border = {
          top: thin,
          bottom: thin,
          left: lightBorder,
          right: lightBorder,
        };
      });

      // 조건부 서식 적용 (날짜 열이 있을 때만)
      if (dates.length > 0) {
        const ganttRange = `${firstDateCol}${r}:${lastDateCol}${r}`;

        // 조건부 서식 1: 오픈일 마커 (최고 우선순위)
        ws.addConditionalFormatting({
          ref: ganttRange,
          rules: [{
            type: 'expression',
            priority: 1,
            formulae: [`AND($F${r}<>"",${dateFormula}=$F${r})`],
            style: {
              fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF334155' } },
              font: { color: { argb: 'FFFFFFFF' }, bold: true, size: 7, name: '맑은 고딕' },
            },
          }],
        });

        // 조건부 서식 2: 업무 기간 바 (시작일~종료일) - 업무별 고유 색상 + 흰색 텍스트
        ws.addConditionalFormatting({
          ref: ganttRange,
          rules: [{
            type: 'expression',
            priority: 2,
            formulae: [`AND($I${r}<>"",$J${r}<>"",${dateFormula}>=$I${r},${dateFormula}<=$J${r})`],
            style: {
              fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: barArgb } },
              font: { color: { argb: 'FFFFFFFF' }, size: 8, name: '맑은 고딕' },
            },
          }],
        });

        // 조건부 서식 3: 주말 음영
        ws.addConditionalFormatting({
          ref: ganttRange,
          rules: [{
            type: 'expression',
            priority: 3,
            formulae: [`OR(WEEKDAY(${dateFormula},2)=6,WEEKDAY(${dateFormula},2)=7)`],
            style: {
              fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFF1F5F9' } },
            },
          }],
        });
      }

      ws.getRow(r).height = 24;

      // 담당자 서브행 (파트/이름 분리, 같은 파트 그룹화)
      const roleGroups: { role: string; roleLabel: string; color: string; names: string[] }[] = [];
      const seen = new Set<string>();
      for (const role of ROLE_ORDER) {
        const roleNames: string[] = [];
        for (const a of task.assignees.filter((x) => x.workArea === role)) {
          const key = `${role}-${a.user.id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          roleNames.push(a.user.name);
        }
        if (roleNames.length > 0) {
          roleGroups.push({
            role,
            roleLabel: ROLE_LABEL_KR[role] || role,
            color: ROLE_ARGB[role] || 'FF94A3B8',
            names: roleNames,
          });
        }
      }

      roleGroups.forEach((group) => {
        const groupStartRow = rowNum;

        group.names.forEach((name, nameIdx) => {
          const sr = rowNum++;

          // 고정 컬럼 - 파트/이름/시작일/종료일 분리
          for (let ci = 0; ci < FIXED_COL; ci++) {
            const c = ws.getCell(sr, ci + 1);
            if (ci === 6) {
              // 파트 column - 첫 행에만 값 설정 (나중에 병합)
              if (nameIdx === 0 || flat) {
                c.value = group.roleLabel;
              }
              c.font = bodyFont;
              c.alignment = { horizontal: 'center', vertical: 'middle' };
            } else if (ci === 7) {
              // 이름 column
              c.value = name;
              c.font = bodyFont;
              c.alignment = { horizontal: 'center', vertical: 'middle' };
            } else if (ci === 8) {
              // 시작일 (Date 객체)
              c.value = tStartDate || null;
              c.numFmt = 'YYYY-MM-DD';
              c.font = bodyFont;
              c.alignment = { horizontal: 'center', vertical: 'middle' };
            } else if (ci === 9) {
              // 종료일 (Date 객체)
              c.value = tEndDate || null;
              c.numFmt = 'YYYY-MM-DD';
              c.font = bodyFont;
              c.alignment = { horizontal: 'center', vertical: 'middle' };
            } else {
              c.font = bodyFont;
              if (flat) {
                c.value = vals[ci];
                c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: ci === 1 };
                if (ci === 5) c.numFmt = 'YYYY-MM-DD';
              }
            }
            c.fill = subRowFill;
            c.border = borders;
          }

          // Gantt 셀 (담당자별 역할 색상) - 조건부 서식으로 날짜 연동
          dates.forEach((d, i) => {
            const col = FIXED_COL + 1 + i;
            const c = ws.getCell(sr, col);
            c.value = null;
            c.font = bodyFont;
            c.alignment = { horizontal: 'center', vertical: 'middle' };
            c.border = {
              top: thin,
              bottom: thin,
              left: lightBorder,
              right: lightBorder,
            };
          });

          // 조건부 서식: 담당자 기간 바
          if (dates.length > 0) {
            const subGanttRange = `${firstDateCol}${sr}:${lastDateCol}${sr}`;
            ws.addConditionalFormatting({
              ref: subGanttRange,
              rules: [{
                type: 'expression',
                priority: 1,
                formulae: [`AND($I${sr}<>"",$J${sr}<>"",${dateFormula}>=$I${sr},${dateFormula}<=$J${sr})`],
                style: {
                  fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: group.color } },
                },
              }],
            });

            // 조건부 서식: 주말 음영
            ws.addConditionalFormatting({
              ref: subGanttRange,
              rules: [{
                type: 'expression',
                priority: 2,
                formulae: [`OR(WEEKDAY(${dateFormula},2)=6,WEEKDAY(${dateFormula},2)=7)`],
                style: {
                  fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFF1F5F9' } },
                },
              }],
            });
          }

          ws.getRow(sr).height = 20;
        });

        // 같은 파트 셀 병합
        if (!flat && group.names.length > 1) {
          ws.mergeCells(groupStartRow, 7, groupStartRow + group.names.length - 1, 7);
        }
      });

      // 업무 단위 속성 셀 병합 (메인행 + 서브행)
      if (!flat && rowNum - 1 > r) {
        ws.mergeCells(r, 2, rowNum - 1, 2);   // 업무명
        ws.mergeCells(r, 3, rowNum - 1, 3);   // 난이도
        ws.mergeCells(r, 4, rowNum - 1, 4);   // 상태
        ws.mergeCells(r, 5, rowNum - 1, 5);   // 담당RM
        ws.mergeCells(r, 6, rowNum - 1, 6);   // 오픈일
      }
    });

    // 마지막 업무유형 그룹 추가
    if (currentGroupName !== null) {
      taskTypeGroups.push({ startRow: currentGroupStartRow, endRow: rowNum - 1, name: currentGroupName });
    }

    // 업무유형 셀 병합
    if (!flat) {
      for (const group of taskTypeGroups) {
        if (group.endRow > group.startRow) {
          ws.mergeCells(group.startRow, 1, group.endRow, 1);
        }
      }
    }

    // 범례 (업무 바 + 담당자 역할 색상 + 오픈일)
    const lr = rowNum + 1;
    ws.getCell(lr, 1).value = '범례';
    ws.getCell(lr, 1).font = { size: 8, bold: true, name: '맑은 고딕', color: { argb: 'FF64748B' } };

    const legendFont: Partial<ExcelJS.Font> = { size: 8, name: '맑은 고딕', color: { argb: 'FF64748B' } };

    // 프로젝트에 존재하는 역할 수집
    const activeRolesSet = new Set<string>();
    for (const task of tasks) {
      for (const a of task.assignees) {
        activeRolesSet.add(a.workArea);
      }
    }

    const allRoleLegends = [
      { name: '기획', argb: 'FF93C5FD', role: 'PLANNING' },
      { name: '디자인', argb: 'FFC4B5FD', role: 'DESIGN' },
      { name: '퍼블리싱', argb: 'FFFDBA74', role: 'PUBLISHING' },
      { name: '프론트엔드', argb: 'FF86EFAC', role: 'FRONTEND' },
      { name: '백엔드', argb: 'FFFCD34D', role: 'BACKEND' },
    ];
    const legends = [
      { name: '업무 기간', argb: TASK_BAR_ARGB, role: '' },
      ...allRoleLegends.filter((l) => activeRolesSet.has(l.role)),
      { name: '◆ 오픈일', argb: 'FF334155', role: '' },
    ];

    legends.forEach((item, i) => {
      const row = lr + i;
      const col = 2;
      const colorCell = ws.getCell(row, col);
      colorCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: item.argb },
      };
      colorCell.border = borders;
      const labelCell = ws.getCell(row, col + 1);
      labelCell.value = item.name;
      labelCell.font = legendFont;
    });

    // 자동 필터 (파트, 이름, 상태 등 필터링 가능)
    ws.autoFilter = {
      from: { row: 3, column: 1 },
      to: { row: rowNum - 1, column: FIXED_COL },
    };

    // Pane 고정 (헤더 + 고정 컬럼)
    ws.views = [{ state: 'frozen', xSplit: FIXED_COL, ySplit: 3 }];

    const buf = await workbook.xlsx.writeBuffer();
    return { buffer: Buffer.from(buf), projectName: project.projectName };
  }

  // 권한 체크: 프로젝트 멤버인지 확인
  private async checkMemberPermission(projectId: bigint, userId: bigint) {
    const member = await this.prisma.projectMember.findFirst({
      where: {
        projectId,
        memberId: userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('프로젝트 멤버만 업무를 생성/수정/삭제할 수 있습니다');
    }
  }

  // 담당자 유효성 검증
  private async validateAssignees(
    projectId: bigint,
    planningAssigneeIds?: number[],
    designAssigneeIds?: number[],
    frontendAssigneeIds?: number[],
    backendAssigneeIds?: number[],
  ): Promise<void> {
    const assignees = [
      { ids: planningAssigneeIds, name: '기획' },
      { ids: designAssigneeIds, name: '디자인' },
      { ids: frontendAssigneeIds, name: '프론트엔드' },
      { ids: backendAssigneeIds, name: '백엔드' },
    ];

    for (const assignee of assignees) {
      if (assignee.ids && assignee.ids.length > 0) {
        for (const id of assignee.ids) {
          const member = await this.prisma.projectMember.findFirst({
            where: {
              projectId,
              memberId: BigInt(id),
            },
          });

          if (!member) {
            throw new BadRequestException(
              `${assignee.name} 담당자가 프로젝트 멤버가 아닙니다`,
            );
          }
        }
      }
    }
  }

  // 업무 구분 유효성 검증
  private async validateTaskType(projectId: bigint, taskTypeId?: number): Promise<void> {
    if (!taskTypeId) {
      throw new BadRequestException('업무 구분을 선택해주세요');
    }

    const taskType = await this.prisma.projectTaskType.findFirst({
      where: {
        id: BigInt(taskTypeId),
        projectId,
        isActive: true,
      },
    });

    if (!taskType) {
      throw new BadRequestException('유효하지 않은 업무 구분입니다');
    }
  }
}
