'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateScheduleSchema, RECURRENCE_TYPE_OPTIONS } from '@repo/schema';
import type { CreateScheduleRequest, DayOfWeek } from '@repo/schema';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Form } from '@/components/ui/form';
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormRadioGroup,
  FormCheckboxGroup,
  FormCheckbox,
  FormDateTimePicker,
  FormDaysOfWeekPicker,
} from '@/components/form';
import type {
  Schedule,
  TeamScope,
  ScheduleType,
  HalfDayType,
} from '@/types/schedule';
import { SCHEDULE_TYPE_LABELS, TEAM_SCOPE_LABELS } from '@/types/schedule';
import type { WorkArea } from '@/types/project';
import { useProjectMembers } from '@/lib/api/projectMembers';

type ScheduleFormValues = CreateScheduleRequest;

interface ScheduleFormProps {
  schedule?: Schedule | null;
  projectId: string;
  onSubmit: (data: CreateScheduleRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  viewMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  defaultDate?: Date;
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
  defaultDate,
}: ScheduleFormProps) {
  const isEditing = !!schedule;

  // Fetch project members using SWR hook
  const { members: projectMembers = [], isLoading: loadingMembers } =
    useProjectMembers(projectId);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(CreateScheduleSchema),
    defaultValues: schedule
      ? {
          title: schedule.title ?? '',
          description: schedule.description || '',
          scheduleType: schedule.scheduleType as ScheduleType,
          startDate: schedule.startDate || '',
          endDate: schedule.endDate || '',
          location: schedule.location || '',
          isAllDay: schedule.isAllDay,
          color: schedule.color || '',
          participantIds: schedule.participants?.map((p) => p.id) || [],
          teamScope: (schedule.teamScope as TeamScope) || undefined,
          halfDayType: (schedule.halfDayType as HalfDayType) || undefined,
          usageDate: schedule.usageDate?.slice(0, 10) || '',
          isRecurring: schedule.isRecurring || false,
          recurrenceType:
            (schedule.recurrenceType as
              | 'DAILY'
              | 'WEEKLY'
              | 'MONTHLY'
              | 'YEARLY') || undefined,
          recurrenceEndDate: schedule.recurrenceEndDate?.slice(0, 10) || '',
          recurrenceDaysOfWeek:
            (schedule.recurrenceDaysOfWeek as DayOfWeek[]) || [],
        }
      : {
          title: '',
          description: '',
          scheduleType: 'MEETING',
          startDate: defaultDate ? defaultDate.toISOString() : '',
          endDate: defaultDate ? defaultDate.toISOString() : '',
          location: '',
          isAllDay: false,
          color: '',
          participantIds: [],
          teamScope: undefined,
          halfDayType: undefined,
          usageDate: '',
          isRecurring: false,
          recurrenceType: undefined,
          recurrenceEndDate: '',
          recurrenceDaysOfWeek: [],
        },
  });

  // Reset form when schedule or viewMode changes
  useEffect(() => {
    if (schedule) {
      form.reset({
        title: schedule.title ?? '',
        description: schedule.description || '',
        scheduleType: schedule.scheduleType as ScheduleType,
        startDate: schedule.startDate || '',
        endDate: schedule.endDate || '',
        location: schedule.location || '',
        isAllDay: schedule.isAllDay,
        color: schedule.color || '',
        participantIds: schedule.participants?.map((p) => p.id) || [],
        teamScope: (schedule.teamScope as TeamScope) || undefined,
        halfDayType: (schedule.halfDayType as HalfDayType) || undefined,
        usageDate: schedule.usageDate?.slice(0, 10) || '',
        isRecurring: schedule.isRecurring || false,
        recurrenceType:
          (schedule.recurrenceType as
            | 'DAILY'
            | 'WEEKLY'
            | 'MONTHLY'
            | 'YEARLY') || undefined,
        recurrenceEndDate: schedule.recurrenceEndDate?.slice(0, 10) || '',
        recurrenceDaysOfWeek:
          (schedule.recurrenceDaysOfWeek as DayOfWeek[]) || [],
      });
    } else {
      form.reset({
        title: '',
        description: '',
        scheduleType: 'MEETING',
        startDate: defaultDate ? defaultDate.toISOString() : '',
        endDate: defaultDate ? defaultDate.toISOString() : '',
        location: '',
        isAllDay: false,
        color: '',
        participantIds: [],
        teamScope: undefined,
        halfDayType: undefined,
        usageDate: '',
        isRecurring: false,
        recurrenceType: undefined,
        recurrenceEndDate: '',
        recurrenceDaysOfWeek: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, viewMode]);

  const handleSubmit = async (data: ScheduleFormValues) => {
    console.log('🔵 [ScheduleForm] handleSubmit called', { data, isEditing });

    // 회의/스크럼일 때 팀 범위 필수 검증
    if (
      (data.scheduleType === 'MEETING' || data.scheduleType === 'SCRUM') &&
      !data.teamScope
    ) {
      form.setError('teamScope', { message: '팀 범위를 선택해주세요' });
      return;
    }

    let submitData: CreateScheduleRequest;

    if (data.scheduleType === 'VACATION' || data.scheduleType === 'HALF_DAY') {
      // 연차/반차: usageDate를 startDate와 endDate로 변환
      // UTC 기준 00:00:00으로 설정하여 타임존 문제 방지
      const usageDateTime = new Date(data.usageDate + 'T00:00:00Z');

      // 제목 자동 설정
      const autoTitle =
        data.scheduleType === 'VACATION'
          ? '연차'
          : data.halfDayType === 'AM'
            ? '반차 (오전)'
            : '반차 (오후)';

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
      // 일반 일정: data already contains ISO strings
      const { halfDayType, teamScope, ...restData } = data;

      let finalEndDate = data.endDate!;
      // 정기 일정: endDate의 날짜 부분을 startDate와 동일하게 보정 (timeOnly 모드에서 날짜가 다를 수 있음)
      if (data.isRecurring && data.startDate && data.endDate) {
        const startObj = new Date(data.startDate);
        const endObj = new Date(data.endDate);
        endObj.setFullYear(
          startObj.getFullYear(),
          startObj.getMonth(),
          startObj.getDate(),
        );
        finalEndDate = endObj.toISOString();
      }

      submitData = {
        ...restData,
        startDate: data.startDate!,
        endDate: finalEndDate,
        teamScope: teamScope ?? undefined,
      };
    }

    console.log('🔵 [ScheduleForm] submitData:', submitData);
    await onSubmit(submitData);
  };

  const scheduleType = form.watch('scheduleType');
  const teamScope = form.watch('teamScope');
  const isRecurring = form.watch('isRecurring');
  const recurrenceType = form.watch('recurrenceType');
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

  // 참가자 그룹 데이터 생성
  const participantGroups = useMemo(() => {
    const teamLabels: Record<string, string> = {
      PROJECT_MANAGEMENT: 'PM',
      PLANNING: '기획팀',
      DESIGN: '디자인팀',
      FRONTEND: '프론트엔드팀',
      BACKEND: '백엔드팀',
    };

    return Object.entries(teamLabels).map(([key, label]) => ({
      key,
      label,
      options: projectMembers
        .filter((m) => m.workArea === key)
        .map((m) => ({
          id: String(m.memberId),
          label: m.member?.name || '알 수 없음',
          description: m.role,
        })),
    }));
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
          .filter((m) => targetAreas.includes(m.workArea as WorkArea))
          .map((m) => String(m.memberId)),
      );
    }

    form.setValue('participantIds', selectedMembers);
  }, [teamScope, showParticipants, projectMembers, form]);

  // 연차/반차 선택 시 title을 undefined로 설정 (Zod 검증 통과용)
  useEffect(() => {
    if (isVacation) {
      form.setValue('title', undefined as any);
    }
  }, [isVacation, form]);

  // 매주 반복 선택 시 현재 요일을 기본으로 선택 (생성 모드에서만)
  useEffect(() => {
    // 수정 모드(schedule이 있을 때)에서는 실행하지 않음
    if (schedule) return;

    const currentDaysOfWeek = form.watch('recurrenceDaysOfWeek');
    if (
      recurrenceType === 'WEEKLY' &&
      (!currentDaysOfWeek || currentDaysOfWeek.length === 0)
    ) {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 (일요일) ~ 6 (토요일)
      const dayMap: Record<number, DayOfWeek> = {
        0: 'SUN',
        1: 'MON',
        2: 'TUE',
        3: 'WED',
        4: 'THU',
        5: 'FRI',
        6: 'SAT',
      };
      const currentDay = dayMap[dayOfWeek];
      if (currentDay) {
        form.setValue('recurrenceDaysOfWeek', [currentDay]);
      }
    }
  }, [recurrenceType, form, schedule]);

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

        {isVacation && !viewMode && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              연차/반차는 참여 중인 모든 프로젝트에 자동으로 적용됩니다.
            </span>
          </div>
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
        {!isVacation && (
          <FormCheckbox
            control={form.control}
            name="isRecurring"
            label="정기 일정으로 등록"
            disabled={viewMode}
          />
        )}
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
          /* 모든 일정: 시작 일시 + 종료 일시 */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormDateTimePicker
              control={form.control}
              name="startDate"
              label="시작 일시 *"
              placeholder="시작 날짜를 선택하세요"
              disabled={viewMode}
              showAllDayCheckbox={!isRecurring}
              allDayCheckboxName="isAllDay"
              minTime="08:00"
              maxTime="19:00"
            />

            <FormDateTimePicker
              control={form.control}
              name="endDate"
              label={isRecurring ? '종료 시간 *' : '종료 일시 *'}
              placeholder={
                isRecurring
                  ? '종료 시간을 선택하세요'
                  : '종료 날짜를 선택하세요'
              }
              disabled={viewMode}
              showAllDayCheckbox={!isRecurring}
              allDayCheckboxName="isAllDay"
              timeOnly={isRecurring}
              minTime="08:00"
              maxTime="19:00"
            />
          </div>
        )}

        {scheduleType !== 'VACATION' && scheduleType !== 'HALF_DAY' && (
          <>
            {isRecurring && (
              <div className="space-y-4 rounded-md border border-gray-200 p-4">
                <FormSelect
                  control={form.control}
                  name="recurrenceType"
                  label="반복 유형 *"
                  options={RECURRENCE_TYPE_OPTIONS}
                  placeholder="반복 유형을 선택하세요"
                  disabled={viewMode}
                />

                {recurrenceType === 'WEEKLY' && (
                  <FormDaysOfWeekPicker
                    control={form.control}
                    name="recurrenceDaysOfWeek"
                    label="반복 요일 *"
                    description="반복할 요일을 선택하세요"
                    disabled={viewMode}
                  />
                )}

                <FormInput
                  control={form.control}
                  name="recurrenceEndDate"
                  label="반복 종료일 *"
                  type="date"
                  disabled={viewMode}
                />
              </div>
            )}
          </>
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
          <FormCheckboxGroup
            control={form.control}
            name="participantIds"
            label="참가자"
            groups={participantGroups}
            loading={loadingMembers}
            loadingMessage="참가자 목록을 불러오는 중..."
            emptyMessage="프로젝트 멤버가 없습니다"
            disabled={viewMode}
            maxHeight="max-h-96"
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
              <Button type="button" variant="destructive" onClick={onDelete}>
                삭제
              </Button>
            )}
            {onEdit && (
              <Button type="button" onClick={onEdit}>
                수정
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onCancel}>
              닫기
            </Button>
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
                disabled={isLoading || form.formState.isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isLoading || form.formState.isSubmitting}
              >
                {isLoading || form.formState.isSubmitting
                  ? '저장 중...'
                  : isEditing
                    ? '수정'
                    : '생성'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
