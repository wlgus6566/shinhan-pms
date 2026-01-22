'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Schedule, CreateScheduleRequest, TeamScope } from '@/types/schedule';
import { SCHEDULE_TYPE_LABELS, TEAM_SCOPE_LABELS } from '@/types/schedule';
import type { ProjectMember, WorkArea } from '@/types/project';
import { getProjectMembers } from '@/lib/api/projectMembers';

const scheduleFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이하여야 합니다'),
  description: z.string().optional(),
  scheduleType: z.enum(['MEETING', 'SCRUM', 'VACATION', 'HALF_DAY', 'OTHER']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  location: z.string().max(200, '장소는 200자 이하여야 합니다').optional(),
  isAllDay: z.boolean().default(false),
  color: z.string().optional(),
  participantIds: z.array(z.string()).optional(),
  teamScope: z.enum(['ALL', 'PLANNING', 'DESIGN', 'FRONTEND', 'BACKEND']).optional(),
  halfDayType: z.enum(['AM', 'PM']).optional(),
  usageDate: z.string().optional(),
}).refine((data) => {
  // 연차/반차가 아닌 경우 startDate와 endDate 필수
  if (data.scheduleType !== 'VACATION' && data.scheduleType !== 'HALF_DAY') {
    if (!data.startDate) return false;
    if (!data.endDate) return false;
  }
  return true;
}, {
  message: '시작 날짜와 종료 날짜를 입력해주세요',
  path: ['startDate'],
}).refine((data) => {
  // 연차/반차인 경우 usageDate 필수
  if (data.scheduleType === 'VACATION' || data.scheduleType === 'HALF_DAY') {
    if (!data.usageDate) return false;
  }
  return true;
}, {
  message: '사용일을 선택해주세요',
  path: ['usageDate'],
}).refine((data) => {
  // 반차인 경우 halfDayType 필수
  if (data.scheduleType === 'HALF_DAY') {
    if (!data.halfDayType) return false;
  }
  return true;
}, {
  message: '오전/오후를 선택해주세요',
  path: ['halfDayType'],
}).refine((data) => {
  // 종료 날짜가 시작 날짜보다 이후인지 확인 (연차/반차 제외)
  if (data.startDate && data.endDate && data.scheduleType !== 'VACATION' && data.scheduleType !== 'HALF_DAY') {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: '종료 날짜는 시작 날짜보다 이후여야 합니다',
  path: ['endDate'],
}).refine((data) => {
  // MEETING/SCRUM은 장소 필수
  if ((data.scheduleType === 'MEETING' || data.scheduleType === 'SCRUM') && !data.location) {
    return false;
  }
  return true;
}, {
  message: '회의와 스크럼은 장소가 필수입니다',
  path: ['location'],
}).refine((data) => {
  // MEETING/SCRUM은 teamScope 필수
  if ((data.scheduleType === 'MEETING' || data.scheduleType === 'SCRUM') && !data.teamScope) {
    return false;
  }
  return true;
}, {
  message: '팀 범위를 선택해주세요',
  path: ['teamScope'],
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
  schedule?: Schedule | null;
  projectId: string;
  onSubmit: (data: CreateScheduleRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  viewMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ScheduleForm({
  schedule,
  projectId,
  onSubmit,
  onCancel,
  isLoading = false,
  viewMode = false,
  onEdit,
  onDelete,
}: ScheduleFormProps) {
  const isEditing = !!schedule;
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Fetch project members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const members = await getProjectMembers(projectId);
        setProjectMembers(members);
      } catch (error) {
        console.error('Failed to fetch project members:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [projectId]);

  // UTC 시간을 로컬 시간으로 변환하여 datetime-local input에 표시
  const formatDateTimeLocal = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: schedule
      ? {
          title: schedule.title,
          description: schedule.description || '',
          scheduleType: schedule.scheduleType,
          startDate: schedule.startDate ? formatDateTimeLocal(schedule.startDate) : '',
          endDate: schedule.endDate ? formatDateTimeLocal(schedule.endDate) : '',
          location: schedule.location || '',
          isAllDay: schedule.isAllDay,
          color: schedule.color || '',
          participantIds: schedule.participants?.map(p => p.id) || [],
          teamScope: schedule.teamScope,
          halfDayType: schedule.halfDayType,
          usageDate: schedule.usageDate?.slice(0, 10) || '', // Format for date
        }
      : {
          title: '',
          description: '',
          scheduleType: 'MEETING',
          startDate: '',
          endDate: '',
          location: '',
          isAllDay: false,
          color: '',
          participantIds: [],
          teamScope: undefined,
          halfDayType: undefined,
          usageDate: '',
        },
  });

  const handleSubmit = (data: ScheduleFormValues) => {
    let submitData: CreateScheduleRequest;

    if (data.scheduleType === 'VACATION' || data.scheduleType === 'HALF_DAY') {
      // 연차/반차: usageDate를 startDate와 endDate로 변환
      const usageDateTime = new Date(data.usageDate + 'T00:00:00');
      submitData = {
        ...data,
        startDate: usageDateTime.toISOString(),
        endDate: usageDateTime.toISOString(),
        usageDate: data.usageDate,
        halfDayType: data.halfDayType,
      };
    } else {
      // 일반 일정: datetime-local 형식을 ISO 8601 형식으로 변환
      submitData = {
        ...data,
        startDate: new Date(data.startDate!).toISOString(),
        endDate: new Date(data.endDate!).toISOString(),
        teamScope: data.teamScope,
      };
    }

    onSubmit(submitData);
  };

  const scheduleType = form.watch('scheduleType');
  const teamScope = form.watch('teamScope');
  const showParticipants = scheduleType === 'MEETING' || scheduleType === 'SCRUM';
  const isVacation = scheduleType === 'VACATION' || scheduleType === 'HALF_DAY';
  const isHalfDay = scheduleType === 'HALF_DAY';

  // 프로젝트에 있는 팀 범위만 필터링
  const availableTeamScopes = useMemo(() => {
    const workAreas = new Set(projectMembers.map(m => m.workArea));
    const scopes: TeamScope[] = ['ALL']; // Always include ALL

    if (workAreas.has('PLANNING')) scopes.push('PLANNING');
    if (workAreas.has('DESIGN')) scopes.push('DESIGN');
    if (workAreas.has('FRONTEND')) scopes.push('FRONTEND');
    if (workAreas.has('BACKEND')) scopes.push('BACKEND');

    return scopes;
  }, [projectMembers]);

  // 팀 범위에 따라 참가자 자동 선택
  useEffect(() => {
    if (!teamScope || !showParticipants) return;

    const selectedMembers: string[] = [];

    if (teamScope === 'ALL') {
      // 전사 일정: 모든 멤버 선택
      selectedMembers.push(...projectMembers.map(m => String(m.memberId)));
    } else {
      // 팀별 필터링
      const workAreaMap: Record<TeamScope, WorkArea[]> = {
        ALL: [],
        PLANNING: ['PLANNING'],
        DESIGN: ['DESIGN'],
        FRONTEND: ['FRONTEND'],
        BACKEND: ['BACKEND'],
      };

      const targetAreas = workAreaMap[teamScope];
      selectedMembers.push(
        ...projectMembers
          .filter(m => targetAreas.includes(m.workArea))
          .map(m => String(m.memberId))
      );
    }

    form.setValue('participantIds', selectedMembers);
  }, [teamScope, showParticipants, projectMembers, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목 *</FormLabel>
              <FormControl>
                <Input placeholder="일정 제목을 입력하세요" {...field} disabled={viewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduleType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>일정 유형 *</FormLabel>
              {viewMode ? (
                <FormControl>
                  <Input
                    value={SCHEDULE_TYPE_LABELS[field.value]}
                    disabled
                  />
                </FormControl>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="일정 유형 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(SCHEDULE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 회의/스크럼 시 팀 범위 선택 */}
        {showParticipants && (
          <FormField
            control={form.control}
            name="teamScope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>팀 범위 *</FormLabel>
                {viewMode ? (
                  <FormControl>
                    <Input
                      value={field.value ? TEAM_SCOPE_LABELS[field.value] : ''}
                      disabled
                    />
                  </FormControl>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="팀 범위 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTeamScopes.map(scope => (
                        <SelectItem key={scope} value={scope}>
                          {TEAM_SCOPE_LABELS[scope]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 연차/반차 시 사용일 필드 */}
        {isVacation ? (
          <>
            <FormField
              control={form.control}
              name="usageDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사용일 *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={viewMode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 반차 시 오전/오후 선택 */}
            {isHalfDay && (
              <FormField
                control={form.control}
                name="halfDayType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>유형 *</FormLabel>
                    <FormControl>
                      {viewMode ? (
                        <Input
                          value={field.value === 'AM' ? '오전' : field.value === 'PM' ? '오후' : ''}
                          disabled
                        />
                      ) : (
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="AM" id="am" />
                            <Label htmlFor="am" className="cursor-pointer">오전</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PM" id="pm" />
                            <Label htmlFor="pm" className="cursor-pointer">오후</Label>
                          </div>
                        </RadioGroup>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        ) : (
          /* 일반 일정 시 시작일시/종료일시 */
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시작 일시 *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      step="1800"
                      {...field}
                      disabled={viewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>종료 일시 *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      step="1800"
                      {...field}
                      disabled={viewMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                장소{(scheduleType === 'MEETING' || scheduleType === 'SCRUM') && ' *'}
              </FormLabel>
              <FormControl>
                <Input placeholder="장소를 입력하세요 (예: 회의실 A)" {...field} disabled={viewMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showParticipants && (
          <FormField
            control={form.control}
            name="participantIds"
            render={({ field }) => {
              // 팀별로 멤버 그룹핑
              const membersByTeam = {
                PROJECT_MANAGEMENT: projectMembers.filter(m => m.workArea === 'PROJECT_MANAGEMENT'),
                PLANNING: projectMembers.filter(m => m.workArea === 'PLANNING'),
                DESIGN: projectMembers.filter(m => m.workArea === 'DESIGN'),
                FRONTEND: projectMembers.filter(m => m.workArea === 'FRONTEND'),
                BACKEND: projectMembers.filter(m => m.workArea === 'BACKEND'),
              };

              const teamLabels = {
                PROJECT_MANAGEMENT: 'PM/PL',
                PLANNING: '기획팀',
                DESIGN: '디자인팀',
                FRONTEND: '프론트엔드팀',
                BACKEND: '백엔드팀',
              };

              return (
                <FormItem>
                  <FormLabel>참가자</FormLabel>
                  <div className="space-y-4 max-h-96 overflow-y-auto border rounded-md p-4">
                    {loadingMembers ? (
                      <p className="text-sm text-muted-foreground">참가자 목록을 불러오는 중...</p>
                    ) : projectMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">프로젝트 멤버가 없습니다</p>
                    ) : (
                      Object.entries(membersByTeam).map(([team, members]) => {
                        if (members.length === 0) return null;

                        return (
                          <div key={team} className="space-y-2">
                            <h4 className="text-sm font-semibold text-slate-700 border-b pb-1">
                              {teamLabels[team as keyof typeof teamLabels]}
                            </h4>
                            <div className="space-y-2 pl-2">
                              {members.map((member) => (
                                <div key={member.memberId} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={field.value?.includes(String(member.memberId))}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      const memberId = String(member.memberId);
                                      if (checked) {
                                        field.onChange([...currentValue, memberId]);
                                      } else {
                                        field.onChange(currentValue.filter((id) => id !== memberId));
                                      }
                                    }}
                                    disabled={viewMode}
                                  />
                                  <label className="text-sm cursor-pointer">
                                    {member.member?.name || '알 수 없음'} ({member.role})
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="일정에 대한 상세 설명을 입력하세요"
                  className="resize-none"
                  rows={4}
                  {...field}
                  disabled={viewMode}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {viewMode ? (
          <div className="flex justify-end gap-2">
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={onDelete}
              >
                삭제
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              닫기
            </Button>
            {onEdit && (
              <Button
                type="button"
                onClick={onEdit}
              >
                수정
              </Button>
            )}
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : isEditing ? '수정' : '생성'}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
