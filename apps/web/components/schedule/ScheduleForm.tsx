'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
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
import type { Schedule, ScheduleType, CreateScheduleRequest } from '@/types/schedule';
import { SCHEDULE_TYPE_LABELS } from '@/types/schedule';
import type { ProjectMember } from '@/types/project';
import { getProjectMembers } from '@/lib/api/projectMembers';

const scheduleFormSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').max(100, '제목은 100자 이하여야 합니다'),
  description: z.string().optional(),
  scheduleType: z.enum(['MEETING', 'SCRUM', 'VACATION', 'HALF_DAY', 'OTHER']),
  startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
  endDate: z.string().min(1, '종료 날짜를 선택해주세요'),
  location: z.string().max(200, '장소는 200자 이하여야 합니다').optional(),
  isAllDay: z.boolean().default(false),
  color: z.string().optional(),
  participantIds: z.array(z.string()).optional(),
}).refine((data) => {
  // 종료 날짜가 시작 날짜보다 이후인지 확인
  if (data.startDate && data.endDate) {
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
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormProps {
  schedule?: Schedule | null;
  projectId: string;
  onSubmit: (data: CreateScheduleRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ScheduleForm({
  schedule,
  projectId,
  onSubmit,
  onCancel,
  isLoading = false,
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

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: schedule
      ? {
          title: schedule.title,
          description: schedule.description || '',
          scheduleType: schedule.scheduleType,
          startDate: schedule.startDate.slice(0, 16), // Format for datetime-local
          endDate: schedule.endDate.slice(0, 16),
          location: schedule.location || '',
          isAllDay: schedule.isAllDay,
          color: schedule.color || '',
          participantIds: schedule.participants?.map(p => p.id) || [],
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
        },
  });

  const handleSubmit = (data: ScheduleFormValues) => {
    // datetime-local 형식을 ISO 8601 형식으로 변환
    const submitData: CreateScheduleRequest = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };

    onSubmit(submitData);
  };

  const isAllDay = form.watch('isAllDay');
  const scheduleType = form.watch('scheduleType');
  const showParticipants = scheduleType === 'MEETING' || scheduleType === 'SCRUM';

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
                <Input placeholder="일정 제목을 입력하세요" {...field} />
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isAllDay"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>하루 종일</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시작 {isAllDay ? '날짜' : '일시'} *</FormLabel>
                <FormControl>
                  <Input
                    type={isAllDay ? 'date' : 'datetime-local'}
                    {...field}
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
                <FormLabel>종료 {isAllDay ? '날짜' : '일시'} *</FormLabel>
                <FormControl>
                  <Input
                    type={isAllDay ? 'date' : 'datetime-local'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                장소{(scheduleType === 'MEETING' || scheduleType === 'SCRUM') && ' *'}
              </FormLabel>
              <FormControl>
                <Input placeholder="장소를 입력하세요 (예: 회의실 A)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showParticipants && (
          <FormField
            control={form.control}
            name="participantIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>참가자</FormLabel>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-4">
                  {loadingMembers ? (
                    <p className="text-sm text-muted-foreground">참가자 목록을 불러오는 중...</p>
                  ) : projectMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">프로젝트 멤버가 없습니다</p>
                  ) : (
                    projectMembers.map((member) => (
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
                        />
                        <label className="text-sm cursor-pointer">
                          {member.member?.name || '알 수 없음'} ({member.role})
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
      </form>
    </Form>
  );
}
