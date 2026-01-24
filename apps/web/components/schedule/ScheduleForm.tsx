'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateScheduleSchema } from '@repo/schema';
import type { CreateScheduleRequest } from '@repo/schema';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormRadioGroup,
} from '@/components/form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { Schedule, TeamScope } from '@/types/schedule';
import { SCHEDULE_TYPE_LABELS, TEAM_SCOPE_LABELS } from '@/types/schedule';
import type { ProjectMember, WorkArea } from '@/types/project';
import { useProjectMembers, getProjectMembers } from '@/lib/api/projectMembers';

type ScheduleFormValues = CreateScheduleRequest;

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
    resolver: zodResolver(CreateScheduleSchema),
    defaultValues: schedule
      ? {
          title: schedule.title,
          description: schedule.description || '',
          scheduleType: schedule.scheduleType,
          startDate: schedule.startDate
            ? formatDateTimeLocal(schedule.startDate)
            : '',
          endDate: schedule.endDate
            ? formatDateTimeLocal(schedule.endDate)
            : '',
          location: schedule.location || '',
          isAllDay: schedule.isAllDay,
          color: schedule.color || '',
          participantIds: schedule.participants?.map((p) => p.id) || [],
          teamScope: schedule.teamScope || undefined,
          halfDayType: schedule.halfDayType || undefined,
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

  // Reset form when schedule or viewMode changes
  useEffect(() => {
    if (schedule) {
      form.reset({
        title: schedule.title,
        description: schedule.description || '',
        scheduleType: schedule.scheduleType,
        startDate: schedule.startDate
          ? formatDateTimeLocal(schedule.startDate)
          : '',
        endDate: schedule.endDate ? formatDateTimeLocal(schedule.endDate) : '',
        location: schedule.location || '',
        isAllDay: schedule.isAllDay,
        color: schedule.color || '',
        participantIds: schedule.participants?.map((p) => p.id) || [],
        teamScope: schedule.teamScope || undefined,
        halfDayType: schedule.halfDayType || undefined,
        usageDate: schedule.usageDate?.slice(0, 10) || '',
      });
    } else {
      form.reset({
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
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, viewMode]);

  // datetime-local 값을 로컬 타임존 기준 ISO 문자열로 변환
  const convertLocalDateTimeToISO = (localDateTime: string) => {
    // datetime-local 형식: "2026-01-21T20:50"
    // 로컬 타임존으로 해석하여 ISO 문자열로 변환
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  const handleSubmit = (data: ScheduleFormValues) => {
    console.log('🔵 [ScheduleForm] handleSubmit called', { data, isEditing });

    let submitData: CreateScheduleRequest;

    if (data.scheduleType === 'VACATION' || data.scheduleType === 'HALF_DAY') {
      // 연차/반차: usageDate를 startDate와 endDate로 변환
      // UTC 기준 00:00:00으로 설정하여 타임존 문제 방지
      const usageDateTime = new Date(data.usageDate + 'T00:00:00Z');

      // 제목 자동 설정
      const autoTitle = data.scheduleType === 'VACATION' ? '연차' :
                        data.halfDayType === 'AM' ? '반차 (오전)' : '반차 (오후)';

      const { halfDayType, teamScope, ...restData } = data;
      submitData = {
        ...restData,
        title: autoTitle,
        startDate: usageDateTime.toISOString(),
        endDate: usageDateTime.toISOString(),
        usageDate: data.usageDate,
        halfDayType: halfDayType ?? undefined,
      };
    } else {
      // 일반 일정: datetime-local 형식을 ISO 8601 형식으로 변환
      const { halfDayType, teamScope, ...restData } = data;
      submitData = {
        ...restData,
        startDate: convertLocalDateTimeToISO(data.startDate!),
        endDate: convertLocalDateTimeToISO(data.endDate!),
        teamScope: teamScope ?? undefined,
      };
    }

    console.log('🔵 [ScheduleForm] submitData:', submitData);
    onSubmit(submitData);
  };

  const scheduleType = form.watch('scheduleType');
  const teamScope = form.watch('teamScope');
  const showParticipants =
    scheduleType === 'MEETING' || scheduleType === 'SCRUM';
  const isVacation = scheduleType === 'VACATION' || scheduleType === 'HALF_DAY';
  const isHalfDay = scheduleType === 'HALF_DAY';

  // 프로젝트에 있는 팀 범위만 필터링
  const availableTeamScopes = useMemo(() => {
    const workAreas = new Set(projectMembers.map((m) => m.workArea));
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
      selectedMembers.push(...projectMembers.map((m) => String(m.memberId)));
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
          .filter((m) => targetAreas.includes(m.workArea))
          .map((m) => String(m.memberId)),
      );
    }

    form.setValue('participantIds', selectedMembers);
  }, [teamScope, showParticipants, projectMembers, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {viewMode ? (
          <FormInput
            control={form.control}
            name="scheduleType"
            label="일정 유형 *"
            disabled
            value={SCHEDULE_TYPE_LABELS[form.watch('scheduleType')]}
          />
        ) : (
          <FormSelect
            control={form.control}
            name="scheduleType"
            label="일정 유형 *"
            placeholder="일정 유형 선택"
            options={Object.entries(SCHEDULE_TYPE_LABELS).map(
              ([value, label]) => ({ value, label }),
            )}
          />
        )}

        {!isVacation && (
          <FormInput
            control={form.control}
            name="title"
            label="제목 *"
            placeholder="일정 제목을 입력하세요"
            disabled={viewMode}
          />
        )}

        {/* 회의/스크럼 시 팀 범위 선택 */}
        {showParticipants &&
          (viewMode ? (
            <FormInput
              control={form.control}
              name="teamScope"
              label="팀 범위 *"
              disabled
              value={
                form.watch('teamScope')
                  ? TEAM_SCOPE_LABELS[form.watch('teamScope')!]
                  : ''
              }
            />
          ) : (
            <FormSelect
              control={form.control}
              name="teamScope"
              label="팀 범위 *"
              placeholder="팀 범위 선택"
              options={availableTeamScopes.map((scope) => ({
                value: scope,
                label: TEAM_SCOPE_LABELS[scope],
              }))}
            />
          ))}

        {/* 연차/반차 시 사용일 필드 */}
        {isVacation ? (
          <>
            <FormInput
              control={form.control}
              name="usageDate"
              label="사용일 *"
              type="date"
              disabled={viewMode}
            />

            {/* 반차 시 오전/오후 선택 */}
            {isHalfDay &&
              (viewMode ? (
                <FormInput
                  control={form.control}
                  name="halfDayType"
                  label="유형 *"
                  disabled
                  value={
                    form.watch('halfDayType') === 'AM'
                      ? '오전'
                      : form.watch('halfDayType') === 'PM'
                        ? '오후'
                        : ''
                  }
                />
              ) : (
                <FormRadioGroup
                  control={form.control}
                  name="halfDayType"
                  label="유형 *"
                  className="flex gap-4"
                  options={[
                    { value: 'AM', label: '오전' },
                    { value: 'PM', label: '오후' },
                  ]}
                />
              ))}
          </>
        ) : (
          /* 일반 일정 시 시작일시/종료일시 */
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="startDate"
              label="시작 일시 *"
              type="datetime-local"
              step="1800"
              disabled={viewMode}
            />

            <FormInput
              control={form.control}
              name="endDate"
              label="종료 일시 *"
              type="datetime-local"
              step="1800"
              disabled={viewMode}
            />
          </div>
        )}
        {scheduleType !== 'VACATION' && scheduleType !== 'HALF_DAY' && (
          <FormInput
            control={form.control}
            name="location"
            label={`장소${scheduleType === 'MEETING' || scheduleType === 'SCRUM' ? ' *' : ''}`}
            placeholder="장소를 입력하세요 (예: 회의실 A)"
            disabled={viewMode}
          />
        )}
        {showParticipants && (
          <FormField
            control={form.control}
            name="participantIds"
            render={({ field }) => {
              // 팀별로 멤버 그룹핑
              const membersByTeam = {
                PROJECT_MANAGEMENT: projectMembers.filter(
                  (m) => m.workArea === 'PROJECT_MANAGEMENT',
                ),
                PLANNING: projectMembers.filter(
                  (m) => m.workArea === 'PLANNING',
                ),
                DESIGN: projectMembers.filter((m) => m.workArea === 'DESIGN'),
                FRONTEND: projectMembers.filter(
                  (m) => m.workArea === 'FRONTEND',
                ),
                BACKEND: projectMembers.filter((m) => m.workArea === 'BACKEND'),
              };

              const teamLabels = {
                PROJECT_MANAGEMENT: 'PM',
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
                      <p className="text-sm text-muted-foreground">
                        참가자 목록을 불러오는 중...
                      </p>
                    ) : projectMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        프로젝트 멤버가 없습니다
                      </p>
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
                                <div
                                  key={member.memberId}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    checked={field.value?.includes(
                                      String(member.memberId),
                                    )}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      const memberId = String(member.memberId);
                                      if (checked) {
                                        field.onChange([
                                          ...currentValue,
                                          memberId,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValue.filter(
                                            (id) => id !== memberId,
                                          ),
                                        );
                                      }
                                    }}
                                    disabled={viewMode}
                                  />
                                  <label className="text-sm cursor-pointer">
                                    {member.member?.name || '알 수 없음'} (
                                    {member.role})
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

        <FormTextarea
          control={form.control}
          name="description"
          label="설명"
          placeholder="일정에 대한 상세 설명을 입력하세요"
          className="resize-none"
          rows={4}
          disabled={viewMode}
        />

        {viewMode ? (
          <div className="flex justify-end gap-2">
            {onDelete && (
              <Button type="button" variant="outline" onClick={onDelete}>
                삭제
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onCancel}>
              닫기
            </Button>
            {onEdit && (
              <Button type="button" onClick={onEdit}>
                수정
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* 디버깅: 폼 에러 표시 */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <p className="font-semibold mb-1">폼 검증 오류:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {Object.entries(form.formState.errors).map(([key, error]) => (
                    <li key={key}>
                      {key}: {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
          </div>
        )}
      </form>
    </Form>
  );
}
