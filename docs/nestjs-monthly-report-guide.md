# NestJS 기반 월간 투입인력별 상세업무현황 엑셀 생성 가이드

## 개요
일일업무일지 데이터를 기반으로 월간 투입인력별 상세업무현황 엑셀 파일을 생성하는 NestJS API 구현 가이드입니다.

## 5. Excel 생성 서비스

### 5.1 Excel Service (`excel/excel.service.ts`)
```typescript
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { EmployeeWork } from '../types/work-report.interface';

@Injectable()
export class ExcelService {
  async generateMonthlyReport(
    year: number,
    month: number,
    employees: EmployeeWork[]
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // 스타일 정의
    const headerStyle = {
      font: { name: 'Arial', size: 11, bold: true },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    const cellStyle = {
      font: { name: 'Arial', size: 10 },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // 컬럼 너비 설정
    worksheet.columns = [
      { width: 12 },  // 담당업무
      { width: 8 },   // 역할
      { width: 10 },  // 이름
      { width: 8 },   // 등급
      { width: 35 },  // 진행 업무
      { width: 8 },   // 난이도
      { width: 40 },  // 비고
      { width: 8 },   // 1주차
      { width: 8 },   // 2주차
      { width: 8 },   // 3주차
      { width: 8 },   // 4주차
      { width: 12 },  // 업무별 투입시간
      { width: 15 },  // 11월 공수
      { width: 12 }   // 일평균 근무시간
    ];

    let currentRow = 1;

    // 빈 행
    currentRow++;

    // 제목
    worksheet.mergeCells(currentRow, 1, currentRow, 14);
    const titleCell = worksheet.getCell(currentRow, 1);
    titleCell.value = '투입인력별 상세 업무현황';
    titleCell.font = { name: 'Arial', size: 14, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    currentRow++;

    // 정상근무 시간 표시
    const normalHoursCell = worksheet.getCell(currentRow, 13);
    normalHoursCell.value = '정상근무 160시간';
    normalHoursCell.font = { name: 'Arial', size: 11, bold: true };
    currentRow++;

    // 컬럼 헤더
    const headers = [
      '담당업무', '역할', '이름', '등급', '진행 업무', '난이도',
      '비고(작업상세 이력)', '1주차', '2주차', '3주차', '4주차',
      '업무별 투입시간', `${month}월 공수\n(m/h)`, '일평균 근무시간'
    ];

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(currentRow, index + 1);
      cell.value = header;
      Object.assign(cell, headerStyle);
    });
    currentRow++;

    // 직원별 데이터 작성
    employees.forEach(employee => {
      const startRow = currentRow;

      // 첫 번째 업무 행 (직원 정보 포함)
      if (employee.tasks.length > 0) {
        const firstTask = employee.tasks[0];
        
        // 직원 기본 정보
        worksheet.getCell(currentRow, 1).value = employee.department;
        worksheet.getCell(currentRow, 2).value = employee.role;
        worksheet.getCell(currentRow, 3).value = employee.name;
        worksheet.getCell(currentRow, 4).value = employee.grade;
        
        // 첫 번째 업무
        worksheet.getCell(currentRow, 5).value = firstTask.taskName;
        worksheet.getCell(currentRow, 6).value = firstTask.difficulty;
        worksheet.getCell(currentRow, 7).value = firstTask.detail;
        worksheet.getCell(currentRow, 8).value = firstTask.weeklyHours.week1;
        worksheet.getCell(currentRow, 9).value = firstTask.weeklyHours.week2;
        worksheet.getCell(currentRow, 10).value = firstTask.weeklyHours.week3;
        worksheet.getCell(currentRow, 11).value = firstTask.weeklyHours.week4;
        worksheet.getCell(currentRow, 12).value = firstTask.totalHours;
        worksheet.getCell(currentRow, 13).value = employee.totalMonthlyHours;
        worksheet.getCell(currentRow, 14).value = employee.avgDailyHours;

        currentRow++;

        // 나머지 업무들
        for (let i = 1; i < employee.tasks.length; i++) {
          const task = employee.tasks[i];
          
          worksheet.getCell(currentRow, 5).value = task.taskName;
          worksheet.getCell(currentRow, 6).value = task.difficulty;
          worksheet.getCell(currentRow, 7).value = task.detail;
          worksheet.getCell(currentRow, 8).value = task.weeklyHours.week1;
          worksheet.getCell(currentRow, 9).value = task.weeklyHours.week2;
          worksheet.getCell(currentRow, 10).value = task.weeklyHours.week3;
          worksheet.getCell(currentRow, 11).value = task.weeklyHours.week4;
          worksheet.getCell(currentRow, 12).value = task.totalHours;

          currentRow++;
        }

        // 직원 정보 셀 병합 (담당업무, 역할, 이름, 등급, 월공수, 일평균)
        if (employee.tasks.length > 1) {
          worksheet.mergeCells(startRow, 1, currentRow - 1, 1); // 담당업무
          worksheet.mergeCells(startRow, 2, currentRow - 1, 2); // 역할
          worksheet.mergeCells(startRow, 3, currentRow - 1, 3); // 이름
          worksheet.mergeCells(startRow, 4, currentRow - 1, 4); // 등급
          worksheet.mergeCells(startRow, 13, currentRow - 1, 13); // 월공수
          worksheet.mergeCells(startRow, 14, currentRow - 1, 14); // 일평균
        }
      }

      // 모든 셀에 스타일 적용
      for (let row = startRow; row < currentRow; row++) {
        for (let col = 1; col <= 14; col++) {
          const cell = worksheet.getCell(row, col);
          Object.assign(cell, cellStyle);
          
          // 비고 컬럼은 왼쪽 정렬
          if (col === 7) {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
        }
      }
    });

    // Buffer로 변환하여 반환
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
```

## 6. 비즈니스 로직 서비스

### 6.1 Daily Work Service (`daily-work/daily-work.service.ts`)
```typescript
import { Injectable } from '@nestjs/common';
import { DailyWork, EmployeeWork, TaskInfo, WeeklyHours } from '../types/work-report.interface';
import { CreateDailyWorkDto } from './dto/daily-work.dto';

@Injectable()
export class DailyWorkService {
  private dailyWorks: DailyWork[] = [];

  addDailyWork(dto: CreateDailyWorkDto): DailyWork {
    const dailyWork: DailyWork = {
      ...dto,
      difficulty: dto.difficulty || '중'
    };
    this.dailyWorks.push(dailyWork);
    return dailyWork;
  }

  addMultipleDailyWorks(dtos: CreateDailyWorkDto[]): DailyWork[] {
    return dtos.map(dto => this.addDailyWork(dto));
  }

  getWeekOfMonth(dateStr: string): number {
    const date = new Date(dateStr);
    const day = date.getDate();
    
    if (day <= 7) return 1;
    if (day <= 14) return 2;
    if (day <= 21) return 3;
    return 4;
  }

  aggregateMonthlyData(year: number, month: number): EmployeeWork[] {
    // 해당 년월의 데이터만 필터링
    const monthlyWorks = this.dailyWorks.filter(work => {
      const workDate = new Date(work.date);
      return workDate.getFullYear() === year && 
             workDate.getMonth() + 1 === month;
    });

    // 직원별로 그룹화
    const employeeMap = new Map<string, EmployeeWork>();

    monthlyWorks.forEach(work => {
      const key = work.employeeName;
      
      if (!employeeMap.has(key)) {
        employeeMap.set(key, {
          name: work.employeeName,
          role: work.role,
          grade: work.grade,
          department: work.department,
          tasks: [],
          totalMonthlyHours: 0,
          standardHours: 160,
          avgDailyHours: 0
        });
      }

      const employee = employeeMap.get(key);
      
      // 업무별로 시간 집계
      let taskInfo = employee.tasks.find(t => t.taskName === work.task);
      
      if (!taskInfo) {
        taskInfo = {
          taskName: work.task,
          difficulty: work.difficulty || '중',
          detail: work.taskDetail,
          weeklyHours: { week1: 0, week2: 0, week3: 0, week4: 0 },
          totalHours: 0
        };
        employee.tasks.push(taskInfo);
      }

      // 주차별 시간 추가
      const weekNum = this.getWeekOfMonth(work.date);
      taskInfo.weeklyHours[`week${weekNum}`] += work.hours;
      taskInfo.totalHours += work.hours;
      employee.totalMonthlyHours += work.hours;
    });

    // 일평균 근무시간 계산 (월의 실제 근무일수 기준)
    const workingDays = this.getWorkingDaysInMonth(year, month);
    
    const result: EmployeeWork[] = Array.from(employeeMap.values()).map(emp => ({
      ...emp,
      avgDailyHours: Math.round((emp.totalMonthlyHours / workingDays) * 100) / 100
    }));

    return result;
  }

  getWorkingDaysInMonth(year: number, month: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // 주말(토요일=6, 일요일=0) 제외
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  }

  clearData(): void {
    this.dailyWorks = [];
  }

  getDailyWorks(year?: number, month?: number): DailyWork[] {
    if (!year || !month) {
      return this.dailyWorks;
    }

    return this.dailyWorks.filter(work => {
      const workDate = new Date(work.date);
      return workDate.getFullYear() === year && 
             workDate.getMonth() + 1 === month;
    });
  }
}
```

## 7. 컨트롤러 구현

### 7.1 Daily Work Controller (`daily-work/daily-work.controller.ts`)
```typescript
import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Query, 
  Res, 
  HttpStatus,
  Delete
} from '@nestjs/common';
import { Response } from 'express';
import { DailyWorkService } from './daily-work.service';
import { ExcelService } from '../excel/excel.service';
import { CreateDailyWorkDto, GenerateMonthlyReportDto } from './dto/daily-work.dto';

@Controller('daily-work')
export class DailyWorkController {
  constructor(
    private readonly dailyWorkService: DailyWorkService,
    private readonly excelService: ExcelService,
  ) {}

  @Post()
  addDailyWork(@Body() createDailyWorkDto: CreateDailyWorkDto) {
    return {
      success: true,
      data: this.dailyWorkService.addDailyWork(createDailyWorkDto)
    };
  }

  @Post('bulk')
  addMultipleDailyWorks(@Body() dtos: CreateDailyWorkDto[]) {
    return {
      success: true,
      data: this.dailyWorkService.addMultipleDailyWorks(dtos)
    };
  }

  @Get()
  getDailyWorks(
    @Query('year') year?: number,
    @Query('month') month?: number
  ) {
    return {
      success: true,
      data: this.dailyWorkService.getDailyWorks(
        year ? Number(year) : undefined,
        month ? Number(month) : undefined
      )
    };
  }

  @Post('generate-report')
  async generateMonthlyReport(
    @Body() dto: GenerateMonthlyReportDto,
    @Res() res: Response
  ) {
    try {
      // 데이터가 함께 전달된 경우 추가
      if (dto.dailyWorks && dto.dailyWorks.length > 0) {
        this.dailyWorkService.addMultipleDailyWorks(dto.dailyWorks);
      }

      // 월간 데이터 집계
      const employees = this.dailyWorkService.aggregateMonthlyData(
        dto.year,
        dto.month
      );

      if (employees.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '해당 기간의 데이터가 없습니다.'
        });
      }

      // Excel 파일 생성
      const buffer = await this.excelService.generateMonthlyReport(
        dto.year,
        dto.month,
        employees
      );

      // 파일명 생성
      const filename = `${dto.month}월_투입인력별상세업무현황.xlsx`;
      const encodedFilename = encodeURIComponent(filename);

      // 응답 헤더 설정
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodedFilename}"`
      );

      // Buffer 전송
      return res.send(buffer);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '엑셀 생성 중 오류가 발생했습니다.',
        error: error.message
      });
    }
  }

  @Delete()
  clearData() {
    this.dailyWorkService.clearData();
    return {
      success: true,
      message: '모든 데이터가 삭제되었습니다.'
    };
  }
}
```

## 8. 모듈 구성

### 8.1 Excel Module (`excel/excel.module.ts`)
```typescript
import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';

@Module({
  providers: [ExcelService],
  exports: [ExcelService],
})
export class ExcelModule {}
```

### 8.2 Daily Work Module (`daily-work/daily-work.module.ts`)
```typescript
import { Module } from '@nestjs/common';
import { DailyWorkController } from './daily-work.controller';
import { DailyWorkService } from './daily-work.service';
import { ExcelModule } from '../excel/excel.module';

@Module({
  imports: [ExcelModule],
  controllers: [DailyWorkController],
  providers: [DailyWorkService],
})
export class DailyWorkModule {}
```

### 8.3 App Module (`app.module.ts`)
```typescript
import { Module } from '@nestjs/common';
import { DailyWorkModule } from './daily-work/daily-work.module';
import { ExcelModule } from './excel/excel.module';

@Module({
  imports: [DailyWorkModule, ExcelModule],
})
export class AppModule {}
```

### 8.4 Main (`main.ts`)
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
  console.log('Server is running on http://localhost:3000');
}
bootstrap();
```

## 9. API 사용 예시

### 9.1 일일 업무 데이터 추가
```bash
POST http://localhost:3000/daily-work
Content-Type: application/json

{
  "date": "2026-01-26",
  "employeeName": "김진아",
  "role": "PM",
  "grade": "특급",
  "department": "총괄",
  "task": "프로젝트 전체 관리",
  "taskDetail": "오류 수정 대응",
  "hours": 8,
  "difficulty": "상"
}
```

### 9.2 다중 데이터 추가
```bash
POST http://localhost:3000/daily-work/bulk
Content-Type: application/json

[
  {
    "date": "2026-01-26",
    "employeeName": "김진아",
    "role": "PM",
    "grade": "특급",
    "department": "총괄",
    "task": "프로젝트 전체 관리",
    "taskDetail": "오류 수정 대응",
    "hours": 8
  },
  {
    "date": "2026-01-27",
    "employeeName": "김미영",
    "role": "PL",
    "grade": "특급",
    "department": "기획",
    "task": "기획 PL 업무 진행",
    "taskDetail": "기획 업무 분장 및 가이드",
    "hours": 8
  }
]
```

### 9.3 월간 리포트 생성
```bash
POST http://localhost:3000/daily-work/generate-report
Content-Type: application/json

{
  "year": 2026,
  "month": 1
}
```

### 9.4 데이터와 함께 리포트 생성
```bash
POST http://localhost:3000/daily-work/generate-report
Content-Type: application/json

{
  "year": 2026,
  "month": 1,
  "dailyWorks": [
    {
      "date": "2026-01-26",
      "employeeName": "김진아",
      "role": "PM",
      "grade": "특급",
      "department": "총괄",
      "task": "프로젝트 전체 관리",
      "taskDetail": "오류 수정 대응",
      "hours": 8
    }
  ]
}
```

### 9.5 데이터 조회
```bash
# 전체 데이터 조회
GET http://localhost:3000/daily-work

# 특정 년월 데이터 조회
GET http://localhost:3000/daily-work?year=2026&month=1
```

## 10. 실행 방법

```bash
# 패키지 설치
npm install

# 개발 모드 실행
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start
```

## 11. 추가 개선 사항

### 11.1 데이터베이스 연동
```bash
# TypeORM 설치
npm install @nestjs/typeorm typeorm mysql2

# Prisma 설치 (대안)
npm install @prisma/client
npm install -D prisma
```

### 11.2 파일 업로드 처리
```typescript
// 일일업무일지 엑셀 파일 업로드 후 데이터 추출
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  // ExcelJS로 업로드된 파일 파싱
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file.buffer);
  
  // 데이터 추출 및 저장 로직
}
```

### 11.3 스케줄링
```bash
npm install @nestjs/schedule
```

```typescript
// 매월 말일 자동 리포트 생성
@Cron('0 0 * * *')
async generateMonthlyReportAuto() {
  // 자동 리포트 생성 로직
}
```

## 12. 테스트 코드 예시

```typescript
describe('DailyWorkService', () => {
  let service: DailyWorkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyWorkService],
    }).compile();

    service = module.get<DailyWorkService>(DailyWorkService);
  });

  it('주차 계산이 정확해야 함', () => {
    expect(service.getWeekOfMonth('2026-01-05')).toBe(1);
    expect(service.getWeekOfMonth('2026-01-15')).toBe(3);
  });

  it('근무일수 계산이 정확해야 함', () => {
    const workingDays = service.getWorkingDaysInMonth(2026, 1);
    expect(workingDays).toBeGreaterThan(0);
  });
});
```

## 13. 환경 변수 설정 (.env)

```env
PORT=3000
NODE_ENV=development

# 데이터베이스 (선택사항)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=monthly_report
```

이 가이드를 따라 구현하면 일일업무일지 데이터를 기반으로 월간 투입인력별 상세업무현황 엑셀 파일을 자동으로 생성할 수 있습니다.
