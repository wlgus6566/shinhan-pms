# Microsoft Graph - Outlook 캘린더 연동 개발 가이드

## 1. 개요

일정 등록 시 Microsoft Graph API를 통해 Outlook 캘린더 이벤트를 생성하고, 참가자에게 자동으로 캘린더 초대 메일이 발송되도록 하는 연동 구조를 설명한다.

### 핵심 흐름

```
프론트엔드 → 백엔드 일정 API → Microsoft Graph API → Outlook 캘린더 이벤트 생성
                                                    → 참가자에게 초대 메일 자동 발송
```

---

## 2. 사전 준비

### 2.1 Azure AD 앱 등록

1. [Azure Portal](https://portal.azure.com) → Azure Active Directory → 앱 등록
2. 새 등록 클릭
   - 이름: `Emotion PMS Calendar Integration`
   - 지원되는 계정 유형: `이 조직 디렉터리의 계정만`
3. 등록 후 아래 값 메모:
   - **Application (client) ID**
   - **Directory (tenant) ID**
4. 인증서 및 비밀 → 새 클라이언트 비밀 → 생성 후 **Value** 메모

### 2.2 API 권한 설정

Azure Portal → 앱 등록 → API 권한 → 권한 추가

| 권한 | 유형 | 설명 |
|-----|------|------|
| `Calendars.ReadWrite` | Application | 모든 사용자 캘린더 읽기/쓰기 |
| `User.Read.All` | Application | 사용자 정보 조회 |


Azure 보안 정책상 무조건 관리자만 가능(현재 로그인한 계정이 테넌트 관리자 권한이 없음)

> **중요**: Application 권한 추가 후 **관리자 동의 부여** 필수

---

## 3. 환경 변수

```bash
# apps/api/.env

# Microsoft Graph API
MS_GRAPH_TENANT_ID=your-tenant-id
MS_GRAPH_CLIENT_ID=your-client-id
MS_GRAPH_CLIENT_SECRET=your-client-secret

# Organizer 계정 (일정 주최자)
MS_GRAPH_ORGANIZER_EMAIL=jihyeon.kim@emotion.co.kr
```

---

## 4. 프론트엔드 → 백엔드 데이터 구조

### 4.1 일정 생성 DTO

```typescript
// @repo/schema/src/schedules/create-schedule.schema.ts
import { z } from 'zod';

export const CreateScheduleSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().optional(),
  startDate: z.string(), // ISO 8601 형식: 2024-01-15T09:00:00
  endDate: z.string(),
  location: z.string().optional(),
  isOnlineMeeting: z.boolean().default(false), // Teams 미팅 여부
  attendees: z.array(
    z.object({
      userId: z.number(),
      email: z.string().email(),
      name: z.string(),
    })
  ),
});

export type CreateScheduleRequest = z.infer<typeof CreateScheduleSchema>;
```

### 4.2 요청 예시

```json
{
  "title": "신한 PMS 킥오프 미팅",
  "description": "프로젝트 범위 및 일정 논의",
  "startDate": "2024-01-15T14:00:00",
  "endDate": "2024-01-15T15:00:00",
  "location": "회의실 A",
  "isOnlineMeeting": true,
  "attendees": [
    { "userId": 1, "email": "lee@emotion.co.kr", "name": "이팀장" },
    { "userId": 2, "email": "park@emotion.co.kr", "name": "박대리" }
  ]
}
```

---

## 5. Microsoft Graph 캘린더 이벤트 생성

### 5.1 API Endpoint

```
POST https://graph.microsoft.com/v1.0/users/{organizer-email}/calendar/events
```

- `{organizer-email}`: 주최자 이메일 (jihyeon.kim@emotion.co.kr)

### 5.2 요청 Payload

```json
{
  "subject": "신한 PMS 킥오프 미팅",
  "body": {
    "contentType": "HTML",
    "content": "<p>프로젝트 범위 및 일정 논의</p>"
  },
  "start": {
    "dateTime": "2024-01-15T14:00:00",
    "timeZone": "Asia/Seoul"
  },
  "end": {
    "dateTime": "2024-01-15T15:00:00",
    "timeZone": "Asia/Seoul"
  },
  "location": {
    "displayName": "회의실 A"
  },
  "attendees": [
    {
      "emailAddress": {
        "address": "lee@emotion.co.kr",
        "name": "이팀장"
      },
      "type": "required"
    },
    {
      "emailAddress": {
        "address": "park@emotion.co.kr",
        "name": "박대리"
      },
      "type": "required"
    }
  ],
  "isOnlineMeeting": true,
  "onlineMeetingProvider": "teamsForBusiness"
}
```

### 5.3 응답 예시 (성공)

```json
{
  "id": "AAMkAGI1AAAt...",
  "subject": "신한 PMS 킥오프 미팅",
  "webLink": "https://outlook.office365.com/calendar/item/...",
  "onlineMeeting": {
    "joinUrl": "https://teams.microsoft.com/l/meetup-join/..."
  }
}
```

> **참고**: 이벤트 생성 시 `attendees`에 포함된 모든 참가자에게 Outlook 캘린더 초대 메일이 **자동 발송**된다.

---

## 6. NestJS 구현

### 6.1 패키지 설치

```bash
pnpm --filter api add @azure/identity @microsoft/microsoft-graph-client
```

### 6.2 OutlookCalendarService

```typescript
// apps/api/src/integrations/outlook-calendar.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

interface Attendee {
  email: string;
  name: string;
}

interface CreateEventParams {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isOnlineMeeting?: boolean;
  attendees: Attendee[];
}

interface CreateEventResult {
  eventId: string;
  webLink: string;
  teamsJoinUrl?: string;
}

@Injectable()
export class OutlookCalendarService {
  private readonly logger = new Logger(OutlookCalendarService.name);
  private graphClient: Client;
  private organizerEmail: string;

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  private initializeClient(): void {
    const tenantId = this.configService.get<string>('MS_GRAPH_TENANT_ID');
    const clientId = this.configService.get<string>('MS_GRAPH_CLIENT_ID');
    const clientSecret = this.configService.get<string>('MS_GRAPH_CLIENT_SECRET');
    this.organizerEmail = this.configService.get<string>('MS_GRAPH_ORGANIZER_EMAIL');

    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default'],
    });

    this.graphClient = Client.initWithMiddleware({ authProvider });
  }

  async createEvent(params: CreateEventParams): Promise<CreateEventResult> {
    const { title, description, startDate, endDate, location, isOnlineMeeting, attendees } = params;

    const eventPayload = {
      subject: title,
      body: {
        contentType: 'HTML',
        content: description ? `<p>${description}</p>` : '',
      },
      start: {
        dateTime: startDate,
        timeZone: 'Asia/Seoul',
      },
      end: {
        dateTime: endDate,
        timeZone: 'Asia/Seoul',
      },
      location: location ? { displayName: location } : undefined,
      attendees: attendees.map((a) => ({
        emailAddress: {
          address: a.email,
          name: a.name,
        },
        type: 'required',
      })),
      isOnlineMeeting: isOnlineMeeting ?? false,
      onlineMeetingProvider: isOnlineMeeting ? 'teamsForBusiness' : undefined,
    };

    try {
      const event = await this.graphClient
        .api(`/users/${this.organizerEmail}/calendar/events`)
        .post(eventPayload);

      this.logger.log(`Outlook 이벤트 생성 완료: ${event.id}`);

      return {
        eventId: event.id,
        webLink: event.webLink,
        teamsJoinUrl: event.onlineMeeting?.joinUrl,
      };
    } catch (error) {
      this.logger.error(`Outlook 이벤트 생성 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.graphClient
        .api(`/users/${this.organizerEmail}/calendar/events/${eventId}`)
        .delete();

      this.logger.log(`Outlook 이벤트 삭제 완료: ${eventId}`);
    } catch (error) {
      this.logger.error(`Outlook 이벤트 삭제 실패: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateEvent(eventId: string, params: Partial<CreateEventParams>): Promise<void> {
    const updatePayload: Record<string, unknown> = {};

    if (params.title) updatePayload.subject = params.title;
    if (params.description) updatePayload.body = { contentType: 'HTML', content: `<p>${params.description}</p>` };
    if (params.startDate) updatePayload.start = { dateTime: params.startDate, timeZone: 'Asia/Seoul' };
    if (params.endDate) updatePayload.end = { dateTime: params.endDate, timeZone: 'Asia/Seoul' };
    if (params.location) updatePayload.location = { displayName: params.location };
    if (params.attendees) {
      updatePayload.attendees = params.attendees.map((a) => ({
        emailAddress: { address: a.email, name: a.name },
        type: 'required',
      }));
    }

    try {
      await this.graphClient
        .api(`/users/${this.organizerEmail}/calendar/events/${eventId}`)
        .patch(updatePayload);

      this.logger.log(`Outlook 이벤트 수정 완료: ${eventId}`);
    } catch (error) {
      this.logger.error(`Outlook 이벤트 수정 실패: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### 6.3 Module 등록

```typescript
// apps/api/src/integrations/integrations.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OutlookCalendarService } from './outlook-calendar.service';

@Module({
  imports: [ConfigModule],
  providers: [OutlookCalendarService],
  exports: [OutlookCalendarService],
})
export class IntegrationsModule {}
```

### 6.4 일정 Service에서 비동기 호출

```typescript
// apps/api/src/schedules/schedules.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OutlookCalendarService } from '../integrations/outlook-calendar.service';
import { CreateScheduleRequest } from '@repo/schema';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    private prisma: PrismaService,
    private outlookCalendar: OutlookCalendarService,
  ) {}

  async create(dto: CreateScheduleRequest, userId: bigint) {
    // 1. DB에 일정 저장
    const schedule = await this.prisma.schedule.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        location: dto.location,
        isOnlineMeeting: dto.isOnlineMeeting,
        createdBy: userId,
      },
    });

    // 2. 참가자 저장
    if (dto.attendees.length > 0) {
      await this.prisma.scheduleAttendee.createMany({
        data: dto.attendees.map((a) => ({
          scheduleId: schedule.id,
          userId: BigInt(a.userId),
          email: a.email,
          createdBy: userId,
        })),
      });
    }

    // 3. Outlook 캘린더 이벤트 생성 (비동기 - 실패해도 일정 생성은 유지)
    this.createOutlookEventAsync(schedule.id, dto);

    return schedule;
  }

  private async createOutlookEventAsync(
    scheduleId: bigint,
    dto: CreateScheduleRequest,
  ): Promise<void> {
    try {
      const result = await this.outlookCalendar.createEvent({
        title: dto.title,
        description: dto.description,
        startDate: dto.startDate,
        endDate: dto.endDate,
        location: dto.location,
        isOnlineMeeting: dto.isOnlineMeeting,
        attendees: dto.attendees.map((a) => ({
          email: a.email,
          name: a.name,
        })),
      });

      // Outlook 이벤트 ID 저장 (수정/삭제 시 필요)
      await this.prisma.schedule.update({
        where: { id: scheduleId },
        data: {
          outlookEventId: result.eventId,
          teamsJoinUrl: result.teamsJoinUrl,
        },
      });

      this.logger.log(`일정 ${scheduleId}에 Outlook 이벤트 연동 완료`);
    } catch (error) {
      this.logger.error(
        `일정 ${scheduleId} Outlook 연동 실패: ${error.message}`,
        error.stack,
      );
      // 실패 시 별도 처리 (재시도 큐, 알림 등) 구현 가능
    }
  }
}
```

---

## 7. 주의사항 및 실무 체크포인트

### 7.1 Organizer 계정

| 항목 | 설명 |
|-----|------|
| 고정 계정 사용 | 현재는 `jihyeon.kim@emotion.co.kr` 고정 |
| 향후 확장 | 일정 생성자의 이메일로 동적 변경 시, 해당 사용자의 캘린더 권한 위임 필요 |
| 권한 | Application 권한(`Calendars.ReadWrite`)은 조직 내 모든 사용자 캘린더 접근 가능 |

### 7.2 실패 처리 전략

```typescript
// 권장 패턴: Fire-and-forget + 로깅
this.createOutlookEventAsync(scheduleId, dto);

// 선택 패턴: 재시도 큐 (Bull, BullMQ 등)
await this.outlookQueue.add('create-event', { scheduleId, dto }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
});
```

- **일정 생성 자체는 성공 처리**: Outlook 연동 실패가 일정 생성을 막지 않음
- **실패 로그 기록**: 모니터링 시스템에서 추적
- **재시도 고려**: 네트워크 오류 등 일시적 실패 대응

### 7.3 타임존 처리

| 항목 | 값 |
|-----|-----|
| Graph API 타임존 | `Asia/Seoul` 고정 |
| 프론트엔드 전송 | ISO 8601 형식 (예: `2024-01-15T14:00:00`) |
| DB 저장 | UTC로 변환하여 저장 권장 |

```typescript
// 프론트엔드: 로컬 시간 그대로 전송
"startDate": "2024-01-15T14:00:00"

// Graph API: timeZone 명시
{
  "start": {
    "dateTime": "2024-01-15T14:00:00",
    "timeZone": "Asia/Seoul"  // 한국 시간으로 해석
  }
}
```

### 7.4 체크리스트

- [ ] Azure AD 앱 등록 완료
- [ ] API 권한 추가 및 관리자 동의 완료
- [ ] 환경 변수 설정 (`.env`)
- [ ] `@azure/identity`, `@microsoft/microsoft-graph-client` 패키지 설치
- [ ] `OutlookCalendarService` 구현 및 Module 등록
- [ ] DB 스키마에 `outlookEventId`, `teamsJoinUrl` 컬럼 추가
- [ ] 일정 생성 시 비동기 Outlook 연동 호출
- [ ] 일정 수정/삭제 시 Outlook 이벤트 동기화 구현
- [ ] 실패 로깅 및 모니터링 설정

---

## 8. 참고 자료

- [Microsoft Graph Calendar API 문서](https://learn.microsoft.com/en-us/graph/api/resources/calendar)
- [Azure Identity 라이브러리](https://www.npmjs.com/package/@azure/identity)
- [Microsoft Graph JS SDK](https://github.com/microsoftgraph/msgraph-sdk-javascript)
